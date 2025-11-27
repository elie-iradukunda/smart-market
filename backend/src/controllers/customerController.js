import pool from '../config/database.js';

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, source } = req.body;
    
    // Check for duplicate email or phone
    const [existing] = await pool.execute(
      'SELECT id FROM customers WHERE email = ? OR phone = ?',
      [email, phone]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Customer with this email or phone already exists' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO customers (name, phone, email, address, source) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email, address, source]
    );
    res.status(200).json({ id: result.insertId, message: 'Customer created' });
  } catch (error) {
    res.status(500).json({ error: 'Customer creation failed' });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const [customers] = await pool.execute('SELECT * FROM customers ORDER BY name');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [customer] = await pool.execute('SELECT * FROM customers WHERE id = ?', [id]);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, source } = req.body;
    
    // Check if customer exists
    const [existing] = await pool.execute('SELECT id FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check for duplicate email or phone (excluding current customer)
    const [duplicate] = await pool.execute(
      'SELECT id FROM customers WHERE (email = ? OR phone = ?) AND id != ?',
      [email, phone, id]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Customer with this email or phone already exists' });
    }
    
    await pool.execute(
      'UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, source = ? WHERE id = ?',
      [name, phone, email, address, source, id]
    );
    res.json({ message: 'Customer updated' });
  } catch (error) {
    res.status(500).json({ error: 'Customer update failed' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Customer deletion failed' });
  }
};

export const createLead = async (req, res) => {
  try {
    // Support both direct customer_id and UI payload with full customer details
    const { customer_id, customer_name, name, phone, email, address, source, channel, items } = req.body;

    // For now we require an existing customer_id; UI can ensure customer is created first
    const resolvedCustomerId = customer_id;
    if (!resolvedCustomerId) {
      return res.status(400).json({ error: 'customer_id is required to create a lead' });
    }

    // Make sure customer exists
    const [customerRows] = await pool.execute('SELECT id FROM customers WHERE id = ?', [resolvedCustomerId]);
    if (customerRows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const normalizedChannel = channel || 'unknown';

    // Prevent duplicate lead for same customer and channel
    const [existing] = await pool.execute(
      'SELECT id FROM leads WHERE customer_id = ? AND channel = ?',
      [resolvedCustomerId, normalizedChannel]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Lead already exists for this customer and channel' });
    }

    const [result] = await pool.execute(
      'INSERT INTO leads (customer_id, channel) VALUES (?, ?)',
      [resolvedCustomerId, normalizedChannel]
    );

    const leadId = result.insertId;

    // If the UI sent requested materials/products, persist them in lead_items
    if (Array.isArray(items) && items.length > 0) {
      for (const row of items) {
        if (!row) continue;
        const materialId = Number(row.material_id || row.materialId);
        const qty = Number(row.quantity || row.qty || 0);
        if (!materialId || !Number.isFinite(qty) || qty <= 0) continue;

        await pool.execute(
          'INSERT INTO lead_items (lead_id, material_id, quantity, notes) VALUES (?, ?, ?, ?)',
          [leadId, materialId, qty, null]
        );
      }
    }

    res.status(201).json({ id: leadId, message: 'Lead created' });
  } catch (error) {
    res.status(500).json({ error: 'Lead creation failed' });
  }
};

export const getLeads = async (req, res) => {
  try {
    const [leads] = await pool.execute(
      'SELECT l.*, c.name as customer_name FROM leads l JOIN customers c ON l.customer_id = c.id ORDER BY l.id DESC'
    );
    res.json(leads);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

export const getLead = async (req, res) => {
  try {
    const { id } = req.params;
    const [lead] = await pool.execute(
      'SELECT l.*, c.name as customer_name FROM leads l JOIN customers c ON l.customer_id = c.id WHERE l.id = ?',
      [id]
    );
    if (lead.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Load any requested materials/products captured on this lead
    const [items] = await pool.execute(
      `SELECT li.id, li.material_id, li.quantity, li.notes, m.name as material_name
         FROM lead_items li
         JOIN materials m ON li.material_id = m.id
        WHERE li.lead_id = ?`,
      [id]
    );

    res.json({ ...lead[0], items });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, channel } = req.body;
    
    // Check if lead exists
    const [existing] = await pool.execute('SELECT id FROM leads WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    // Check if customer exists
    const [customer] = await pool.execute('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check for duplicate lead (excluding current lead)
    const [duplicate] = await pool.execute(
      'SELECT id FROM leads WHERE customer_id = ? AND channel = ? AND id != ?',
      [customer_id, channel, id]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({ error: 'Lead already exists for this customer and channel' });
    }
    
    await pool.execute(
      'UPDATE leads SET customer_id = ?, channel = ? WHERE id = ?',
      [customer_id, channel, id]
    );
    res.json({ message: 'Lead updated' });
  } catch (error) {
    res.status(500).json({ error: 'Lead update failed' });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM leads WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Lead deletion failed' });
  }
};