import pool from '../config/database.js';
import emailService from '../services/emailService.js';

export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { customerDetails, items, total, paymentMethod } = req.body;

    // 1. Find or create customer
    // Check if customer exists by email
    const [existingCustomers] = await connection.execute(
      'SELECT id FROM customers WHERE email = ?',
      [customerDetails.email]
    );

    let customerId;
    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
      // Update customer details if needed
      await connection.execute(
        'UPDATE customers SET name = ?, phone = ?, address = ? WHERE id = ?',
        [customerDetails.fullName, customerDetails.phoneNumber, customerDetails.address, customerId]
      );
    } else {
      const [result] = await connection.execute(
        'INSERT INTO customers (name, email, phone, address, source) VALUES (?, ?, ?, ?, ?)',
        [customerDetails.fullName, customerDetails.email, customerDetails.phoneNumber, customerDetails.address, 'web']
      );
      customerId = result.insertId;
    }

    // 2. Create Order
    const [orderResult] = await connection.execute(
      'INSERT INTO ecommerce_orders (customer_id, total_amount, shipping_address, shipping_city, shipping_zip, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [customerId, total, customerDetails.address, customerDetails.city, customerDetails.zipCode, paymentMethod || 'cod']
    );
    const orderId = orderResult.insertId;

    // 3. Process Items and Reduce Stock
    for (const item of items) {
      // Check stock
      const [products] = await connection.execute(
        'SELECT stock_quantity FROM products WHERE id = ? FOR UPDATE',
        [item.id]
      );

      if (products.length === 0) {
        throw new Error(`Product ${item.name} not found`);
      }

      const currentStock = products[0].stock_quantity;
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }

      // Deduct stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.id]
      );

      // Add order item
      await connection.execute(
        'INSERT INTO ecommerce_order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await connection.commit();

    // 4. Send Email Notifications (async, don't wait)
    const orderData = {
      order_id: `ORD-${orderId}`,
      customer_name: customerDetails.fullName,
      customer_email: customerDetails.email,
      customer_phone: customerDetails.phoneNumber,
      total_amount: total,
      payment_method: paymentMethod || 'cod',
      order_date: new Date(),
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    // Send confirmation email to customer
    emailService.sendOrderConfirmation(customerDetails.email, orderData).catch(err => {
      console.error('Failed to send customer confirmation email:', err);
    });

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'tabitakwizerisezerano@gmail.com';
    emailService.sendOrderNotification(adminEmail, orderData).catch(err => {
      console.error('Failed to send admin notification email:', err);
    });

    res.status(201).json({ 
      message: 'Order placed successfully', 
      orderId: `ORD-${orderId}`,
      dbOrderId: orderId 
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  } finally {
    connection.release();
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    // Support searching by ORD-ID format or raw ID
    const dbId = id.startsWith('ORD-') ? id.replace('ORD-', '') : id;

    const [orders] = await pool.execute(`
      SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
      FROM ecommerce_orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ?
    `, [dbId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    const [items] = await pool.execute(`
      SELECT oi.*, p.name, p.image
      FROM ecommerce_order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [dbId]);

    res.json({
      orderId: `ORD-${order.id}`,
      status: order.status,
      total: order.total_amount,
      createdAt: order.created_at,
      customerDetails: {
        fullName: order.customer_name,
        email: order.customer_email,
        phoneNumber: order.customer_phone,
        address: order.shipping_address,
        city: order.shipping_city,
        zipCode: order.shipping_zip
      },
      items: items.map(item => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const [orders] = await pool.execute(`
      SELECT o.*, c.name as customer_name
      FROM ecommerce_orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE c.email = ?
      ORDER BY o.created_at DESC
    `, [email]);

    // For each order, fetch items (this is N+1 but acceptable for user order history which is usually small)
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await pool.execute(`
        SELECT oi.*, p.name, p.image
        FROM ecommerce_order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      return {
        orderId: `ORD-${order.id}`,
        status: order.status,
        total: order.total_amount,
        createdAt: order.created_at,
        customerDetails: {
          fullName: order.customer_name,
          email: email
        },
        items: items.map(item => ({
          id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      };
    }));

    res.json(ordersWithItems);

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
};
