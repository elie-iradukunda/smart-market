import pool from './src/config/database.js';

async function checkCols() {
    try {
        const [rows, fields] = await pool.execute('SELECT * FROM customers LIMIT 1');
        console.log('Columns in customers table:', fields.map(f => f.name));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkCols();
