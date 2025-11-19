import pool from '../config/database.js';

export const getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const [sales] = await pool.execute(`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(o.id) as orders_count,
        SUM(q.total_amount) as total_sales,
        AVG(q.total_amount) as avg_order_value
      FROM orders o
      JOIN quotes q ON o.quote_id = q.id
      WHERE DATE(o.created_at) BETWEEN ? AND ?
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
    `, [start_date, end_date]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Sales report failed' });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const [inventory] = await pool.execute(`
      SELECT 
        m.*,
        CASE 
          WHEN m.current_stock <= 0 THEN 'out_of_stock'
          WHEN m.current_stock <= m.reorder_level THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM materials m
      ORDER BY m.current_stock ASC
    `);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Inventory report failed' });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const [revenue] = await pool.execute(`
      SELECT SUM(amount) as total_revenue 
      FROM payments 
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [start_date, end_date]);

    const [outstanding] = await pool.execute(`
      SELECT SUM(amount) as outstanding_amount 
      FROM invoices 
      WHERE status IN ('unpaid', 'partial')
    `);

    res.json({
      total_revenue: revenue[0].total_revenue || 0,
      outstanding_amount: outstanding[0].outstanding_amount || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Financial report failed' });
  }
};

export const getProductionReport = async (req, res) => {
  try {
    const [production] = await pool.execute(`
      SELECT 
        o.status,
        COUNT(*) as count
      FROM orders o
      GROUP BY o.status
    `);
    res.json(production);
  } catch (error) {
    res.status(500).json({ error: 'Production report failed' });
  }
};