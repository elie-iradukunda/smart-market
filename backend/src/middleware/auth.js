import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { ROLE_PERMISSIONS } from '../../config/rbac.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.execute(
      'SELECT u.id, u.name, u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ? AND u.status = "active"', 
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Legacy permission check (deprecated - use RBAC middleware instead)
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};