-- Insert comprehensive roles
INSERT INTO roles (name, description) VALUES 
('Super Admin', 'System owner with complete access'),
('Admin', 'System administrator with full access'),
('Manager', 'Department manager with oversight access'),
('Receptionist', 'Handles customers and creates orders'),
('Accountant', 'Manages finances and accounting'),
('Marketing Officer', 'Manages campaigns and promotions'),
('Technician Officer', 'Handles production and work orders'),
('Controller', 'Manages inventory and stock'),
('Sales Rep', 'Sales representative with customer access'),
('Viewer', 'Read-only access to reports and data');

-- Insert comprehensive permissions
INSERT INTO permissions (code, description) VALUES 
-- User Management
('user.create', 'Create new users'),
('user.view', 'View users'),
('user.edit', 'Edit user details'),
('user.delete', 'Delete users'),
('user.activate', 'Activate/deactivate users'),

-- Role & Permission Management
('role.create', 'Create roles'),
('role.view', 'View roles'),
('role.edit', 'Edit roles'),
('role.delete', 'Delete roles'),
('permission.manage', 'Manage permissions'),

-- Customer Management
('customer.create', 'Create customers'),
('customer.view', 'View customers'),
('customer.edit', 'Edit customer details'),
('customer.delete', 'Delete customers'),
('lead.create', 'Create leads'),
('lead.view', 'View leads'),
('lead.edit', 'Edit leads'),

-- Quote & Order Management
('quote.create', 'Create quotes'),
('quote.view', 'View quotes'),
('quote.edit', 'Edit quotes'),
('quote.approve', 'Approve quotes'),
('quote.reject', 'Reject quotes'),
('order.create', 'Create orders'),
('order.view', 'View orders'),
('order.edit', 'Edit orders'),
('order.cancel', 'Cancel orders'),
('order.complete', 'Complete orders'),

-- Production Management
('workorder.create', 'Create work orders'),
('workorder.view', 'View work orders'),
('workorder.edit', 'Edit work orders'),
('workorder.assign', 'Assign work orders'),
('worklog.create', 'Log work time'),
('worklog.view', 'View work logs'),
('production.manage', 'Manage production workflow'),

-- Inventory Management
('material.create', 'Create materials'),
('material.view', 'View materials'),
('material.edit', 'Edit materials'),
('material.delete', 'Delete materials'),
('stock.view', 'View stock levels'),
('stock.move', 'Record stock movements'),
('stock.adjust', 'Adjust stock levels'),
('supplier.create', 'Create suppliers'),
('supplier.view', 'View suppliers'),
('supplier.edit', 'Edit suppliers'),
('po.create', 'Create purchase orders'),
('po.view', 'View purchase orders'),
('po.approve', 'Approve purchase orders'),

-- Financial Management
('invoice.create', 'Create invoices'),
('invoice.view', 'View invoices'),
('invoice.edit', 'Edit invoices'),
('invoice.send', 'Send invoices'),
('payment.create', 'Record payments'),
('payment.view', 'View payments'),
('payment.refund', 'Process refunds'),
('pos.create', 'Create POS sales'),
('pos.view', 'View POS sales'),
('journal.create', 'Create journal entries'),
('journal.view', 'View journal entries'),
('accounting.manage', 'Manage accounting'),

-- Marketing Management
('campaign.create', 'Create campaigns'),
('campaign.view', 'View campaigns'),
('campaign.edit', 'Edit campaigns'),
('campaign.delete', 'Delete campaigns'),
('campaign.launch', 'Launch campaigns'),
('marketing.analytics', 'View marketing analytics'),

-- Communication Management
('conversation.create', 'Create conversations'),
('conversation.view', 'View conversations'),
('conversation.manage', 'Manage conversations'),
('message.send', 'Send messages'),
('message.view', 'View messages'),
('communication.manage', 'Manage all communications'),

-- AI & Analytics
('ai.create', 'Create AI predictions'),
('ai.view', 'View AI insights'),
('ai.manage', 'Manage AI settings'),
('analytics.view', 'View analytics'),
('analytics.export', 'Export analytics'),

-- Reporting
('report.sales', 'View sales reports'),
('report.financial', 'View financial reports'),
('report.inventory', 'View inventory reports'),
('report.production', 'View production reports'),
('report.marketing', 'View marketing reports'),
('report.export', 'Export reports'),
('report.schedule', 'Schedule automated reports'),

-- File Management
('file.upload', 'Upload files'),
('file.view', 'View files'),
('file.delete', 'Delete files'),
('file.manage', 'Manage file system'),

-- System Administration
('system.settings', 'Manage system settings'),
('system.backup', 'Manage system backups'),
('system.logs', 'View system logs'),
('system.maintenance', 'Perform system maintenance'),
('audit.view', 'View audit logs'),
('audit.export', 'Export audit logs');

-- Assign all permissions to Super Admin role (ID: 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Assign most permissions to Admin role (ID: 2)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE code NOT IN (
  'system.settings', 'system.backup', 'system.maintenance', 'role.delete', 'user.delete'
);

-- Manager permissions (ID: 3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code IN (
  'user.view', 'customer.view', 'customer.edit', 'lead.view', 'lead.edit',
  'quote.view', 'quote.approve', 'quote.reject', 'order.view', 'order.edit',
  'workorder.view', 'workorder.assign', 'worklog.view', 'production.manage',
  'material.view', 'stock.view', 'supplier.view', 'po.view', 'po.approve',
  'invoice.view', 'payment.view', 'campaign.view', 'marketing.analytics',
  'conversation.view', 'message.view', 'ai.view', 'analytics.view',
  'report.sales', 'report.financial', 'report.inventory', 'report.production', 'report.marketing',
  'audit.view'
);

-- Receptionist permissions (ID: 4)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code IN (
  'customer.create', 'customer.view', 'customer.edit', 'lead.create', 'lead.view',
  'quote.create', 'quote.view', 'order.view', 'order.create',
  'conversation.create', 'conversation.view', 'message.send', 'message.view',
  'file.upload', 'file.view', 'pos.create', 'pos.view'
);

-- Accountant permissions (ID: 5)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE code IN (
  'customer.view', 'order.view', 'invoice.create', 'invoice.view', 'invoice.edit', 'invoice.send',
  'payment.create', 'payment.view', 'payment.refund', 'pos.view',
  'journal.create', 'journal.view', 'accounting.manage',
  'report.sales', 'report.financial', 'report.export', 'supplier.view', 'po.view'
);

-- Marketing Officer permissions (ID: 6)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 6, id FROM permissions WHERE code IN (
  'customer.view', 'lead.view', 'lead.edit', 'campaign.create', 'campaign.view', 
  'campaign.edit', 'campaign.launch', 'marketing.analytics', 'conversation.view',
  'message.send', 'message.view', 'ai.view', 'analytics.view', 'report.marketing',
  'file.upload', 'file.view'
);

-- Technician Officer permissions (ID: 7)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 7, id FROM permissions WHERE code IN (
  'order.view', 'order.edit', 'workorder.create', 'workorder.view', 'workorder.edit',
  'worklog.create', 'worklog.view', 'production.manage', 'material.view',
  'stock.view', 'stock.move', 'file.view', 'file.upload', 'report.production'
);

-- Controller permissions (ID: 8)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 8, id FROM permissions WHERE code IN (
  'material.create', 'material.view', 'material.edit', 'stock.view', 'stock.move', 'stock.adjust',
  'supplier.create', 'supplier.view', 'supplier.edit', 'po.create', 'po.view',
  'workorder.view', 'order.view', 'report.inventory', 'ai.view', 'analytics.view'
);

-- Sales Rep permissions (ID: 9)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 9, id FROM permissions WHERE code IN (
  'customer.create', 'customer.view', 'customer.edit', 'lead.create', 'lead.view', 'lead.edit',
  'quote.create', 'quote.view', 'order.view', 'conversation.create', 'conversation.view',
  'message.send', 'message.view', 'pos.create', 'pos.view', 'report.sales'
);

-- Viewer permissions (ID: 10)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 10, id FROM permissions WHERE code IN (
  'customer.view', 'lead.view', 'quote.view', 'order.view', 'workorder.view', 'worklog.view',
  'material.view', 'stock.view', 'supplier.view', 'po.view', 'invoice.view', 'payment.view',
  'campaign.view', 'conversation.view', 'message.view', 'ai.view', 'analytics.view',
  'report.sales', 'report.financial', 'report.inventory', 'report.production', 'report.marketing'
);

-- Insert comprehensive chart of accounts
INSERT INTO chart_of_accounts (account_code, name, type) VALUES
-- Assets
('1000', 'Cash in Hand', 'asset'),
('1010', 'Bank Account', 'asset'),
('1020', 'Mobile Money Account', 'asset'),
('1100', 'Accounts Receivable', 'asset'),
('1200', 'Raw Materials Inventory', 'asset'),
('1210', 'Finished Goods Inventory', 'asset'),
('1300', 'Equipment', 'asset'),
('1310', 'Accumulated Depreciation - Equipment', 'asset'),
('1400', 'Prepaid Expenses', 'asset'),

-- Liabilities
('2000', 'Accounts Payable', 'liability'),
('2100', 'Accrued Expenses', 'liability'),
('2200', 'Customer Deposits', 'liability'),
('2300', 'VAT Payable', 'liability'),
('2400', 'Payroll Liabilities', 'liability'),
('2500', 'Short-term Loans', 'liability'),

-- Equity
('3000', 'Owner Capital', 'equity'),
('3100', 'Retained Earnings', 'equity'),
('3200', 'Current Year Earnings', 'equity'),

-- Revenue
('4000', 'Printing Services Revenue', 'revenue'),
('4100', 'Design Services Revenue', 'revenue'),
('4200', 'Installation Services Revenue', 'revenue'),
('4300', 'POS Sales Revenue', 'revenue'),
('4400', 'Other Revenue', 'revenue'),

-- Cost of Goods Sold
('5000', 'Raw Materials Cost', 'expense'),
('5100', 'Direct Labor Cost', 'expense'),
('5200', 'Production Overhead', 'expense'),

-- Operating Expenses
('6000', 'Salaries and Wages', 'expense'),
('6100', 'Rent Expense', 'expense'),
('6200', 'Utilities Expense', 'expense'),
('6300', 'Marketing and Advertising', 'expense'),
('6400', 'Office Supplies', 'expense'),
('6500', 'Depreciation Expense', 'expense'),
('6600', 'Insurance Expense', 'expense'),
('6700', 'Professional Services', 'expense'),
('6800', 'Travel and Transportation', 'expense'),
('6900', 'Miscellaneous Expenses', 'expense');

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, phone, password_hash, role_id) VALUES
('System Administrator', 'admin@smartmarket.com', '+1234567890', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);

-- Insert sample materials
INSERT INTO materials (name, unit, category, reorder_level, current_stock) VALUES
('A4 Paper', 'ream', 'Paper', 10, 50),
('Vinyl Roll White', 'meter', 'Vinyl', 5, 25),
('Ink Cartridge Black', 'piece', 'Ink', 3, 8),
('Ink Cartridge Color', 'piece', 'Ink', 3, 6),
('Banner Material', 'meter', 'Banner', 10, 30),
('Lamination Film', 'meter', 'Lamination', 5, 15);

-- Insert sample suppliers
INSERT INTO suppliers (name, contact, rating) VALUES
('Paper Plus Ltd', 'info@paperplus.com', 5),
('Vinyl World', 'sales@vinylworld.com', 4),
('Ink Solutions', 'orders@inksolutions.com', 5),
('Banner Pro', 'contact@bannerpro.com', 4);