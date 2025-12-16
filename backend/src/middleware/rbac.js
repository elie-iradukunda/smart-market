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

    // Owner (role 1) has full access to all features
    if (user.role_id === 1) {
      return next();
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

    // Derive a simple permission code from the URL and method
    // In Express, when a router is mounted at '/api/auth' and route is '/users',
    // req.path = '/users' (relative to mount), req.originalUrl = '/api/auth/users' (full)
    // We need to use req.originalUrl to get the full path for proper resource detection

    // Get the full path from originalUrl to handle nested routes correctly
    let fullPath = req.originalUrl.split('?')[0]; // Remove query string
    // Remove /api prefix if present
    let pathToCheck = fullPath.replace(/^\/api/, '') || '/';

    // Also check req.path in case it's more reliable for some routes
    // For routes mounted at /api/auth, req.path will be /users (relative)
    // For routes mounted at /api, req.path will be /orders (relative)
    const relativePath = req.path;

    // Combine both to get the most complete picture
    // If originalUrl has /auth/users, use that; otherwise use the relative path
    if (fullPath.includes('/auth/users') || relativePath === '/users') {
      pathToCheck = '/auth/users';
    } else if (fullPath.includes('/pos-sales') || relativePath.includes('pos-sales')) {
      pathToCheck = '/pos-sales';
    } else if (fullPath.includes('/work-logs') || relativePath.includes('work-logs')) {
      pathToCheck = '/work-logs';
    } else if (fullPath.includes('/work-orders') || relativePath.includes('work-orders')) {
      pathToCheck = '/work-orders';
    } else if (fullPath.includes('/reports/')) {
      pathToCheck = '/reports';
    } else {
      // Use the relative path if it's more specific
      pathToCheck = relativePath || pathToCheck;
    }

    // Remove /api prefix if somehow still present
    if (pathToCheck.startsWith('/api/')) {
      pathToCheck = pathToCheck.replace('/api', '');
    }

    const parts = pathToCheck.split('/').filter(Boolean); // remove empty parts

    let resource = '';

    // Handle special nested routes where the actual resource is not the first part
    // Check both the full path and the parts array
    if (fullPath.includes('/auth/users') || pathToCheck.includes('/users') || pathToCheck.endsWith('users') || parts.includes('users')) {
      // /auth/users or /users -> user resource
      resource = 'user';
    } else if (fullPath.includes('pos-sales') || pathToCheck.includes('pos-sales') || pathToCheck.includes('pos_sales')) {
      // /pos-sales or /pos_sales -> pos resource
      resource = 'pos';
    } else if (fullPath.includes('work-logs') || pathToCheck.includes('work-logs') || pathToCheck.includes('work_logs')) {
      // /work-logs -> worklog resource
      resource = 'worklog';
    } else if (fullPath.includes('work-orders') || pathToCheck.includes('work-orders') || pathToCheck.includes('work_orders')) {
      // /work-orders -> workorder resource
      resource = 'workorder';
    } else if (fullPath.includes('purchase-orders') || pathToCheck.includes('purchase-orders') || pathToCheck.includes('purchase_orders')) {
      // /purchase-orders -> po resource
      resource = 'po';
    } else if (fullPath.includes('/reports/') || pathToCheck.includes('/reports') || parts[0] === 'reports') {
      // /reports/financial or /reports -> report resource
      resource = 'report';
    } else if (parts.length > 0) {
      // Use the last meaningful part (usually the resource)
      // For /orders/123, use 'orders'; for /auth/users, use 'users'
      resource = parts[parts.length - 1];

      // But if first part is clearly a resource (plural), use that
      const firstPart = parts[0];
      if (firstPart && (firstPart.endsWith('s') || firstPart === 'orders' || firstPart === 'customers' ||
        firstPart === 'materials' || firstPart === 'leads' || firstPart === 'quotes' ||
        firstPart === 'invoices' || firstPart === 'payments')) {
        resource = firstPart;
      }

      // Convert plural to singular to match permission codes
      // e.g., 'materials' -> 'material', 'quotes' -> 'quote', 'orders' -> 'order'
      if (resource.endsWith('s') && resource.length > 1) {
        resource = resource.slice(0, -1);
      }
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

    // Check if user is super admin (has is_super_admin flag)
    const [superAdminCheck] = await pool.execute(
      'SELECT is_super_admin FROM users WHERE id = ?',
      [user.id]
    );

    if (superAdminCheck.length > 0 && superAdminCheck[0].is_super_admin) {
      return next(); // Super admin has all access
    }

    // Check role-based permissions (exact match)
    const [rolePerms] = await pool.execute(
      `SELECT rp.* FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ? AND p.code = ?`,
      [user.role_id, permissionCode]
    );

    // Check custom user permissions if role permission not found (exact match)
    let hasPermission = rolePerms.length > 0;

    if (!hasPermission) {
      const [customPerms] = await pool.execute(
        `SELECT up.* FROM user_permissions up
         JOIN permissions p ON up.permission_id = p.id
         WHERE up.user_id = ? AND p.code = ? 
         AND (up.expires_at IS NULL OR up.expires_at > NOW())`,
        [user.id, permissionCode]
      );
      hasPermission = customPerms.length > 0;
    }

    // If no exact permission, check for related permissions (same resource, different action)
    // This allows users with customer.create to access customer.view routes, etc.
    if (!hasPermission && permissionCode.includes('.')) {
      const permissionParts = permissionCode.split('.');
      if (permissionParts.length === 2) {
        const resource = permissionParts[0];

        // Check if user has any permission for this resource (e.g., customer.create, customer.view, customer.manage)
        const [relatedRolePerms] = await pool.execute(
          `SELECT rp.* FROM role_permissions rp
           JOIN permissions p ON rp.permission_id = p.id
           WHERE rp.role_id = ? AND p.code LIKE ?`,
          [user.role_id, `${resource}.%`]
        );

        if (relatedRolePerms.length > 0) {
          hasPermission = true;
        } else {
          // Check custom user permissions for related resource
          const [relatedCustomPerms] = await pool.execute(
            `SELECT up.* FROM user_permissions up
             JOIN permissions p ON up.permission_id = p.id
             WHERE up.user_id = ? AND p.code LIKE ? 
             AND (up.expires_at IS NULL OR up.expires_at > NOW())`,
            [user.id, `${resource}.%`]
          );
          hasPermission = relatedCustomPerms.length > 0;
        }

        if (hasPermission) {
          console.log(`✅ RBAC: User has related permission for resource '${resource}' (required: ${permissionCode})`);
        }
      }
    }

    if (!hasPermission) {
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
