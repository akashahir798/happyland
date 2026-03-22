// =====================================================
// ADMIN DASHBOARD ROUTES
// Analytics, inventory management, and system overview
// =====================================================

import { Router } from 'express';
import { query } from '../database/config.js';
import { authenticateToken, adminOnly } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/admin/dashboard
 * Get dashboard overview with key metrics
 */
router.get('/dashboard', authenticateToken, adminOnly, async (req, res) => {
  try {
    // Get key metrics in parallel
    const [
      occupancyResult,
      bookingsResult,
      revenueResult,
      ordersResult
    ] = await Promise.all([
      // Current occupancy
      query(`SELECT 
              COUNT(*) FILTER (WHERE status = 'occupied') as occupied_rooms,
              COUNT(*) FILTER (WHERE status = 'available') as available_rooms,
              COUNT(*) FILTER (WHERE status = 'reserved') as reserved_rooms,
              COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_rooms
             FROM rooms`),
      
      // Today's bookings
      query(`SELECT 
              COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
              COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
              COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as new_bookings_today
             FROM bookings`),
      
      // Revenue (this month)
      query(`SELECT 
              COALESCE(SUM(total_amount), 0) as monthly_revenue,
              COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as completed_revenue
             FROM bookings 
             WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`),
      
      // Recent orders
      query(`SELECT 
              COUNT(*) FILTER (WHERE order_status = 'pending') as pending_orders,
              COUNT(*) FILTER (WHERE order_status = 'preparing') as preparing_orders,
              COUNT(*) FILTER (WHERE DATE(ordered_at) = CURRENT_DATE) as orders_today
             FROM food_orders`)
    ]);

    res.json({
      success: true,
      data: {
        occupancy: {
          occupied: parseInt(occupancyResult.rows[0].occupied_rooms),
          available: parseInt(occupancyResult.rows[0].available_rooms),
          reserved: parseInt(occupancyResult.rows[0].reserved_rooms),
          maintenance: parseInt(occupancyResult.rows[0].maintenance_rooms),
          total: parseInt(occupancyResult.rows[0].occupied_rooms) + 
                 parseInt(occupancyResult.rows[0].available_rooms) +
                 parseInt(occupancyResult.rows[0].reserved_rooms) +
                 parseInt(occupancyResult.rows[0].maintenance_rooms)
        },
        bookings: {
          pending: parseInt(bookingsResult.rows[0].pending_bookings),
          confirmed: parseInt(bookingsResult.rows[0].confirmed_bookings),
          newToday: parseInt(bookingsResult.rows[0].new_bookings_today)
        },
        revenue: {
          monthly: parseFloat(revenueResult.rows[0].monthly_revenue),
          completed: parseFloat(revenueResult.rows[0].completed_revenue)
        },
        orders: {
          pending: parseInt(ordersResult.rows[0].pending_orders),
          preparing: parseInt(ordersResult.rows[0].preparing_orders),
          ordersToday: parseInt(ordersResult.rows[0].orders_today)
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data.'
    });
  }
});

/**
 * GET /api/admin/analytics/revenue
 * Get revenue analytics
 */
router.get('/analytics/revenue', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query; // Last N days

    const result = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
       FROM bookings
       WHERE created_at >= CURRENT_DATE - INTERVAL '${parseInt(period)} days'
       AND status NOT IN ('cancelled')
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      []
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        bookings: parseInt(row.bookings),
        revenue: parseFloat(row.revenue)
      }))
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue analytics.'
    });
  }
});

/**
 * GET /api/admin/analytics/occupancy
 * Get occupancy rates by room type
 */
router.get('/analytics/occupancy', authenticateToken, adminOnly, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        rt.name as room_type,
        rt.base_price,
        COUNT(r.id) as total_rooms,
        COUNT(*) FILTER (WHERE r.status = 'available') as available,
        COUNT(*) FILTER (WHERE r.status = 'occupied') as occupied,
        COUNT(*) FILTER (WHERE r.status = 'reserved') as reserved
       FROM room_types rt
       LEFT JOIN rooms r ON rt.id = r.room_type_id
       WHERE rt.is_active = true
       GROUP BY rt.id, rt.name, rt.base_price
       ORDER BY rt.base_price ASC`
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        roomType: row.room_type,
        basePrice: parseFloat(row.base_price),
        totalRooms: parseInt(row.total_rooms),
        available: parseInt(row.available),
        occupied: parseInt(row.occupied),
        reserved: parseInt(row.reserved),
        occupancyRate: row.total_rooms > 0 
          ? Math.round((parseInt(row.occupied) + parseInt(row.reserved)) / parseInt(row.total_rooms) * 100)
          : 0
      }))
    });
  } catch (error) {
    console.error('Occupancy analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch occupancy analytics.'
    });
  }
});

/**
 * GET /api/admin/bookings
 * Get all bookings (admin view)
 */
router.get('/bookings', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status, date, limit = 20, offset = 0 } = req.query;

    let queryText = `
      SELECT b.*, u.email, u.first_name, u.last_name, rt.name as room_type_name
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      JOIN room_types rt ON b.room_type_id = rt.id
    `;

    const params = [];
    const conditions = [];

    if (status) {
      conditions.push(`b.status = $${params.length + 1}`);
      params.push(status);
    }

    if (date) {
      conditions.push(`b.check_in_date = $${params.length + 1}`);
      params.push(date);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        bookingReference: row.booking_reference,
        guest: {
          id: row.guest_id,
          name: `${row.first_name} ${row.last_name}`,
          email: row.email
        },
        roomType: row.room_type_name,
        checkInDate: row.check_in_date,
        checkOutDate: row.check_out_date,
        totalAmount: parseFloat(row.total_amount),
        paidAmount: parseFloat(row.paid_amount),
        status: row.status,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings.'
    });
  }
});

/**
 * PUT /api/admin/bookings/:id/confirm
 * Confirm a pending booking
 */
router.put('/bookings/:id/confirm', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE bookings SET status = 'confirmed' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Log history
    await query(
      `INSERT INTO booking_history (booking_id, new_status, changed_by)
       VALUES ($1, 'confirmed', $2)`,
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Booking confirmed.'
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm booking.'
    });
  }
});

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { role, limit = 20, offset = 0 } = req.query;

    let queryText = `
      SELECT id, email, first_name, last_name, phone, role, is_active, created_at
      FROM users
    `;

    const params = [];

    if (role) {
      queryText += ` WHERE role = $1`;
      params.push(role);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        role: row.role,
        isActive: row.is_active,
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.'
    });
  }
});

/**
 * PUT /api/admin/users/:id/toggle-status
 * Toggle user active status
 */
router.put('/users/:id/toggle-status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE users 
       SET is_active = NOT is_active 
       WHERE id = $1 
       RETURNING id, is_active`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      message: `User ${result.rows[0].is_active ? 'activated' : 'deactivated'} successfully.`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status.'
    });
  }
});

export default router;
