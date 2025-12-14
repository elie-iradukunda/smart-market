/**
 * Route to permission mapping for frontend route protection
 * Maps route paths to required permission codes
 */

export const ROUTE_PERMISSIONS: Record<string, string | null> = {
  // Dashboard - accessible to all authenticated users
  '/': null,
  '/dashboard': null,
  '/dashboard/global': null,
  '/dashboard/owner': null,
  '/dashboard/admin': null,
  '/dashboard/reception': null,
  '/dashboard/accountant': null,
  '/dashboard/marketing': null,
  '/dashboard/technician': null,
  '/dashboard/controller': null,
  '/dashboard/production': null,
  '/dashboard/inventory': null,
  '/dashboard/sales': null,
  '/dashboard/pos': null,
  '/dashboard/support': null,

  // CRM Routes
  '/crm/customers': 'customer.view',
  '/crm/customers/:id': 'customer.view',
  '/crm/leads': 'lead.view',
  '/crm/leads/:id': 'lead.view',
  '/crm/quotes': 'quote.view',

  // Orders
  '/orders': 'order.view',
  '/orders/:id': 'order.view',

  // Production
  '/production/work-orders': 'workorder.view',
  '/production/work-orders/:id': 'workorder.view',
  '/production/schedule': 'workorder.view',
  '/production/new-order': 'workorder.create',

  // Inventory
  '/inventory/materials': 'material.view',
  '/inventory/materials/:sku': 'material.view',
  '/inventory/products': 'material.view',
  '/inventory/purchase-orders': 'po.view',
  '/inventory/purchase-orders/:id': 'po.view',
  '/inventory/suppliers': 'supplier.view',
  '/inventory/stock-movements': 'inventory.manage',
  '/inventory/bom-templates': 'material.view',
  '/inventory/reports': 'report.view',

  // Reports
  '/reports/operations': 'report.view',
  '/reports/production': 'report.view',

  // POS
  '/pos/terminal': 'pos.create',
  '/pos/sales-history': 'pos.view',

  // Finance
  '/finance/invoices': 'invoice.view',
  '/finance/invoices/:id': 'invoice.view',
  '/finance/payments': 'payment.view',
  '/finance/accounts': 'report.view',
  '/finance/journals': 'journal.create',
  '/finance/journals/:id': 'journal.create',
  '/finance/reports': 'report.view',

  // Marketing
  '/marketing/campaigns': 'campaign.view',
  '/marketing/campaigns/:id': 'campaign.view',
  '/marketing/ads': 'ad.view',
  '/marketing/ad-performance': 'campaign.view',

  // Communications
  '/communications/inbox': 'conversation.view',
  '/communications/conversations/:id': 'conversation.view',

  // AI
  '/ai/overview': 'ai.view',

  // Admin
  '/admin/users': 'user.view',
  '/admin/users/:id': 'user.view',
  '/admin/users/:user_id/permissions': 'role.manage',
  '/admin/roles': 'role.manage',
  '/admin/roles/:id': 'role.manage',
  '/admin/audit-logs': 'audit.view',
  '/admin/employee-activity': 'user.view',
  '/admin/system-settings': 'settings.manage',

  // Account
  '/account/change-password': null, // Everyone can change their password

  // Files
  '/files': 'file.view',
}

/**
 * Get required permission for a route path
 * Handles dynamic routes by matching patterns
 */
export function getRequiredPermission(path: string): string | null {
  // Exact match first
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path]
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
    if (regex.test(path)) {
      return permission
    }
  }

  // Default: require authentication but no specific permission
  return null
}

