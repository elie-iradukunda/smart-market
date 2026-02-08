
import pool from './src/config/database.js';

async function run() {
  try {
    console.log('Testing "finishing" and "qa"...');
    
    // Test finishing
    try {
        await pool.execute('UPDATE work_orders SET stage = ? WHERE custom_design_order_id = 1', ['finishing']);
        const [wo] = await pool.execute('SELECT stage FROM work_orders WHERE id = 22');
        console.log('WO for "finishing": "' + wo[0].stage + '"');
    } catch (e) { console.error(e.message); }

    // Test qa
    try {
        await pool.execute('UPDATE work_orders SET stage = ? WHERE custom_design_order_id = 1', ['qa']);
        const [wo] = await pool.execute('SELECT stage FROM work_orders WHERE id = 22');
        console.log('WO for "qa": "' + wo[0].stage + '"');
    } catch (e) { console.error(e.message); }

  } catch (err) { console.error(err); } 
  finally { process.exit(); }
}
run();
