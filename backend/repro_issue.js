
import pool from './src/config/database.js';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const logFile = 'result.log';
// Clear previous log
try { fs.unlinkSync(logFile); } catch (e) {}

function log(...args) {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') + '\n';
    try { fs.appendFileSync(logFile, msg); } catch (e) {}
    console.log(msg.trim());
}

async function testApi() {
    log('\n--- Testing API Endpoint ---');
    try {
        const userId = 20; // Elysee
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            log('No JWT_SECRET found!');
            return;
        }
        const token = jwt.sign({ id: userId, role_id: 3 }, secret, { expiresIn: '1h' }); // Assuming role 3 (staff)
        
        log('Generated token for user 20');
        
        const url = 'http://localhost:3000/api/production/work-orders/22';
        log('Fetching:', url);
        
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        log('API Response Status:', response.status);
        log('API Response Data:', response.data);
    } catch (error) {
        log('API Error Status:', error.response?.status);
        log('API Error Data:', error.response?.data);
        log('API Error Message:', error.message);
    }
}

async function test() {
  try {
    log('Testing connection...');
    const [rows] = await pool.execute('SELECT 1');
    log('Connection successful.');

    log('--- Fetching all work orders ---');
    const [allWorkOrders] = await pool.execute('SELECT id, order_id, custom_design_order_id, assigned_to FROM work_orders');
    log('Found', allWorkOrders.length, 'work orders.');
    allWorkOrders.forEach(wo => log(JSON.stringify(wo)));

    const targetId = 22;
    log(`\n--- Fetching Work Order ID ${targetId} ---`);
    
    // Mimic exactly the query in productionController.js getWorkOrder
    const [workOrder] = await pool.execute(`
      SELECT 
        wo.*,
        u.name as assigned_user_name,
        u.email as assigned_user_email,
        COALESCE(CAST(o.id AS CHAR), CONCAT('CD-', cdo.id)) as order_number,
        COALESCE(o.status, cdo.status) as order_status,
        o.quote_id,
        COALESCE(c.name, cdo.customer_name) as customer_name,
        COALESCE(c.email, cdo.customer_email) as customer_email,
        COALESCE(c.phone, cdo.customer_phone) as customer_phone,
        COALESCE(c.address, cdo.customer_location) as customer_address,
        cdo.product_type,
        cdo.design_description as requirements,
        cdo.width,
        cdo.height,
        cdo.bg_color,
        cdo.text_color,
        cdo.font_style,
        cdo.font_size,
        cdo.text_content,
        cdo.usage_description,
        1 as custom_quantity,
        NULL as paper_type,
        NULL as finish_type,
        CASE WHEN wo.custom_design_order_id IS NOT NULL THEN 1 ELSE 0 END as is_custom_design
      FROM work_orders wo
      LEFT JOIN users u ON wo.assigned_to = u.id
      LEFT JOIN orders o ON wo.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN custom_design_orders cdo ON wo.custom_design_order_id = cdo.id
      WHERE wo.id = ?
    `, [targetId]);

    log('Result for ID 22:', workOrder.length, 'rows');
    if (workOrder.length > 0) {
      log('Row:', workOrder[0]);
    } else {
      log('Row not found.');
    }

    await testApi();
  } catch (error) {
    log('Error:', error);
  } finally {
    process.exit();
  }
}

test();
