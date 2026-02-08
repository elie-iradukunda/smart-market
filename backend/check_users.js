import pool from './src/config/database.js';

async function checkUsers() {
    try {
        const [rows] = await pool.execute('SELECT email, role_id, role FROM users');
        console.log('Users in DB:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsers();
