import pool from './src/config/database.js';

async function listRoles() {
    try {
        const [roles] = await pool.execute('SELECT * FROM roles');
        console.log(JSON.stringify(roles, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listRoles();
