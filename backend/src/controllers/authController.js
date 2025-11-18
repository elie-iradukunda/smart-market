import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ? AND status = "active"', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, role_id]
    );

    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'User creation failed' });
  }
};