import bcrypt from 'bcrypt';
import pool from './src/config/database.js';

async function createOwnerUser() {
  try {
    // Get the owner role ID
    const [roles] = await pool.query('SELECT id FROM roles WHERE name = ?', ['owner']);
    
    if (roles.length === 0) {
      console.error('Error: Owner role not found in the database');
      return;
    }
    
    const ownerRoleId = roles[0].id;
    const email = 'iradukundaelie71@gmail.com';
    const name = 'Elie Iradukunda';
    const phone = '+250780000015';
    const password = 'password123'; // You should change this to a strong password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      console.log(`User with email ${email} already exists.`);
      await pool.end();
      return;
    }
    
    // Insert the new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, passwordHash, ownerRoleId, 'active']
    );
    
    console.log(`Successfully created owner user with ID: ${result.insertId}`);
    console.log(`Email: ${email}`);
    console.log(`Temporary password: ${password}`);
    console.log('Please change this password after first login!');
    
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await pool.end();
  }
}

createOwnerUser();
