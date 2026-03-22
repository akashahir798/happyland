// =====================================================
// FOOD & BEVERAGE ROUTES
// In-room dining with shopping cart and order tracking
// =====================================================

import { Router } from 'express';
import { query, getClient } from '../database/config.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/food/menu
 * Get full menu with categories
 */
router.get('/menu', async (req, res) => {
  try {
    const { category } = req.query;

    let categoryQuery = '';
    const params = [];

    if (category) {
      categoryQuery = 'WHERE c.name = $1';
      params.push(category);
    }

    const result = await query(
      `SELECT c.id as category_id, c.name as category_name, c.description as category_description,
              m.id as item_id, m.name as item_name, m.description as item_description,
              m.price, m.image_url, m.is_vegetarian, m.is_available,
              m.preparation_time_minutes, m.calories
       FROM menu_categories c
       LEFT JOIN menu_items m ON c.id = m.category_id AND m.is_available = true
       ${categoryQuery}
       ORDER BY c.sort_order, m.name`
    );

    // Group items by category
    const menu = {};
    result.rows.forEach(row => {
      if (!menu[row.category_id]) {
        menu[row.category_id] = {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description,
          items: []
        };
      }

      if (row.item_id) {
        menu[row.category_id].items.push({
          id: row.item_id,
          name: row.item_name,
          description: row.item_description,
          price: parseFloat(row.price),
          imageUrl: row.image_url,
          isVegetarian: row.is_vegetarian,
          isAvailable: row.is_available,
          preparationTimeMinutes: row.preparation_time_minutes,
          calories: row.calories
        });
      }
    });

    res.json({
      success: true,
      data: Object.values(menu)
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu.'
    });
  }
});

/**
 * GET /api/food/categories
 * Get menu categories
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, sort_order
       FROM menu_categories
       WHERE is_active = true
       ORDER BY sort_order`
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        sortOrder: row.sort_order
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories.'
    });
  }
});

/**
 * POST /api/food/orders
 * Create a new food order (shopping cart checkout)
 */
router.post('/orders', authenticateToken, async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { 
      items,           // Array of { menuItemId, quantity, specialRequests }
      bookingId,        // Optional - for room charging
      deliveryLocation, // Room number or location
      specialInstructions 
    } = req.body;

    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item.');
    }

    // Calculate totals and validate items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const itemResult = await client.query(
        'SELECT * FROM menu_items WHERE id = $1 AND is_available = true',
        [item.menuItemId]
      );

      if (itemResult.rows.length === 0) {
        throw new Error(`Menu item ${item.menuItemId} not found or unavailable.`);
      }

      const menuItem = itemResult.rows[0];
      const itemTotal = parseFloat(menuItem.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: parseFloat(menuItem.price),
        subtotal: itemTotal,
        specialRequests: item.specialRequests
      });
    }

    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO food_orders (
        guest_id, booking_id, delivery_location, special_instructions,
        subtotal, tax_amount, total_amount, payment_status, charged_to_room
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
      RETURNING *`,
      [
        req.user.id, 
        bookingId || null,
        deliveryLocation,
        specialInstructions,
        subtotal,
        taxAmount,
        totalAmount,
        !!bookingId
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal, special_requests)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.menuItemId, item.quantity, item.unitPrice, item.subtotal, item.specialRequests]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: {
        id: order.id,
        orderReference: order.order_reference,
        items: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        })),
        subtotal,
        taxAmount,
        totalAmount: parseFloat(order.total_amount),
        status: order.order_status,
        chargedToRoom: order.charged_to_room
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order.'
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/food/orders
 * Get user's orders
 */
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    let queryText = `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'menuItemId', oi.menu_item_id,
                 'name', mi.name,
                 'quantity', oi.quantity,
                 'unitPrice', oi.unit_price,
                 'subtotal', oi.subtotal
               )
             ) as items
      FROM food_orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE o.guest_id = $1
    `;

    const params = [req.user.id];

    if (status) {
      queryText += ` AND o.order_status = $2`;
      params.push(status);
    }

    queryText += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        orderReference: row.order_reference,
        orderStatus: row.order_status,
        deliveryLocation: row.delivery_location,
        specialInstructions: row.special_instructions,
        subtotal: parseFloat(row.subtotal),
        taxAmount: parseFloat(row.tax_amount),
        totalAmount: parseFloat(row.total_amount),
        paymentStatus: row.payment_status,
        chargedToRoom: row.charged_to_room,
        orderedAt: row.ordered_at,
        deliveredAt: row.delivered_at,
        items: row.items.filter(Boolean)
      }))
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders.'
    });
  }
});

/**
 * GET /api/food/orders/:id
 * Get order details
 */
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT o.*,
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'menuItemId', oi.menu_item_id,
                  'name', mi.name,
                  'description', mi.description,
                  'imageUrl', mi.image_url,
                  'quantity', oi.quantity,
                  'unitPrice', oi.unit_price,
                  'subtotal', oi.subtotal,
                  'specialRequests', oi.special_requests
                )
              ) as items
       FROM food_orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = result.rows[0];

    // Verify ownership
    if (order.guest_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        orderReference: order.order_reference,
        orderStatus: order.order_status,
        deliveryLocation: order.delivery_location,
        specialInstructions: order.special_instructions,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.tax_amount),
        totalAmount: parseFloat(order.total_amount),
        paymentStatus: order.payment_status,
        chargedToRoom: order.charged_to_room,
        orderedAt: order.ordered_at,
        deliveredAt: order.delivered_at,
        items: order.items.filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order.'
    });
  }
});

/**
 * PUT /api/food/orders/:id/status
 * Update order status (Admin/Kitchen only)
 */
router.put('/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status transition
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.'
      });
    }

    const orderResult = await query(
      'SELECT * FROM food_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const order = orderResult.rows[0];

    // Set delivered timestamp if status is delivered
    let deliveredAt = null;
    if (status === 'delivered') {
      deliveredAt = new Date();
    }

    await query(
      `UPDATE food_orders 
       SET order_status = $1, delivered_at = $2
       WHERE id = $3`,
      [status, deliveredAt, id]
    );

    res.json({
      success: true,
      message: 'Order status updated.'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status.'
    });
  }
});

export default router;
