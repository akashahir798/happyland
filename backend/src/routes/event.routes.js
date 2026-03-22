// =====================================================
// EVENT MANAGEMENT ROUTES
// Conference hall and banquet room bookings
// =====================================================

import { Router } from 'express';
import { query } from '../database/config.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/events/spaces
 * Get all event spaces
 */
router.get('/spaces', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, capacity, area_sqft, 
              hourly_rate, daily_rate, amenities, images, is_active
       FROM event_spaces
       WHERE is_active = true
       ORDER BY capacity ASC`
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        capacity: row.capacity,
        areaSqft: row.area_sqft,
        hourlyRate: parseFloat(row.hourly_rate),
        dailyRate: row.daily_rate ? parseFloat(row.daily_rate) : null,
        amenities: row.amenities,
        images: row.images
      }))
    });
  } catch (error) {
    console.error('Get event spaces error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event spaces.'
    });
  }
});

/**
 * GET /api/events/spaces/:id
 * Get event space details
 */
router.get('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM event_spaces WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event space not found.'
      });
    }

    const space = result.rows[0];

    res.json({
      success: true,
      data: {
        id: space.id,
        name: space.name,
        description: space.description,
        capacity: space.capacity,
        areaSqft: space.area_sqft,
        hourlyRate: parseFloat(space.hourly_rate),
        dailyRate: space.daily_rate ? parseFloat(space.daily_rate) : null,
        amenities: space.amenities,
        images: space.images
      }
    });
  } catch (error) {
    console.error('Get event space error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event space.'
    });
  }
});

/**
 * GET /api/events/availability
 * Check event space availability for a date
 */
router.get('/availability', async (req, res) => {
  try {
    const { date, spaceId, startTime, endTime } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required.'
      });
    }

    let queryText = `
      SELECT es.*,
             (SELECT COUNT(*) FROM event_bookings eb
              WHERE eb.event_space_id = es.id
              AND eb.event_date = $1
              AND eb.status NOT IN ('cancelled')
    `;

    const params = [date];

    if (spaceId) {
      queryText += ` AND eb.event_space_id = $2`;
      params.push(spaceId);
    }

    if (startTime && endTime) {
      queryText += ` AND (
        (eb.start_time < $${params.length + 1} AND eb.end_time > $${params.length + 2})
      )`;
      params.push(endTime, startTime);
    }

    queryText += `) as conflicting_bookings FROM event_spaces es WHERE es.is_active = true`;

    if (spaceId) {
      queryText += ` AND es.id = $2`;
    }

    queryText += ` HAVING conflicting_bookings = 0`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: {
        date,
        availableSpaces: result.rows.map(row => ({
          id: row.id,
          name: row.name,
          capacity: row.capacity,
          hourlyRate: parseFloat(row.hourly_rate)
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
 * POST /api/events
 * Create event booking inquiry
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      eventSpaceId,
      eventName,
      eventDescription,
      eventDate,
      startTime,
      endTime,
      expectedAttendees,
      cateringRequired,
      requiredEquipment,
      specialRequests
    } = req.body;

    // Check if date/time is available
    const conflictCheck = await query(
      `SELECT COUNT(*) as conflicts
       FROM event_bookings
       WHERE event_space_id = $1
       AND event_date = $2
       AND status NOT IN ('cancelled')
       AND (start_time < $4 AND end_time > $3)`,
      [eventSpaceId, eventDate, endTime, startTime]
    );

    if (parseInt(conflictCheck.rows[0].conflicts) > 0) {
      return res.status(409).json({
        success: false,
        message: 'Selected time slot is not available.'
      });
    }

    // Get space details for pricing
    const spaceResult = await query(
      'SELECT * FROM event_spaces WHERE id = $1',
      [eventSpaceId]
    );

    if (spaceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event space not found.'
      });
    }

    const space = spaceResult.rows[0];

    // Calculate estimated price
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const durationHours = (end - start) / (1000 * 60 * 60);
    const estimatedPrice = durationHours * parseFloat(space.hourly_rate);

    // Create booking
    const result = await query(
      `INSERT INTO event_bookings (
        organizer_id, event_space_id, event_name, event_description,
        event_date, start_time, end_time, expected_attendees,
        catering_required, required_equipment, quoted_price, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'inquiry')
      RETURNING *`,
      [
        req.user.id, eventSpaceId, eventName, eventDescription,
        eventDate, startTime, endTime, expectedAttendees,
        cateringRequired, requiredEquipment, estimatedPrice
      ]
    );

    const booking = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Event booking inquiry submitted.',
      data: {
        id: booking.id,
        bookingReference: booking.booking_reference,
        eventName: booking.event_name,
        eventDate: booking.event_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        estimatedPrice: parseFloat(booking.quoted_price),
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Create event booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event booking.'
    });
  }
});

/**
 * GET /api/events
 * Get user's event bookings
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT eb.*, es.name as space_name, es.capacity
       FROM event_bookings eb
       JOIN event_spaces es ON eb.event_space_id = es.id
       WHERE eb.organizer_id = $1
       ORDER BY eb.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        bookingReference: row.booking_reference,
        eventName: row.event_name,
        eventDescription: row.event_description,
        eventDate: row.event_date,
        startTime: row.start_time,
        endTime: row.end_time,
        expectedAttendees: row.expected_attendees,
        space: {
          id: row.event_space_id,
          name: row.space_name,
          capacity: row.capacity
        },
        status: row.status,
        quotedPrice: parseFloat(row.quoted_price),
        finalPrice: row.final_price ? parseFloat(row.final_price) : null,
        cateringRequired: row.catering_required,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Get event bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event bookings.'
    });
  }
});

/**
 * PUT /api/events/:id/status
 * Update event booking status (Admin only)
 */
router.put('/:id/status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, finalPrice } = req.body;

    const result = await query(
      `UPDATE event_bookings 
       SET status = $1, final_price = COALESCE($2, quoted_price)
       WHERE id = $3
       RETURNING *`,
      [status, finalPrice, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event booking not found.'
      });
    }

    res.json({
      success: true,
      message: 'Event status updated.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event status.'
    });
  }
});

export default router;
