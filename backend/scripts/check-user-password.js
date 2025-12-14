// Script to check user password hash and test password
import pool from '../src/config/database.js';
import bcrypt from 'bcryptjs';

async function checkUserPassword() {
    try {
        const connection = await pool.getConnection();

        try {
            // Get all admin users
            const [users] = await connection.query(`
        SELECT id, name, email, password_hash, role_id, is_super_admin 
        FROM users 
        WHERE email LIKE '%admin@topdesign.com'
        ORDER BY id
      `);

            console.log('📋 Admin Users in Database:\n');

            for (const user of users) {
                console.log(`User ID: ${user.id}`);
                console.log(`Name: ${user.name}`);
                console.log(`Email: ${user.email}`);
                console.log(`Role ID: ${user.role_id}`);
                console.log(`Super Admin: ${user.is_super_admin ? 'YES' : 'NO'}`);
                console.log(`Password Hash: ${user.password_hash.substring(0, 30)}...`);

                // Test password
                const testPassword = 'Admin123!';
                const isValid = await bcrypt.compare(testPassword, user.password_hash);
                console.log(`Password 'Admin123!' matches: ${isValid ? '✅ YES' : '❌ NO'}`);

                // If password doesn't match, let's update it
                if (!isValid) {
                    console.log('  ⚠️  Password hash mismatch! Updating password...');
                    const newHash = await bcrypt.hash(testPassword, 10);
                    await connection.query(
                        'UPDATE users SET password_hash = ? WHERE id = ?',
                        [newHash, user.id]
                    );
                    console.log('  ✅ Password updated successfully!');
                }

                console.log('');
            }

        } finally {
            connection.release();
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUserPassword();

