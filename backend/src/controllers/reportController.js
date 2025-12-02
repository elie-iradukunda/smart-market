import pool from '../config/database.js';

export const getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // If no date range provided, use last 30 days
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [sales] = await pool.execute(`
      SELECT 
        DATE(o.created_at) as date,
        COUNT(o.id) as orders_count,
        COALESCE(SUM(q.total_amount), 0) as total_sales,
        COALESCE(AVG(q.total_amount), 0) as avg_order_value
      FROM orders o
      LEFT JOIN quotes q ON o.quote_id = q.id
      WHERE DATE(o.created_at) BETWEEN ? AND ?
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC
    `, [startDate, endDate]);
    
    res.json(sales);
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Sales report failed', details: error.message });
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
    console.error('Inventory report error:', error);
    res.status(500).json({ error: 'Inventory report failed', details: error.message });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // If no date range provided, use last 30 days
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [revenue] = await pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as total_revenue 
      FROM payments 
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [startDate, endDate]);

    const [outstanding] = await pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as outstanding_amount 
      FROM invoices 
      WHERE status IN ('unpaid', 'partial')
    `);

    res.json({
      total_revenue: revenue[0].total_revenue || 0,
      outstanding_amount: outstanding[0].outstanding_amount || 0
    });
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ error: 'Financial report failed', details: error.message });
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
    console.error('Production report error:', error);
    res.status(500).json({ error: 'Production report failed', details: error.message });
  }
};