import { BigQuery } from '@google-cloud/bigquery';
import pool from '../config/database.js';

const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'smart-market-local',
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
});

const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET || 'smart_market');

// Sync MySQL data to BigQuery for advanced analytics
export const syncDataToBigQuery = async () => {
  try {
    console.log('Syncing data to BigQuery...');
    
    // Sync customers
    await syncCustomers();
    
    // Sync orders
    await syncOrders();
    
    // Sync materials
    await syncMaterials();
    
    // Sync stock movements
    await syncStockMovements();
    
    console.log('Data sync to BigQuery completed');
    return { success: true, message: 'Data synced successfully' };
  } catch (error) {
    console.error('BigQuery sync error:', error);
    return { success: false, error: error.message };
  }
};

const syncCustomers = async () => {
  const [customers] = await pool.execute(`
    SELECT 
      c.id,
      c.name,
      c.email,
      c.phone,
      c.source,
      c.created_at,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(q.total_amount), 0) as total_spent,
      COALESCE(MAX(o.created_at), c.created_at) as last_order_date
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    LEFT JOIN quotes q ON o.quote_id = q.id
    GROUP BY c.id, c.name, c.email, c.phone, c.source, c.created_at
  `);
  
  if (customers.length > 0) {
    const table = dataset.table('customers');
    await table.insert(customers.map(customer => ({
      customer_id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      source: customer.source,
      created_at: customer.created_at,
      total_orders: customer.total_orders,
      total_spent: parseFloat(customer.total_spent),
      last_order_date: customer.last_order_date,
      sync_timestamp: new Date()
    })));
    console.log(`Synced ${customers.length} customers to BigQuery`);
  }
};

const syncOrders = async () => {
  const [orders] = await pool.execute(`
    SELECT 
      o.id,
      o.customer_id,
      o.quote_id,
      o.status,
      o.created_at,
      q.total_amount,
      c.name as customer_name
    FROM orders o
    LEFT JOIN quotes q ON o.quote_id = q.id
    LEFT JOIN customers c ON o.customer_id = c.id
  `);
  
  if (orders.length > 0) {
    const table = dataset.table('orders');
    await table.insert(orders.map(order => ({
      order_id: order.id,
      customer_id: order.customer_id,
      quote_id: order.quote_id,
      status: order.status,
      created_at: order.created_at,
      total_amount: parseFloat(order.total_amount || 0),
      customer_name: order.customer_name,
      sync_timestamp: new Date()
    })));
    console.log(`Synced ${orders.length} orders to BigQuery`);
  }
};

const syncMaterials = async () => {
  const [materials] = await pool.execute(`
    SELECT 
      m.id,
      m.name,
      m.category,
      m.unit,
      m.current_stock,
      m.reorder_level,
      m.created_at
    FROM materials m
  `);
  
  if (materials.length > 0) {
    const table = dataset.table('materials');
    await table.insert(materials.map(material => ({
      material_id: material.id,
      name: material.name,
      category: material.category,
      unit: material.unit,
      current_stock: parseFloat(material.current_stock),
      reorder_level: material.reorder_level,
      created_at: material.created_at,
      sync_timestamp: new Date()
    })));
    console.log(`Synced ${materials.length} materials to BigQuery`);
  }
};

const syncStockMovements = async () => {
  const [movements] = await pool.execute(`
    SELECT 
      sm.id,
      sm.material_id,
      sm.type,
      sm.quantity,
      sm.reference,
      sm.created_at,
      m.name as material_name
    FROM stock_movements sm
    LEFT JOIN materials m ON sm.material_id = m.id
  `);
  
  if (movements.length > 0) {
    const table = dataset.table('stock_movements');
    await table.insert(movements.map(movement => ({
      movement_id: movement.id,
      material_id: movement.material_id,
      type: movement.type,
      quantity: parseFloat(movement.quantity),
      reference: movement.reference,
      created_at: movement.created_at,
      material_name: movement.material_name,
      sync_timestamp: new Date()
    })));
    console.log(`Synced ${movements.length} stock movements to BigQuery`);
  }
};

// Query BigQuery for advanced analytics
export const queryBigQueryAnalytics = async (analysisType) => {
  try {
    let query;
    
    switch (analysisType) {
      case 'customer_lifetime_value':
        query = `
          SELECT 
            customer_id,
            name,
            total_orders,
            total_spent,
            total_spent / total_orders as avg_order_value,
            DATE_DIFF(CURRENT_DATE(), DATE(last_order_date), DAY) as days_since_last_order
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.customers\`
          WHERE total_orders > 0
          ORDER BY total_spent DESC
          LIMIT 100
        `;
        break;
        
      case 'inventory_trends':
        query = `
          SELECT 
            material_name,
            type,
            SUM(quantity) as total_quantity,
            COUNT(*) as movement_count,
            DATE(created_at) as movement_date
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.stock_movements\`
          WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
          GROUP BY material_name, type, DATE(created_at)
          ORDER BY movement_date DESC
        `;
        break;
        
      case 'sales_trends':
        query = `
          SELECT 
            DATE(created_at) as order_date,
            COUNT(*) as order_count,
            SUM(total_amount) as daily_revenue,
            AVG(total_amount) as avg_order_value
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.orders\`
          WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
          GROUP BY DATE(created_at)
          ORDER BY order_date DESC
        `;
        break;
        
      default:
        throw new Error('Unknown analysis type');
    }
    
    const [rows] = await bigquery.query({ query });
    return rows;
  } catch (error) {
    console.error('BigQuery analytics error:', error);
    throw error;
  }
};

// Create BigQuery tables if they don't exist
export const createBigQueryTables = async () => {
  try {
    const tables = [
      {
        name: 'customers',
        schema: [
          { name: 'customer_id', type: 'INTEGER' },
          { name: 'name', type: 'STRING' },
          { name: 'email', type: 'STRING' },
          { name: 'phone', type: 'STRING' },
          { name: 'source', type: 'STRING' },
          { name: 'created_at', type: 'TIMESTAMP' },
          { name: 'total_orders', type: 'INTEGER' },
          { name: 'total_spent', type: 'FLOAT' },
          { name: 'last_order_date', type: 'TIMESTAMP' },
          { name: 'sync_timestamp', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'orders',
        schema: [
          { name: 'order_id', type: 'INTEGER' },
          { name: 'customer_id', type: 'INTEGER' },
          { name: 'quote_id', type: 'INTEGER' },
          { name: 'status', type: 'STRING' },
          { name: 'created_at', type: 'TIMESTAMP' },
          { name: 'total_amount', type: 'FLOAT' },
          { name: 'customer_name', type: 'STRING' },
          { name: 'sync_timestamp', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'materials',
        schema: [
          { name: 'material_id', type: 'INTEGER' },
          { name: 'name', type: 'STRING' },
          { name: 'category', type: 'STRING' },
          { name: 'unit', type: 'STRING' },
          { name: 'current_stock', type: 'FLOAT' },
          { name: 'reorder_level', type: 'INTEGER' },
          { name: 'created_at', type: 'TIMESTAMP' },
          { name: 'sync_timestamp', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'stock_movements',
        schema: [
          { name: 'movement_id', type: 'INTEGER' },
          { name: 'material_id', type: 'INTEGER' },
          { name: 'type', type: 'STRING' },
          { name: 'quantity', type: 'FLOAT' },
          { name: 'reference', type: 'STRING' },
          { name: 'created_at', type: 'TIMESTAMP' },
          { name: 'material_name', type: 'STRING' },
          { name: 'sync_timestamp', type: 'TIMESTAMP' }
        ]
      }
    ];
    
    for (const tableConfig of tables) {
      const table = dataset.table(tableConfig.name);
      const [exists] = await table.exists();
      
      if (!exists) {
        await table.create({
          schema: tableConfig.schema,
          location: 'US'
        });
        console.log(`Created BigQuery table: ${tableConfig.name}`);
      }
    }
    
    return { success: true, message: 'BigQuery tables ready' };
  } catch (error) {
    console.error('BigQuery table creation error:', error);
    return { success: false, error: error.message };
  }
};