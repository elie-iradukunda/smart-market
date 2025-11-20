-- Seed roles, permissions, and example users for smart_market
-- Run this AFTER 001_create_tables.sql has created the schema.

/* =========================
   1. ROLES
   ========================= */

INSERT INTO roles (name, description) VALUES
  ('owner',              'Business owner / managing director with full access'),
  ('sys_admin',          'System administrator managing users, roles and settings'),
  ('accountant',         'Finance user managing invoices, payments, and journals'),
  ('controller',         'Operations/finance controller overseeing KPIs'),
  ('reception',          'Front desk / receptionist handling incoming jobs'),
  ('technician',         'Production technician working on work orders'),
  ('production_manager', 'Production manager overseeing work orders and pipeline'),
  ('inventory_manager',  'Storekeeper / inventory manager'),
  ('sales_rep',          'Sales/CRM user managing leads, quotes and customers'),
  ('marketing_manager',  'Marketing manager managing campaigns and performance'),
  ('pos_cashier',        'POS cashier recording counter sales'),
  ('support_agent',      'Support/communications agent using unified inbox');


/* =========================
   2. PERMISSIONS
   Codes chosen to match backend controllers and routes.
   NOTE: use INSERT IGNORE so this migration can be re-run safely.
   ========================= */

INSERT IGNORE INTO permissions (code, description) VALUES
  -- Admin / system
  ('user.manage',          'Create and manage user accounts'),
  ('role.manage',          'Create and manage roles and permissions'),
  ('audit.view',           'View audit logs'),
  ('settings.manage',      'Manage system-wide settings'),

  -- CRM / sales
  ('customer.manage',      'Create and manage customers'),
  ('lead.manage',          'Create and manage leads'),
  ('quote.manage',         'Create and manage quotes and quote items'),

  -- Orders / production
  ('order.update',         'Update order status'),
  ('workorder.create',     'Create work orders'),
  ('workorder.update',     'Update work orders'),
  ('worklog.create',       'Log time and materials on work orders'),

  -- Inventory
  ('inventory.manage',     'Manage materials, suppliers, and purchase orders'),
  ('material.view',        'View materials and stock levels'),

  -- Finance
  ('invoice.create',       'Create invoices'),
  ('payment.create',       'Record payments'),
  ('pos.create',           'Create POS sales'),
  ('journal.create',       'Create journal entries'),
  ('report.view',          'View financial and operational reports'),

  -- Marketing
  ('campaign.manage',      'Manage marketing campaigns'),
  ('adperformance.view',   'View marketing performance'),

  -- Communications
  ('conversation.view',    'View conversations'),
  ('message.send',         'Send replies to customers'),

  -- AI
  ('ai.view',              'View AI predictions and insights');


/* =========================
   3. ROLE → PERMISSION MAPPINGS
   Using subselects so we dont rely on hard-coded IDs.
   ========================= */

-- OWNER: everything
-- OWNER: all permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON 1=1
WHERE r.name IN ('owner');

-- SYS_ADMIN: admin + reports
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'user.manage','role.manage','audit.view','settings.manage','report.view'
)
WHERE r.name = 'sys_admin';

-- ACCOUNTANT: finance + reports
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'invoice.create','payment.create','journal.create',
  'pos.create','report.view'
)
WHERE r.name = 'accountant';

-- CONTROLLER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'report.view','inventory.manage','material.view'
)
WHERE r.name = 'controller';

-- RECEPTION
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'customer.manage','lead.manage','quote.manage','material.view'
)
WHERE r.name = 'reception';

-- TECHNICIAN
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'worklog.create','workorder.update','order.update','material.view'
)
WHERE r.name = 'technician';

-- PRODUCTION MANAGER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'order.update','workorder.create','workorder.update',
  'worklog.create','inventory.manage','material.view','report.view'
)
WHERE r.name = 'production_manager';

-- INVENTORY MANAGER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'inventory.manage','material.view','report.view'
)
WHERE r.name = 'inventory_manager';

-- SALES REP
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'customer.manage','lead.manage','quote.manage'
)
WHERE r.name = 'sales_rep';

-- MARKETING MANAGER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'campaign.manage','adperformance.view',
  'lead.manage','report.view','ai.view'
)
WHERE r.name = 'marketing_manager';

-- POS CASHIER
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'pos.create','payment.create'
)
WHERE r.name = 'pos_cashier';

-- SUPPORT AGENT
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'conversation.view','message.send','customer.manage'
)
WHERE r.name = 'support_agent';



/* =========================
   4. USERS FOR EACH ROLE
   NOTE: This variant uses fixed role_id integers so it is
   safe even if roles were inserted multiple times.
   Adjust role_id values if your IDs differ.
   ========================= */

INSERT INTO users (name, email, phone, password_hash, role_id, status)
VALUES
  ('Owner',        'owner@topdesign.com',        '+250700000001',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   1, 'active'),
  ('Sys Admin',    'sysadmin@topdesign.com',     '+250700000002',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   2, 'active'),
  ('Accountant',   'accountant@topdesign.com',   '+250700000003',
   '$2b$10$3vur6LuS/v7Ffx78D8YG5ecrVSfyA8oADp4nu7oyF9Kw2gLxHPFSO',
   3, 'active'),
  ('Controller',   'controller@topdesign.com',   '+250700000004',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   4, 'active'),
  ('Reception',    'reception@topdesign.com',    '+250700000005',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   5, 'active'),
  ('Technician 1', 'tech1@topdesign.com',        '+250700000006',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   6, 'active'),
  ('Prod Manager', 'prod.manager@topdesign.com', '+250700000007',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   7, 'active'),
  ('Storekeeper',  'store@topdesign.com',        '+250700000008',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   8, 'active'),
  ('Sales Rep',    'sales@topdesign.com',        '+250700000009',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   9, 'active'),
  ('Marketing',    'marketing@topdesign.com',    '+250700000010',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   10, 'active'),
  ('Cashier',      'cashier@topdesign.com',      '+250700000011',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   11, 'active'),
  ('Support',      'support@topdesign.com',      '+250700000012',
   '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.',
   12, 'active');