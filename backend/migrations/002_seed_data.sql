-- Insert default roles
INSERT INTO roles (name, description) VALUES 
('Admin', 'System administrator with full access'),
('Receptionist', 'Handles customers and creates orders'),
('Accountant', 'Manages finances and accounting'),
('Marketing Officer', 'Manages campaigns and promotions'),
('Technician Officer', 'Handles production and work orders'),
('Controller', 'Manages inventory and stock');

-- Insert permissions
INSERT INTO permissions (code, description) VALUES 
('user.create', 'Create new users'),
('user.view', 'View users'),
('customer.create', 'Create customers'),
('customer.view', 'View customers'),
('lead.create', 'Create leads'),
('quote.create', 'Create quotes'),
('quote.approve', 'Approve quotes'),
('order.view', 'View orders'),
('order.update', 'Update orders'),
('material.create', 'Create materials'),
('material.view', 'View materials'),
('stock.move', 'Record stock movements'),
('po.create', 'Create purchase orders'),
('workorder.create', 'Create work orders'),
('workorder.update', 'Update work orders'),
('worklog.create', 'Log work time'),
('invoice.create', 'Create invoices'),
('payment.create', 'Record payments'),
('pos.create', 'Create POS sales'),
('journal.create', 'Create journal entries'),
('campaign.create', 'Create campaigns'),
('campaign.view', 'View campaigns'),
('campaign.update', 'Update campaigns'),
('conversation.create', 'Create conversations'),
('conversation.view', 'View conversations'),
('message.send', 'Send messages'),
('message.view', 'View messages'),
('ai.create', 'Create AI predictions'),
('ai.view', 'View AI insights'),
('report.view', 'View reports'),
('file.upload', 'Upload files');

-- Assign all permissions to Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Assign specific permissions to other roles
-- Receptionist permissions (Role ID: 2)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE code IN (
  'customer.create', 'customer.view', 'lead.create', 'quote.create', 
  'order.view', 'conversation.create', 'conversation.view', 'message.send', 'message.view',
  'file.upload', 'pos.create'
);

-- Accountant permissions (Role ID: 3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code IN (
  'customer.view', 'order.view', 'invoice.create', 'payment.create', 'pos.create', 
  'journal.create', 'report.view'
);

-- Marketing Officer permissions (Role ID: 4)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code IN (
  'customer.view', 'lead.create', 'campaign.create', 'campaign.view', 'campaign.update', 
  'conversation.view', 'message.send', 'message.view', 'ai.view', 'report.view', 'file.upload'
);

-- Technician Officer permissions (Role ID: 5)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE code IN (
  'order.view', 'order.update', 'workorder.create', 'workorder.update', 'worklog.create', 
  'material.view', 'stock.move', 'file.upload', 'report.view'
);

-- Controller permissions (Role ID: 6)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 6, id FROM permissions WHERE code IN (
  'material.create', 'material.view', 'stock.move', 'po.create', 'order.view',
  'workorder.view', 'ai.view', 'report.view'
);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, phone, password_hash, role_id) VALUES
('System Administrator', 'admin@smartmarket.com', '+1234567890', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/jF5Nf7lbmxVgJd7aQvKVzXkzKWZu', 1);

-- Insert default chart of accounts
INSERT INTO chart_of_accounts (account_code, name, type) VALUES
('1000', 'Cash', 'asset'),
('1100', 'Accounts Receivable', 'asset'),
('1200', 'Inventory', 'asset'),
('2000', 'Accounts Payable', 'liability'),
('3000', 'Owner Equity', 'equity'),
('4000', 'Sales Revenue', 'revenue'),
('5000', 'Cost of Goods Sold', 'expense'),
('6000', 'Operating Expenses', 'expense');