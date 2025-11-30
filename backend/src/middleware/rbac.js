// RBAC middleware – simple version for the Receptionist role
// Allows all actions for role_id 5 (Receptionist) and otherwise checks
// if the user has the required permission code for the requested route.
// In this simplified implementation we assume the permission code is
// derived from the request path (e.g., '/api/customers' => 'customer.view')
// and the HTTP method (GET => view, POST => create, PUT => update, DELETE => delete).

import pool from '../config/database.js';

const methodToAction = {
  GET: 'view',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

const rbacMiddleware = async (req, res, next) => {
  try {
    const user = req.user; // User is set by the authenticate middleware
    if (!user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // Receptionist (role 5) has full access to front‑desk features
    if (user.role_id === 5) {
      return next();
    }

    // Derive a simple permission code from the URL and method
    const parts = req.path.split('/').filter(Boolean); // remove empty parts
    // For path like '/materials' we get ['materials']
    // For path like '/materials/123' we get ['materials', '123']
    let resource = parts[0] || '';
    
    // Convert plural to singular to match permission codes
    // e.g., 'materials' -> 'material', 'quotes' -> 'quote'
    if (resource.endsWith('s') && resource.length > 1) {
      resource = resource.slice(0, -1);
    }
    
    const action = methodToAction[req.method] || '';
    const permissionCode = `${resource}.${action}`;

    console.log('RBAC check:', { path: req.path, method: req.method, originalResource: parts[0], resource, action, permissionCode, role_id: user.role_id });

    // Validate that we have the necessary data
    if (!user.role_id) {
      console.error('RBAC error: user.role_id is undefined', { user, path: req.path });
      return res.status(500).json({ error: 'User role not found' });
    }

    if (!permissionCode || permissionCode === '.') {
      console.error('RBAC error: Could not derive permission code', { path: req.path, method: req.method });
      return res.status(403).json({ error: 'Invalid resource path' });
    }

    // Check if the permission exists for this role
    const [rows] = await pool.execute(
      `SELECT rp.* FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ? AND p.code = ?`,
      [user.role_id, permissionCode]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden – missing permission', required: permissionCode });
    }
    return next();
  } catch (err) {
    console.error('RBAC error:', err);
    return res.status(500).json({ error: 'RBAC processing error' });
  }
};

export { rbacMiddleware };
