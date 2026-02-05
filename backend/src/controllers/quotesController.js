import pool from '../config/database.js';
import emailService from '../services/emailService.js';
import { autoCreateInvoice } from './financeController.js';

export const createQuote = async (req, res) => {
  const { customer_id, items } = req.body;

  // Validation
  if (!customer_id) {
    return res.status(400).json({ error: 'customer_id is required' });
  }

  const subtotal = items ? items.reduce((sum, item) => {
    return sum + (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0));
  }, 0) : 0;
  
  // For now simple total, can add tax later if needed
  const total = subtotal;

  try {
    // Test if customer exists and get their info for email
    const [customerRows] = await pool.execute(
      'SELECT id, name, email FROM customers WHERE id = ?',
      [customer_id]
    );
    
    if (customerRows.length === 0) {
      return res.status(400).json({ error: 'Customer not found' });
    }
    
    const customer = customerRows[0];

    // Create quote
    const [result] = await pool.execute(
      'INSERT INTO quotes (customer_id, created_by, total_amount) VALUES (?, ?, ?)',
      [customer_id, req.user?.id || 1, total]
    );

    const quote_id = result.insertId;
    const createdItems = [];

    // Create quote items if items array exists and quote_items table exists
    if (items && Array.isArray(items)) {
      for (const item of items) {
        try {
          const itemTotal = parseFloat(item.unit_price) * parseInt(item.quantity);
          await pool.execute(
            'INSERT INTO quote_items (quote_id, material_id, description, unit_price, quantity, total) VALUES (?, ?, ?, ?, ?, ?)',
            [quote_id, item.material_id || null, item.description, parseFloat(item.unit_price), parseInt(item.quantity), itemTotal]
          );
          createdItems.push({
            description: item.description,
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price)
          });
        } catch (itemError) {
          console.log('Quote items insertion error:', itemError.message);
        }
      }
    }
    
    // Send email to customer
    if (customer.email) {
      try {
        await emailService.sendQuote(customer.email, {
          quote_id,
          customer_name: customer.name,
          items: createdItems,
          subtotal: subtotal,
          total_amount: total,
          valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        });
        console.log(`Quote email sent to ${customer.email}`);
      } catch (emailErr) {
        console.error('Failed to send quote email:', emailErr);
      }
    }
    
    res.json({ 
      quote_id, 
      total_amount: total, 
      message: 'Quote created successfully and notification sent' 
    });
  } catch (error) {
    console.error('Quote creation error:', error);
    res.status(500).json({ error: 'Quote creation failed' });
  }
};

export const getQuotes = async (req, res) => {
  try {
    const [quotes] = await pool.execute(`
      SELECT q.*, c.name as customer_name 
      FROM quotes q 
      LEFT JOIN customers c ON q.customer_id = c.id 
      ORDER BY q.created_at DESC
    `);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
};

export const getQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const [quote] = await pool.execute(`
      SELECT q.*, c.name as customer_name 
      FROM quotes q 
      LEFT JOIN customers c ON q.customer_id = c.id 
      WHERE q.id = ?
    `, [id]);
    
    if (quote.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    res.json(quote[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
};

export const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Get quote details
    const [quote] = await pool.execute('SELECT * FROM quotes WHERE id = ?', [id]);
    if (quote.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    // Update quote
    await pool.execute('UPDATE quotes SET status = ? WHERE id = ?', [status, id]);
    
    // Auto-create order if quote approved
    if (status === 'approved') {
      const [orderCheck] = await pool.execute('SELECT id FROM orders WHERE quote_id = ?', [id]);
      if (orderCheck.length === 0) {
        const [orderResult] = await pool.execute(
          'INSERT INTO orders (quote_id, customer_id, status, balance) VALUES (?, ?, ?, ?)',
          [id, quote[0].customer_id, 'pending', quote[0].total_amount]
        );
        
        const orderId = orderResult.insertId;
        
        // AUTO-CREATE INVOICE
        try {
          await autoCreateInvoice(orderId, quote[0].total_amount);
          console.log(`Auto-invoice triggered for order ${orderId} via quote approval`);
        } catch (invErr) {
          console.error('Failed to auto-create invoice on quote approval:', invErr);
        }

        // Auto-create work order for design stage
        await pool.execute(
          'INSERT INTO work_orders (order_id, stage, started_at) VALUES (?, ?, NOW())',
          [orderId, 'design']
        );
        
        // Create stock movements for materials in quote items
        try {
          const [items] = await pool.execute('SELECT material_id, quantity FROM quote_items WHERE quote_id = ? AND material_id IS NOT NULL', [id]);
          
          for (const item of items) {
            // Decrement material stock
            await pool.execute(
              'UPDATE materials SET current_stock = current_stock - ? WHERE id = ?',
              [item.quantity, item.material_id]
            );
            
            // Log stock movement
            await pool.execute(
              'INSERT INTO stock_movements (material_id, type, quantity, reference, user_id) VALUES (?, ?, ?, ?, ?)',
              [item.material_id, 'issue', item.quantity, `ORDER-${orderId}`, req.user?.id || 1]
            );
          }
          
          console.log(`Stock movements created for ${items.length} materials on order ${orderId}`);
        } catch (stockError) {
          console.error('Error creating stock movements:', stockError);
        }
      }
    }
    
    res.json({ message: 'Quote updated', order_created: status === 'approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quote' });
  }
};

export const approveQuote = async (req, res) => {
  req.body.status = 'approved';
  return updateQuote(req, res);
};