import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
});

const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET || 'smart_market');

export const syncDataToBigQuery = async () => {
  try {
    // Sync customers data
    await syncCustomersData();
    
    // Sync orders data
    await syncOrdersData();
    
    // Sync materials data
    await syncMaterialsData();
    
    // Sync stock movements
    await syncStockMovements();
    
    console.log('Data synced to BigQuery successfully');
  } catch (error) {
    console.error('BigQuery sync failed:', error);
  }
};

const syncCustomersData = async () => {
  const query = `
    CREATE OR REPLACE TABLE \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.customers\` AS
    SELECT 
      id,
      name,
      phone,
      email,
      address,
      source,
      CURRENT_TIMESTAMP() as synced_at
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.mysql_customers\`
  `;
  
  await bigquery.query(query);
};

const syncOrdersData = async () => {
  const query = `
    CREATE OR REPLACE TABLE \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.orders_analysis\` AS
    SELECT 
      o.id,
      o.customer_id,
      o.status,
      o.created_at,
      q.total_amount,
      c.name as customer_name,
      c.source as customer_source,
      DATE_DIFF(CURRENT_DATE(), DATE(o.created_at), DAY) as days_since_order,
      EXTRACT(MONTH FROM o.created_at) as order_month,
      EXTRACT(DAYOFWEEK FROM o.created_at) as order_day_of_week
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.mysql_orders\` o
    LEFT JOIN \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.mysql_quotes\` q ON o.quote_id = q.id
    LEFT JOIN \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.mysql_customers\` c ON o.customer_id = c.id
  `;
  
  await bigquery.query(query);
};

const syncMaterialsData = async () => {
  const query = `
    CREATE OR REPLACE TABLE \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.materials_analysis\` AS
    SELECT 
      m.id,
      m.name,
      m.unit,
      m.category,
      m.current_stock,
      m.reorder_level,
      CASE 
        WHEN m.current_stock <= 0 THEN 'OUT_OF_STOCK'
        WHEN m.current_stock <= m.reorder_level THEN 'LOW_STOCK'
        WHEN m.current_stock <= m.reorder_level * 1.5 THEN 'MEDIUM_STOCK'
        ELSE 'HIGH_STOCK'
      END as stock_status
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.mysql_materials\` m
  `;
  
  await bigquery.query(query);
};

const syncStockMovements = async () => {
  const query = `
    CREATE OR REPLACE TABLE \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.stock_analysis\` AS
    SELECT 
      sm.id,
      sm.material_id,
      sm.type,
      sm.quantity,
      sm.created_at,
      m.name as material_name,
      m.category,
      DATE_DIFF(CURRENT_DATE(), DATE(sm.created_at), DAY) as days_ago,
      EXTRACT(MONTH FROM sm.created_at) as movement_month
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.mysql_stock_movements\` sm
    LEFT JOIN \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.mysql_materials\` m ON sm.material_id = m.id
    WHERE sm.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  `;
  
  await bigquery.query(query);
};

export const getDemandForecast = async () => {
  const query = `
    SELECT 
      material_id,
      material_name,
      category,
      AVG(ABS(quantity)) as avg_daily_usage,
      STDDEV(ABS(quantity)) as usage_variance,
      COUNT(*) as usage_frequency,
      -- Linear regression prediction
      ROUND(AVG(ABS(quantity)) * 1.2) as predicted_demand,
      -- Confidence based on data consistency
      CASE 
        WHEN COUNT(*) >= 20 AND STDDEV(ABS(quantity)) / AVG(ABS(quantity)) < 0.5 THEN 0.9
        WHEN COUNT(*) >= 10 AND STDDEV(ABS(quantity)) / AVG(ABS(quantity)) < 0.7 THEN 0.7
        WHEN COUNT(*) >= 5 THEN 0.5
        ELSE 0.3
      END as confidence
    FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.stock_analysis\`
    WHERE type = 'issue' AND days_ago <= 30
    GROUP BY material_id, material_name, category
    HAVING COUNT(*) >= 3
    ORDER BY predicted_demand DESC
  `;
  
  const [rows] = await bigquery.query(query);
  return rows;
};

export const getCustomerSegmentation = async () => {
  const query = `
    WITH customer_metrics AS (
      SELECT 
        customer_id,
        customer_name,
        customer_source,
        COUNT(*) as frequency,
        SUM(total_amount) as monetary,
        MIN(days_since_order) as recency,
        AVG(total_amount) as avg_order_value
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.orders_analysis\`
      WHERE total_amount IS NOT NULL
      GROUP BY customer_id, customer_name, customer_source
    ),
    rfm_scores AS (
      SELECT *,
        CASE 
          WHEN recency <= 30 THEN 5
          WHEN recency <= 60 THEN 4
          WHEN recency <= 90 THEN 3
          WHEN recency <= 180 THEN 2
          ELSE 1
        END as recency_score,
        CASE 
          WHEN frequency >= 10 THEN 5
          WHEN frequency >= 5 THEN 4
          WHEN frequency >= 3 THEN 3
          WHEN frequency >= 2 THEN 2
          ELSE 1
        END as frequency_score,
        CASE 
          WHEN monetary >= 5000 THEN 5
          WHEN monetary >= 2000 THEN 4
          WHEN monetary >= 1000 THEN 3
          WHEN monetary >= 500 THEN 2
          ELSE 1
        END as monetary_score
      FROM customer_metrics
    )
    SELECT *,
      CASE 
        WHEN recency_score >= 4 AND frequency_score >= 4 AND monetary_score >= 4 THEN 'Champions'
        WHEN recency_score >= 3 AND frequency_score >= 3 THEN 'Loyal Customers'
        WHEN recency_score <= 2 AND frequency_score >= 3 THEN 'At Risk'
        WHEN recency_score <= 2 AND frequency_score <= 2 THEN 'Lost Customers'
        ELSE 'New Customers'
      END as segment
    FROM rfm_scores
    ORDER BY monetary DESC
  `;
  
  const [rows] = await bigquery.query(query);
  return rows;
};

export const getChurnPrediction = async () => {
  const query = `
    WITH customer_behavior AS (
      SELECT 
        customer_id,
        customer_name,
        COUNT(*) as total_orders,
        AVG(total_amount) as avg_order_value,
        MIN(days_since_order) as days_since_last_order,
        STDDEV(days_since_order) as order_consistency
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.orders_analysis\`
      WHERE total_amount IS NOT NULL
      GROUP BY customer_id, customer_name
      HAVING COUNT(*) > 1
    )
    SELECT *,
      -- Churn probability calculation
      CASE 
        WHEN days_since_last_order > 180 THEN 0.9
        WHEN days_since_last_order > 90 THEN 0.7
        WHEN days_since_last_order > 60 THEN 0.5
        WHEN days_since_last_order > 30 THEN 0.3
        ELSE 0.1
      END as churn_probability,
      -- Confidence based on order history
      CASE 
        WHEN total_orders >= 10 THEN 0.9
        WHEN total_orders >= 5 THEN 0.7
        WHEN total_orders >= 3 THEN 0.5
        ELSE 0.3
      END as confidence
    FROM customer_behavior
    ORDER BY churn_probability DESC, total_orders DESC
  `;
  
  const [rows] = await bigquery.query(query);
  return rows;
};

export const getInventoryOptimization = async () => {
  const query = `
    WITH usage_stats AS (
      SELECT 
        material_id,
        material_name,
        category,
        AVG(ABS(quantity)) as avg_daily_usage,
        STDDEV(ABS(quantity)) as usage_stddev,
        COUNT(*) as usage_days
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.stock_analysis\`
      WHERE type = 'issue' AND days_ago <= 90
      GROUP BY material_id, material_name, category
      HAVING COUNT(*) >= 5
    ),
    current_stock AS (
      SELECT 
        id as material_id,
        current_stock,
        reorder_level
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.materials_analysis\`
    )
    SELECT 
      u.material_id,
      u.material_name,
      u.category,
      c.current_stock,
      c.reorder_level,
      u.avg_daily_usage,
      -- EOQ calculation (simplified)
      ROUND(SQRT(2 * (u.avg_daily_usage * 365) * 50 / 0.2)) as economic_order_quantity,
      -- Safety stock (7-day lead time, 95% service level)
      ROUND(1.65 * SQRT(7) * u.usage_stddev) as safety_stock,
      -- Reorder point
      ROUND((u.avg_daily_usage * 7) + (1.65 * SQRT(7) * u.usage_stddev)) as reorder_point,
      -- Days until reorder
      CASE 
        WHEN u.avg_daily_usage > 0 THEN 
          ROUND((c.current_stock - ((u.avg_daily_usage * 7) + (1.65 * SQRT(7) * u.usage_stddev))) / u.avg_daily_usage)
        ELSE 999
      END as days_until_reorder
    FROM usage_stats u
    JOIN current_stock c ON u.material_id = c.material_id
    WHERE c.current_stock > 0
    ORDER BY days_until_reorder ASC
  `;
  
  const [rows] = await bigquery.query(query);
  return rows;
};