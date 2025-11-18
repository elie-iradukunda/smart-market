import pool from '../config/database.js';

export const createPrediction = async (req, res) => {
  try {
    const { type, target_id, predicted_value, confidence } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO ai_predictions (type, target_id, predicted_value, confidence) VALUES (?, ?, ?, ?)',
      [type, target_id, predicted_value, confidence]
    );
    res.status(201).json({ id: result.insertId, message: 'Prediction created' });
  } catch (error) {
    res.status(500).json({ error: 'Prediction creation failed' });
  }
};

export const getDemandPredictions = async (req, res) => {
  try {
    const [predictions] = await pool.execute(
      'SELECT * FROM ai_predictions WHERE type = "demand" ORDER BY created_at DESC LIMIT 50'
    );
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
};

export const getReorderSuggestions = async (req, res) => {
  try {
    const [materials] = await pool.execute(`
      SELECT m.*, 
        CASE WHEN m.current_stock <= m.reorder_level THEN 'urgent' 
             WHEN m.current_stock <= m.reorder_level * 1.5 THEN 'soon' 
             ELSE 'ok' END as reorder_status
      FROM materials m 
      WHERE m.current_stock <= m.reorder_level * 2
      ORDER BY m.current_stock / m.reorder_level ASC
    `);
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reorder suggestions' });
  }
};

export const getCustomerInsights = async (req, res) => {
  try {
    const [insights] = await pool.execute(`
      SELECT 
        c.id, c.name,
        COUNT(o.id) as total_orders,
        SUM(q.total_amount) as total_spent,
        AVG(q.total_amount) as avg_order_value,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      LEFT JOIN quotes q ON o.quote_id = q.id
      GROUP BY c.id, c.name
      HAVING total_orders > 0
      ORDER BY total_spent DESC
      LIMIT 100
    `);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
};