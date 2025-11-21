import pool from '../config/database.js';
import { generateBusinessRecommendations } from './geminiService.js';

// Simplified AI service that works without BigQuery
export const getSimplifiedDemandForecast = async () => {
  const [materials] = await pool.execute(`
    SELECT 
      m.id as material_id,
      m.name as material_name,
      m.category,
      COALESCE(AVG(ABS(sm.quantity)), 0) as avg_daily_usage,
      COALESCE(STDDEV(ABS(sm.quantity)), 0) as usage_variance,
      COUNT(sm.id) as usage_frequency,
      ROUND(COALESCE(AVG(ABS(sm.quantity)), 0) * 1.2) as predicted_demand,
      CASE 
        WHEN COUNT(sm.id) >= 20 THEN 0.9
        WHEN COUNT(sm.id) >= 10 THEN 0.7
        WHEN COUNT(sm.id) >= 5 THEN 0.5
        ELSE 0.3
      END as confidence
    FROM materials m
    LEFT JOIN stock_movements sm ON m.id = sm.material_id 
      AND sm.type = 'issue' 
      AND sm.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY m.id, m.name, m.category
    HAVING COUNT(sm.id) >= 1
    ORDER BY predicted_demand DESC
  `);
  
  return materials;
};

export const getSimplifiedCustomerSegmentation = async () => {
  const [customers] = await pool.execute(`
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      c.source as customer_source,
      COUNT(o.id) as frequency,
      COALESCE(SUM(q.total_amount), 0) as monetary,
      COALESCE(DATEDIFF(NOW(), MAX(o.created_at)), 365) as recency,
      COALESCE(AVG(q.total_amount), 0) as avg_order_value,
      CASE 
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) <= 30 THEN 5
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) <= 60 THEN 4
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) <= 90 THEN 3
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) <= 180 THEN 2
        ELSE 1
      END as recency_score,
      CASE 
        WHEN COUNT(o.id) >= 10 THEN 5
        WHEN COUNT(o.id) >= 5 THEN 4
        WHEN COUNT(o.id) >= 3 THEN 3
        WHEN COUNT(o.id) >= 2 THEN 2
        ELSE 1
      END as frequency_score,
      CASE 
        WHEN SUM(q.total_amount) >= 5000 THEN 5
        WHEN SUM(q.total_amount) >= 2000 THEN 4
        WHEN SUM(q.total_amount) >= 1000 THEN 3
        WHEN SUM(q.total_amount) >= 500 THEN 2
        ELSE 1
      END as monetary_score,
      CASE 
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) <= 30 AND COUNT(o.id) >= 4 AND SUM(q.total_amount) >= 2000 THEN 'Champions'
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) <= 60 AND COUNT(o.id) >= 3 THEN 'Loyal Customers'
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) > 90 AND COUNT(o.id) >= 3 THEN 'At Risk'
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) > 180 THEN 'Lost Customers'
        ELSE 'New Customers'
      END as segment
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    LEFT JOIN quotes q ON o.quote_id = q.id
    GROUP BY c.id, c.name, c.source
    HAVING COUNT(o.id) > 0
    ORDER BY monetary DESC
  `);
  
  return customers;
};

export const getSimplifiedChurnPrediction = async () => {
  const [customers] = await pool.execute(`
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      COUNT(o.id) as total_orders,
      COALESCE(AVG(q.total_amount), 0) as avg_order_value,
      COALESCE(DATEDIFF(NOW(), MAX(o.created_at)), 365) as days_since_last_order,
      CASE 
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) > 180 THEN 0.9
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) > 90 THEN 0.7
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) > 60 THEN 0.5
        WHEN DATEDIFF(NOW(), MAX(o.created_at)) > 30 THEN 0.3
        ELSE 0.1
      END as churn_probability,
      CASE 
        WHEN COUNT(o.id) >= 10 THEN 0.9
        WHEN COUNT(o.id) >= 5 THEN 0.7
        WHEN COUNT(o.id) >= 3 THEN 0.5
        ELSE 0.3
      END as confidence
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    LEFT JOIN quotes q ON o.quote_id = q.id
    GROUP BY c.id, c.name
    HAVING COUNT(o.id) > 1
    ORDER BY churn_probability DESC, total_orders DESC
  `);
  
  return customers;
};

export const getSimplifiedInventoryOptimization = async () => {
  const [materials] = await pool.execute(`
    SELECT 
      m.id as material_id,
      m.name as material_name,
      m.category,
      m.current_stock,
      m.reorder_level,
      COALESCE(AVG(ABS(sm.quantity)), 0) as avg_daily_usage,
      COALESCE(STDDEV(ABS(sm.quantity)), 0) as usage_stddev,
      COUNT(sm.id) as usage_days,
      ROUND(SQRT(2 * (COALESCE(AVG(ABS(sm.quantity)), 0) * 365) * 50 / 0.2)) as economic_order_quantity,
      ROUND(1.65 * SQRT(7) * COALESCE(STDDEV(ABS(sm.quantity)), 0)) as safety_stock,
      ROUND((COALESCE(AVG(ABS(sm.quantity)), 0) * 7) + (1.65 * SQRT(7) * COALESCE(STDDEV(ABS(sm.quantity)), 0))) as reorder_point,
      CASE 
        WHEN COALESCE(AVG(ABS(sm.quantity)), 0) > 0 THEN 
          ROUND((m.current_stock - ((COALESCE(AVG(ABS(sm.quantity)), 0) * 7) + (1.65 * SQRT(7) * COALESCE(STDDEV(ABS(sm.quantity)), 0)))) / COALESCE(AVG(ABS(sm.quantity)), 0))
        ELSE 999
      END as days_until_reorder
    FROM materials m
    LEFT JOIN stock_movements sm ON m.id = sm.material_id 
      AND sm.type = 'issue' 
      AND sm.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    WHERE m.current_stock > 0
    GROUP BY m.id, m.name, m.category, m.current_stock, m.reorder_level
    HAVING COUNT(sm.id) >= 5
    ORDER BY days_until_reorder ASC
  `);
  
  return materials;
};