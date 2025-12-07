import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import emailService from '../services/emailService.js';
import config from '../config/settings.js';

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

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Get customer role ID
    const [roles] = await pool.execute('SELECT id FROM roles WHERE name = "customer"');
    let roleId = null;
    if (roles.length > 0) {
      roleId = roles[0].id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, hashedPassword, roleId]
    );

    const token = jwt.sign({ userId: result.insertId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role_id: roleId
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return res.status(409).json({ error: 'Email or phone already exists' });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};


export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, hashedPassword, role_id || null]
    );

    return res.status(201).json({
      id: result.insertId,
      message: 'User created successfully',
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      const field = error.sqlMessage.includes('email')
        ? 'email'
        : error.sqlMessage.includes('phone')
          ? 'phone'
          : 'unique field';

      return res.status(409).json({
        error: 'Conflict',
        message: `This ${field} is already taken.`,
      });
    }

    console.error('User creation error:', error);
    return res.status(500).json({ error: 'User creation failed' });
  }
};

export const getUsers = async (req, res) => {
  try {
    console.log('Attempting to fetch users...');
    const [users] = await pool.execute('SELECT * FROM users ORDER BY name');
    console.log('Users fetched successfully:', users.length, 'records');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await pool.execute(
      'SELECT id, name, email, phone, status, role_id FROM users WHERE id = ?',
      [id]
    );
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role_id, status } = req.body;
    console.log('updateUser payload:', { id, name, email, phone, role_id, status })

    const [existing] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only run duplicate-check if email or phone has been provided
    if (email || phone) {
      const [duplicate] = await pool.execute(
        'SELECT id FROM users WHERE (email = ? OR phone = ?) AND id != ?',
        [email || null, phone || null, id]
      );
      if (duplicate.length > 0) {
        return res.status(409).json({ error: 'User with this email or phone already exists' });
      }
    }

    // Normalize status to match DB enum / conventions (e.g. "active", "inactive", "pending")
    const normalizedStatus = (status || 'active').toString().toLowerCase();

    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, role_id = ?, status = ? WHERE id = ?',
      [name, email, phone, role_id, normalizedStatus, id]
    );
    res.json({ message: 'User updated' });
  } catch (error) {
    console.error('User update failed:', error);
    res.status(500).json({ error: 'User update failed' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('UPDATE users SET status = "disabled" WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'User deletion failed' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const id = req.params.id || req.params['{id}'];
    const { currentPassword, newPassword } = req.body;

    const [user] = await pool.execute('SELECT password_hash, email, name FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, id]);

    // Send password change confirmation email
    const subject = '🔐 Top Design Password Changed';
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">🔐 Top Design Password Changed</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3>Hello ${user[0].name || 'User'},</h3>
          <p>Your Top Design password has been successfully changed.</p>
          <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
            <strong>✅ Password Updated Successfully</strong><br>
            Date: ${new Date().toLocaleString()}<br>
            Changed by: You (manual change)
          </div>
          <p><strong>Security Notice:</strong> If you did not make this change, please contact support immediately.</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
          This is an automated message from Top Design System
        </p>
      </div>
    `;

    try {
      await emailService.sendEmail(user[0].email, subject, content);
    } catch (emailError) {
      console.error('Failed to send password change confirmation email:', emailError);
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Password change failed' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const [users] = await pool.execute('SELECT id, email, name FROM users WHERE email = ? AND status = "active"', [email]);

    if (users.length === 0) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
    }

    const user = users[0];

    const token = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const frontendBase = config.getBaseUrl(req);
    const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}`;

    const subject = '🔐 Reset your Top Design password';
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">🔐 Top Design Password Reset</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3>Hello ${user.name || 'User'},</h3>
          <p>We received a request to reset the password for your Top Design account.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p><strong>Important:</strong> This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
          This is an automated message from Top Design System
        </p>
      </div>
    `;

    try {
      await emailService.sendEmail(user.email, subject, content);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset request failed' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (!payload || payload.type !== 'password_reset' || !payload.userId) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, payload.userId]);

    // Get user info for confirmation email
    const [users] = await pool.execute('SELECT email, name FROM users WHERE id = ?', [payload.userId]);

    if (users.length > 0) {
      const user = users[0];
      const subject = '✅ Top Design Password Changed';
      const content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">✅ Top Design Password Updated</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3>Hello ${user.name || 'User'},</h3>
            <p>Your Top Design password has been successfully changed.</p>
            <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
              <strong>✅ Password Updated Successfully</strong><br>
              Date: ${new Date().toLocaleString()}
            </div>
            <p>If you did not make this change, please contact support immediately.</p>
          </div>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
            This is an automated message from Top Design System
          </p>
        </div>
      `;

      try {
        await emailService.sendEmail(user.email, subject, content);
      } catch (emailError) {
        console.error('Failed to send password confirmation email:', emailError);
      }
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
};