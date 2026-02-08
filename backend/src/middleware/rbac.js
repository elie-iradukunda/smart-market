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

    // TEMPORARY: Allow Production Manager (role 7) to access orders for debugging
    // TODO: Remove this after fixing the permission check
    if (user.role_id === 7 && (req.path.includes('orders') || req.originalUrl.includes('orders'))) {
      console.log('⚠️ TEMPORARY BYPASS: Allowing Production Manager to access orders');
      console.log('   This is a temporary bypass to test if path matching is the issue');
      return next();
    }

    // Allow Clients (Role 4) and Customers (Role 13) to view their own resources
    // The Controller ensures they only see their own data
    if ((user.role_id === 4 || user.role_id === 13)) {
        // Derive resource to check if it matches allowed list
        let pathToCheck = req.path;
         if (!pathToCheck || pathToCheck === '/') {
            const originalPath = req.originalUrl.split('?')[0];
            pathToCheck = originalPath.replace(/^\/api/, '') || '/';
        }
        if (pathToCheck.startsWith('/api/')) {
             pathToCheck = pathToCheck.replace('/api', '');
        }
        const parts = pathToCheck.split('/').filter(Boolean);
        let resource = parts[0] || '';
        if (resource.endsWith('s') && resource.length > 1) resource = resource.slice(0, -1);
        
        const action = methodToAction[req.method] || '';

        if (action === 'view' && ['order', 'quote', 'file', 'invoice'].includes(resource)) {
            return next();
        }
    }

    // Allow Staff (Role 3) to view and update work orders & orders (Controller enforces assignment check)
    if (user.role_id === 3) {
        console.log('RBAC: Staff user detected, checking permissions...');
        const fullPath = (req.baseUrl || '') + (req.path || '');
        console.log('RBAC: fullPath:', fullPath, 'originalUrl:', req.originalUrl, 'method:', req.method);
        
        if ((fullPath.includes('work-orders') || req.originalUrl.includes('work-orders')) && (req.method === 'GET' || req.method === 'PUT')) {
             console.log('RBAC: Allowing work-orders access');
             return next();
        }
         if ((fullPath.includes('orders') || req.originalUrl.includes('orders')) && (req.method === 'PUT' || req.method === 'GET')) {
             console.log('RBAC: Allowing orders access');
             return next();
        }
        // Explicitly allow status updates for orders
        // Use regex on originalUrl to match /api/orders/:id/status
        if (req.method === 'PUT' && /\/orders\/[\w-]+\/status/.test(req.originalUrl)) {
             console.log('RBAC: Allowing status update');
             return next();
        }
        // Also allow viewing quotes to see items details
         if ((fullPath.includes('quotes') || req.originalUrl.includes('quotes')) && req.method === 'GET') {
             console.log('RBAC: Allowing quotes access');
             return next();
        }
        console.log('RBAC: No staff exception matched, continuing to permission check');
    }

    // Derive a simple permission code from the URL and method
    // In Express, when a router is mounted at '/api' and route is '/orders',
    // req.path = '/orders' (relative to mount), req.originalUrl = '/api/orders' (full)
    // We use req.path which is already relative to the mount point
    let pathToCheck = req.path;
    
    // Also handle req.originalUrl in case path doesn't include the route
    // If path is empty or just '/', try to extract from originalUrl
    if (!pathToCheck || pathToCheck === '/') {
      const originalPath = req.originalUrl.split('?')[0]; // Remove query string
      // Remove /api prefix if present
      pathToCheck = originalPath.replace(/^\/api/, '') || '/';
    }
    
    // Remove /api prefix if somehow still present
    if (pathToCheck.startsWith('/api/')) {
      pathToCheck = pathToCheck.replace('/api', '');
    }
    
    const parts = pathToCheck.split('/').filter(Boolean); // remove empty parts
    // For path like '/orders' we get ['orders']
    // For path like '/orders/123' we get ['orders', '123']
    let resource = parts[0] || '';
    
    // Convert plural to singular to match permission codes
    // e.g., 'materials' -> 'material', 'quotes' -> 'quote'
    if (resource.endsWith('s') && resource.length > 1) {
      resource = resource.slice(0, -1);
    }
    
    const action = methodToAction[req.method] || '';
    const permissionCode = `${resource}.${action}`;

    // Enhanced logging for debugging
    console.log('=== RBAC CHECK START ===');
    console.log('Request details:', {
      originalPath: req.path,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      pathToCheck: pathToCheck,
      method: req.method,
    });
    console.log('Permission derivation:', {
      parts: parts,
      originalResource: parts[0],
      resource: resource,
      action: action,
      permissionCode: permissionCode,
    });
    console.log('User details:', {
      userId: user.id,
      userName: user.name,
      roleId: user.role_id,
      roleName: user.role,
    });
    console.log('=== RBAC CHECK END ===');

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
      // Log detailed error for debugging
      console.error('RBAC Permission Denied:', {
        userId: user.id,
        userName: user.name,
        roleId: user.role_id,
        roleName: user.role,
        path: req.path,
        method: req.method,
        requiredPermission: permissionCode,
        userEmail: user.email
      });
      
      // Check what permissions the user actually has
      const [userPerms] = await pool.execute(
        `SELECT p.code FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role_id = ?
         ORDER BY p.code`,
        [user.role_id]
      );
      
      console.error('User has these permissions:', userPerms.map(p => p.code).join(', '));
      
      return res.status(403).json({ 
        error: 'Insufficient permissions', 
        required: permissionCode,
        roleId: user.role_id,
        message: `User with role_id ${user.role_id} does not have permission: ${permissionCode}. Please log out and log back in if permissions were recently updated.`
      });
    }
    return next();
  } catch (err) {
    console.error('RBAC error:', err);
    return res.status(500).json({ error: 'RBAC processing error' });
  }
};

export { rbacMiddleware };
