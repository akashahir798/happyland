// =====================================================
// ROOM MANAGEMENT ROUTES
// Room types, availability, and pricing
// =====================================================

import { Router } from 'express';
import { query, getClient } from '../database/config.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/rooms/types
 * Get all room types (public endpoint)
 */
router.get('/types', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, base_price, max_occupancy, 
              bed_configuration, amenities, room_size_sqft, images
       FROM room_types 
       WHERE is_active = true 
       ORDER BY base_price ASC`
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        basePrice: parseFloat(row.base_price),
        maxOccupancy: row.max_occupancy,
        bedConfiguration: row.bed_configuration,
        amenities: row.amenities,
        roomSizeSqft: row.room_size_sqft,
        images: row.images
      }))
    });
  } catch (error) {
    console.error('Get room types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room types.'
    });
  }
});

/**
 * GET /api/rooms/available
 * Check room availability with date range
 * Query params: checkIn, checkOut, roomTypeId (optional), guests (optional)
 */
router.get('/available', async (req, res) => {
  try {
    const { checkIn, checkOut, roomTypeId, guests } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required.'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date.'
      });
    }

    // Build query to find available rooms
    let queryText = `
      SELECT DISTINCT rt.id, rt.name, rt.description, rt.base_price, 
                      rt.max_occupancy, rt.bed_configuration, rt.amenities, 
                      rt.room_size_sqft, rt.images,
                      (SELECT COUNT(*) FROM rooms r 
                       WHERE r.room_type_id = rt.id 
                       AND r.status = 'available'
                       AND NOT EXISTS (
                         SELECT 1 FROM bookings b
                         WHERE b.assigned_room_id = r.id
                         AND b.status NOT IN ('cancelled', 'completed')
                         AND b.check_in_date < $2
                         AND b.check_out_date > $1
                       )) as available_count
      FROM room_types rt
      JOIN rooms r ON r.room_type_id = rt.id
      WHERE rt.is_active = true
    `;

    const queryParams = [checkInDate, checkOutDate];

    // Filter by room type if specified
    if (roomTypeId) {
      queryText += ` AND rt.id = $${queryParams.length + 1}`;
      queryParams.push(roomTypeId);
    }

    // Filter by guest count
    if (guests) {
      queryText += ` AND rt.max_occupancy >= $${queryParams.length + 1}`;
      queryParams.push(parseInt(guests));
    }

    queryText += ` HAVING available_count > 0 ORDER BY rt.base_price ASC`;

    const result = await query(queryText, queryParams);

    res.json({
      success: true,
      data: {
        checkIn,
        checkOut,
        nights: Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)),
        rooms: result.rows.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description,
          basePrice: parseFloat(row.base_price),
          maxOccupancy: row.max_occupancy,
          bedConfiguration: row.bed_configuration,
          amenities: row.amenities,
          roomSizeSqft: row.room_size_sqft,
          images: row.images,
          availableCount: parseInt(row.available_count)
        }))
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability.'
    });
  }
});

/**
 * GET /api/rooms/:roomTypeId/pricing
 * Get dynamic pricing for a room type
 */
router.get('/:roomTypeId/pricing', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { roomTypeId } = req.params;

    // Get base price and any applicable special pricing
    let queryText = `
      SELECT base_price FROM room_types WHERE id = $1 AND is_active = true
    `;
    const typeResult = await query(queryText, [roomTypeId]);

    if (typeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.'
      });
    }

    let totalPrice = parseFloat(typeResult.rows[0].base_price);
    let appliedDiscount = 0;

    // Check for special pricing
    if (startDate && endDate) {
      const specialPricing = await query(
        `SELECT price, start_date, end_date 
         FROM room_pricing 
         WHERE room_type_id = $1 
         AND is_active = true
         AND start_date <= $3 
         AND end_date >= $2`,
        [roomTypeId, startDate, endDate]
      );

      if (specialPricing.rows.length > 0) {
        // Use the highest applicable price (could be seasonal rate)
        const maxSpecialPrice = Math.max(...specialPricing.rows.map(r => parseFloat(r.price)));
        if (maxSpecialPrice > totalPrice) {
          totalPrice = maxSpecialPrice;
        }
      }
    }

    // Calculate 7-night discount (example: 10% off for stays 7+ nights)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (nights >= 7) {
        appliedDiscount = 10; // 10% discount
        totalPrice = totalPrice * 0.9;
      }
    }

    res.json({
      success: true,
      data: {
        roomTypeId,
        basePrice: parseFloat(typeResult.rows[0].base_price),
        totalPrice: Math.round(totalPrice * 100) / 100,
        discount: appliedDiscount,
        currency: 'USD'
      }
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing.'
    });
  }
});

// =====================
// ADMIN ROUTES
// =====================

/**
 * POST /api/rooms/types
 * Create a new room type (Admin only)
 */
router.post('/types', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { name, description, basePrice, maxOccupancy, bedConfiguration, amenities, roomSizeSqft, images } = req.body;

    const result = await query(
      `INSERT INTO room_types (name, description, base_price, max_occupancy, 
                               bed_configuration, amenities, room_size_sqft, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, basePrice, maxOccupancy, bedConfiguration, amenities, roomSizeSqft, images]
    );

    res.status(201).json({
      success: true,
      message: 'Room type created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create room type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room type.'
    });
  }
});

/**
 * PUT /api/rooms/types/:id
 * Update room type (Admin only)
 */
router.put('/types/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, basePrice, maxOccupancy, bedConfiguration, amenities, roomSizeSqft, images, isActive } = req.body;

    const result = await query(
      `UPDATE room_types 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           base_price = COALESCE($3, base_price),
           max_occupancy = COALESCE($4, max_occupancy),
           bed_configuration = COALESCE($5, bed_configuration),
           amenities = COALESCE($6, amenities),
           room_size_sqft = COALESCE($7, room_size_sqft),
           images = COALESCE($8, images),
           is_active = COALESCE($9, is_active)
       WHERE id = $10
       RETURNING *`,
      [name, description, basePrice, maxOccupancy, bedConfiguration, amenities, roomSizeSqft, images, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.'
      });
    }

    res.json({
      success: true,
      message: 'Room type updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update room type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room type.'
    });
  }
});

/**
 * POST /api/rooms
 * Add a new room to inventory (Admin only)
 */
router.post('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { roomNumber, roomTypeId, floor, notes } = req.body;

    const result = await query(
      `INSERT INTO rooms (room_number, room_type_id, floor, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [roomNumber, roomTypeId, floor, notes]
    );

    res.status(201).json({
      success: true,
      message: 'Room added successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add room.'
    });
  }
});

/**
 * PUT /api/rooms/:id/status
 * Update room status (Admin only)
 */
router.put('/:id/status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE rooms SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.'
      });
    }

    res.json({
      success: true,
      message: 'Room status updated.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update room status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room status.'
    });
  }
});

/**
 * GET /api/rooms/inventory
 * Get all rooms inventory (Admin only)
 */
router.get('/inventory', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, rt.name as room_type_name, rt.base_price
       FROM rooms r
       JOIN room_types rt ON r.room_type_id = rt.id
       ORDER BY r.room_number`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory.'
    });
  }
});

export default router;
