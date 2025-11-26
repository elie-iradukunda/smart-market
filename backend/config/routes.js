// Route mapping for RBAC system
const ROUTE_MAP = {
  // AI routes
  'GET /api/ai/predictions/demand': 'ai.view',
  'GET /api/ai/predictions/churn': 'ai.view',
  'GET /api/ai/predictions/segments': 'ai.view',
  'GET /api/ai/predictions/pricing': 'ai.view',
  'GET /api/ai/reorder-suggestions': 'ai.view',
  'GET /api/ai/customer-insights': 'ai.view'
};

module.exports = { ROUTE_MAP };