import pool from './src/config/database.js';

async function checkRoles() {
    try {
        const [rows] = await pool.execute('SELECT * FROM roles');
        console.log('Roles in DB:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkRoles();
