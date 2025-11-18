import pool from '../config/database.js';

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, source } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO customers (name, phone, email, address, source) VALUES (?, ?, ?, ?, ?)',
      [name, phone, email, address, source]
    );
    res.status(201).json({ id: result.insertId, message: 'Customer created' });
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

export const createLead = async (req, res) => {
  try {
    const { customer_id, channel } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO leads (customer_id, channel) VALUES (?, ?)',
      [customer_id, channel]
    );
    res.status(201).json({ id: result.insertId, message: 'Lead created' });
  } catch (error) {
    res.status(500).json({ error: 'Lead creation failed' });
  }
};