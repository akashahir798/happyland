// =====================================================
// BOOKING ROUTES
// Room booking management with date collision detection
// =====================================================

import { Router } from 'express';
import { query, getClient } from '../database/config.js';
import { authenticateToken, adminOnly, guestOrAdmin, staffOrAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/bookings
 * Create a new room booking
 * Complex date collision logic implemented here
 */
router.post('/', authenticateToken, async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { 
      roomTypeId, 
      checkInDate, 
      checkOutDate, 
      numberOfGuests, 
      specialRequests 
    } = req.body;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past.');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date.');
    }

    // Get room type details
    const typeResult = await client.query(
      `SELECT id, base_price, max_occupancy FROM room_types WHERE id = $1 AND is_active = true`,
      [roomTypeId]
    );

    if (typeResult.rows.length === 0) {
      throw new Error('Room type not found.');
    }

    const roomType = typeResult.rows[0];

    // Validate guest count
    if (numberOfGuests > roomType.max_occupancy) {
      throw new Error(`Maximum occupancy for this room type is ${roomType.max_occupancy} guests.`);
    }

    // ==========================================
    // DATE COLLISION DETECTION ALGORITHM
    // ==========================================
    // This ensures no overlapping bookings for the same room type
    //
    // Collision occurs when:
    // NEW.check_in < EXISTING.check_out AND NEW.check_out > EXISTING.check_in
    //
    // Visual representation:
    // [---Existing Booking---]
    //         [---New Booking---]  = COLLISION
    // [---New Booking---]
    //         [---Existing---]      = COLLISION
    // 
    // Valid scenarios:
    // [---Existing---] [---New---] = OK (existing ends before new starts)
    // [---New---] [---Existing---] = OK (new ends before existing starts)

    const collisionCheck = await client.query(
      `SELECT COUNT(*) as collision_count
       FROM bookings
       WHERE room_type_id = $1
       AND status NOT IN ('cancelled', 'completed', 'checked_out')
       AND (
         (check_in_date < $3 AND check_out_date > $2)
       )`,
      [roomTypeId, checkIn, checkOut]
    );

    if (parseInt(collisionCheck.rows[0].collision_count) > 0) {
      throw new Error('Selected dates are not available. Please choose different dates.');
    }

    // Calculate pricing
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const basePrice = parseFloat(roomType.base_price);
    
    // Apply dynamic pricing (weekend surcharge, length-of-stay discount)
    let totalPrice = basePrice * nights;
    let discountApplied = 0;

    // Check for weekend (Friday and Saturday)
    let weekendNights = 0;
    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(checkIn);
      currentDate.setDate(currentDate.getDate() + i);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday = 5, Saturday = 6
        weekendNights++;
      }
    }

    if (weekendNights > 0) {
      totalPrice += weekendNights * (basePrice * 0.15); // 15% weekend surcharge
    }

    // Length of stay discount (7+ nights = 10% off)
    if (nights >= 7) {
      discountApplied = 10;
      totalPrice = totalPrice * 0.9;
    }

    totalPrice = Math.round(totalPrice * 100) / 100;

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        guest_id, room_type_id, check_in_date, check_out_date,
        number_of_guests, base_price, total_amount, special_requests, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *`,
      [
        req.user.id, roomTypeId, checkIn, checkOut,
        numberOfGuests || 1, basePrice, totalPrice, specialRequests
      ]
    );

    const booking = bookingResult.rows[0];

    // Log booking history
    await client.query(
      `INSERT INTO booking_history (booking_id, new_status, changed_by)
       VALUES ($1, 'pending', $2)`,
      [booking.id, req.user.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: {
        id: booking.id,
        bookingReference: booking.booking_reference,
        roomTypeId: booking.room_type_id,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        nights,
        numberOfGuests: booking.number_of_guests,
        basePrice,
        totalAmount: parseFloat(booking.total_amount),
        discountApplied,
        status: booking.status,
        specialRequests: booking.special_requests
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create booking.'
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/bookings
 * Get current user's bookings
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    let queryText = `
      SELECT b.*, rt.name as room_type_name, rt.images as room_images
      FROM bookings b
      JOIN room_types rt ON b.room_type_id = rt.id
      WHERE b.guest_id = $1
    `;

    const params = [req.user.id];

    if (status) {
      queryText += ` AND b.status = $2`;
      params.push(status);
    }

    queryText += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        bookingReference: row.booking_reference,
        roomType: {
          id: row.room_type_id,
          name: row.room_type_name,
          images: row.room_images
        },
        checkInDate: row.check_in_date,
        checkOutDate: row.check_out_date,
        numberOfGuests: row.number_of_guests,
        basePrice: parseFloat(row.base_price),
        totalAmount: parseFloat(row.total_amount),
        paidAmount: parseFloat(row.paid_amount),
        status: row.status,
        specialRequests: row.special_requests,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.'
    });
  }
});

/**
 * GET /api/bookings/:id
 * Get booking details by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT b.*, rt.name as room_type_name, rt.description as room_description,
              rt.amenities, r.room_number
       FROM bookings b
       JOIN room_types rt ON b.room_type_id = rt.id
       LEFT JOIN rooms r ON b.assigned_room_id = r.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    const booking = result.rows[0];

    // Verify ownership or admin access
    if (booking.guest_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    res.json({
      success: true,
      data: {
        id: booking.id,
        bookingReference: booking.booking_reference,
        roomType: {
          id: booking.room_type_id,
          name: booking.room_type_name,
          description: booking.room_description,
          amenities: booking.amenities
        },
        assignedRoom: booking.assigned_room_id ? {
          roomNumber: booking.room_number
        } : null,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        actualCheckIn: booking.actual_check_in,
        actualCheckOut: booking.actual_check_out,
        numberOfGuests: booking.number_of_guests,
        pricing: {
          basePrice: parseFloat(booking.base_price),
          totalAmount: parseFloat(booking.total_amount),
          paidAmount: parseFloat(booking.paid_amount),
          outstanding: parseFloat(booking.total_amount) - parseFloat(booking.paid_amount)
        },
        status: booking.status,
        specialRequests: booking.special_requests,
        cancellation: {
          cancelledAt: booking.cancelled_at,
          reason: booking.cancellation_reason
        },
        createdAt: booking.created_at
      }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking.'
    });
  }
});

/**
 * PUT /api/bookings/:id/cancel
 * Cancel a booking
 */
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { reason } = req.body;

    // Get booking
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found.');
    }

    const booking = bookingResult.rows[0];

    // Verify ownership
    if (booking.guest_id !== req.user.id && req.user.role !== 'admin') {
      throw new Error('Access denied.');
    }

    // Check if cancellable
    if (['cancelled', 'completed', 'checked_out'].includes(booking.status)) {
      throw new Error('Booking cannot be cancelled in current status.');
    }

    // Update booking
    await client.query(
      `UPDATE bookings 
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = $1
       WHERE id = $2`,
      [reason, id]
    );

    // Log history
    await client.query(
      `INSERT INTO booking_history (booking_id, new_status, changed_by, change_reason)
       VALUES ($1, 'cancelled', $2, $3)`,
      [id, req.user.id, reason]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Booking cancelled successfully.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel booking error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel booking.'
    });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/bookings/:id/check-in
 * Check in guest (Admin/Staff only)
 */
router.put('/:id/check-in', authenticateToken, staffOrAdmin, async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { roomId } = req.body;

    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found.');
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'confirmed') {
      throw new Error('Only confirmed bookings can be checked in.');
    }

    // Update booking and room status
    await client.query(
      `UPDATE bookings 
       SET status = 'checked_in', actual_check_in = CURRENT_TIMESTAMP, assigned_room_id = $1
       WHERE id = $2`,
      [roomId, id]
    );

    if (roomId) {
      await client.query(
        "UPDATE rooms SET status = 'occupied' WHERE id = $1",
        [roomId]
      );
    }

    // Log history
    await client.query(
      `INSERT INTO booking_history (booking_id, new_status, changed_by)
       VALUES ($1, 'checked_in', $2)`,
      [id, req.user.id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Guest checked in successfully.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to check in guest.'
    });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/bookings/:id/check-out
 * Check out guest (Admin/Staff only)
 */
router.put('/:id/check-out', authenticateToken, staffOrAdmin, async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found.');
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'checked_in') {
      throw new Error('Only checked-in bookings can be checked out.');
    }

    // Update booking and room status
    await client.query(
      `UPDATE bookings 
       SET status = 'checked_out', actual_check_out = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    );

    if (booking.assigned_room_id) {
      await client.query(
        "UPDATE rooms SET status = 'available' WHERE id = $1",
        [booking.assigned_room_id]
      );
    }

    // Log history
    await client.query(
      `INSERT INTO booking_history (booking_id, new_status, changed_by)
       VALUES ($1, 'checked_out', $2)`,
      [id, req.user.id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Guest checked out successfully.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to check out guest.'
    });
  } finally {
    client.release();
  }
});

export default router;
