import bcrypt from 'bcryptjs';
import pool from './src/config/database.js';

async function createAdmin() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Generated hash:', hashedPassword);
    
    // Delete existing admin user
    await pool.execute('DELETE FROM users WHERE email = ?', ['admin@smartmarket.com']);
    
    // Insert new admin user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
      ['System Administrator', 'admin@smartmarket.com', '+1234567890', hashedPassword, 1]
    );
    
    console.log('Admin user created successfully with ID:', result.insertId);
    
    // Test the password
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', ['admin@smartmarket.com']);
    const isValid = await bcrypt.compare(password, users[0].password_hash);
    console.log('Password verification test:', isValid ? 'PASSED' : 'FAILED');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();