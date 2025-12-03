import { ROUTE_PERMISSIONS, ROLE_PERMISSIONS } from '../config/rbac.js';

const hasPermission = (userPermissions, requiredPermissions) => {
  if (!requiredPermissions.length) return true;
  return requiredPermissions.some(perm => userPermissions.includes(perm));
};

const getRoutePattern = (method, path) => {
  const pattern = `${method} ${path}`;
  
  if (ROUTE_PERMISSIONS[pattern]) return pattern;
  
  for (const route in ROUTE_PERMISSIONS) {
    if (route.includes('*')) {
      const regex = new RegExp(route.replace('*', '.*'));
      if (regex.test(pattern)) return route;
    }
    
    if (route.includes(':')) {
      const regex = new RegExp(route.replace(/:[\w]+/g, '[^/]+'));
      if (regex.test(pattern)) return route;
    }
  }
  
  return null;
};

const rbacMiddleware = async (req, res, next) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const routePattern = getRoutePattern(req.method, req.path);
    
    if (!routePattern) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    const requiredPermissions = ROUTE_PERMISSIONS[routePattern];
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    
    if (!hasPermission(userPermissions, requiredPermissions)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization error' });
  }
};

export { rbacMiddleware as default };