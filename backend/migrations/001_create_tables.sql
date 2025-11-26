-- Roles and Permissions
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT,
    status ENUM('active','disabled') DEFAULT 'active',
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- CRM and Orders
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) UNIQUE,
    email VARCHAR(120),
    address VARCHAR(255),
    source ENUM('walkin','whatsapp','instagram','facebook','web','phone')
);

CREATE TABLE leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    channel ENUM('whatsapp','instagram','facebook','web'),
    status ENUM('new','contacted','converted','lost') DEFAULT 'new',
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    created_by INT,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE quote_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT,
    material_id INT,
    description VARCHAR(255),
    unit_price DECIMAL(12,2),
    quantity INT,
    total DECIMAL(12,2),
    FOREIGN KEY (quote_id) REFERENCES quotes(id),
    FOREIGN KEY (material_id) REFERENCES materials(id)
);

CREATE TABLE artwork_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT,
    order_id INT,
    file_url VARCHAR(255),
    version INT DEFAULT 1,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id),
    FOREIGN KEY (order_id) REFERENCES quotes(id)
);

-- Production
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT,
    customer_id INT,
    status ENUM('design','prepress','print','finishing','qa','ready','delivered'),
    due_date DATE,
    deposit_paid DECIMAL(12,2) DEFAULT 0,
    balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    stage ENUM('design','prepress','print','finishing','qa'),
    assigned_to INT,
    started_at DATETIME,
    ended_at DATETIME,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE work_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_order_id INT,
    technician_id INT,
    time_spent_minutes INT,
    material_used TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
    FOREIGN KEY (technician_id) REFERENCES users(id)
);

-- Inventory
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120),
    unit VARCHAR(50),
    category VARCHAR(100),
    reorder_level INT DEFAULT 0,
    current_stock DECIMAL(12,2) DEFAULT 0
);

CREATE TABLE bom (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    material_id INT,
    quantity_required DECIMAL(12,2),
    FOREIGN KEY (material_id) REFERENCES materials(id)
);

CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120),
    contact VARCHAR(120),
    rating INT DEFAULT 0
);

CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    total DECIMAL(12,2),
    status ENUM('pending','approved','sent','received') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT,
    type ENUM('grn','issue','return','adjustment','damage'),
    quantity DECIMAL(12,2),
    reference VARCHAR(120),
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Finance
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    amount DECIMAL(12,2),
    status ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT,
    method VARCHAR(50) DEFAULT 'cash',
    amount DECIMAL(12,2),
    user_id INT,
    reference VARCHAR(120),
    status ENUM('pending','completed','failed') DEFAULT 'completed',
    gateway VARCHAR(50) DEFAULT 'cash',
    gateway_transaction_id VARCHAR(255),
    gateway_response TEXT,
    customer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE pos_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    cashier_id INT,
    total DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);

CREATE TABLE pos_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pos_id INT,
    item_id INT,
    quantity INT,
    price DECIMAL(12,2),
    FOREIGN KEY (pos_id) REFERENCES pos_sales(id)
);

CREATE TABLE chart_of_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_code VARCHAR(50),
    name VARCHAR(120),
    type ENUM('asset','liability','equity','revenue','expense')
);

CREATE TABLE journal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    description TEXT
);

CREATE TABLE journal_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_id INT,
    account_id INT,
    debit DECIMAL(12,2) DEFAULT 0,
    credit DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (journal_id) REFERENCES journal_entries(id),
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id)
);

-- Marketing
CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    subject VARCHAR(255),
    message TEXT,
    platform VARCHAR(50) DEFAULT 'email',
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    status ENUM('active','paused','ended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





-- Communications removed - using email only

-- AI and Analytics
CREATE TABLE ai_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('demand','pricing','churn','reorder','segment'),
    target_id INT,
    predicted_value DECIMAL(12,2),
    confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    table_name VARCHAR(120),
    record_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed roles
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

-- Seed permissions
INSERT INTO permissions (code, description) VALUES
  ('user.manage',          'Create and manage user accounts'),
  ('role.manage',          'Create and manage roles and permissions'),
  ('audit.view',           'View audit logs'),
  ('settings.manage',      'Manage system-wide settings'),
  ('customer.manage',      'Create and manage customers'),
  ('customer.view',        'View customers'),
  ('lead.manage',          'Create and manage leads'),
  ('quote.manage',         'Create and manage quotes and quote items'),
  ('quote.view',           'View quotes'),
  ('quote.approve',        'Approve quotes to convert to orders'),
  ('order.update',         'Update order status'),
  ('order.view',           'View orders'),
  ('workorder.create',     'Create work orders'),
  ('workorder.update',     'Update work orders'),
  ('workorder.view',       'View work orders'),
  ('worklog.create',       'Log time and materials on work orders'),
  ('inventory.manage',     'Manage materials, suppliers, and purchase orders'),
  ('material.view',        'View materials and stock levels'),
  ('supplier.view',        'View suppliers'),
  ('invoice.create',       'Create invoices'),
  ('invoice.view',         'View invoices'),
  ('invoice.send',         'Send invoices to customers'),
  ('payment.create',       'Record payments'),
  ('payment.view',         'View payments'),
  ('payment.refund',       'Process payment refunds'),
  ('pos.create',           'Create POS sales'),
  ('journal.create',       'Create journal entries'),
  ('report.view',          'View financial and operational reports'),
  ('campaign.manage',      'Manage marketing campaigns'),
  ('campaign.launch',      'Launch marketing campaigns'),

  ('conversation.view',    'View conversations'),
  ('message.send',         'Send replies to customers'),
  ('ai.view',              'View AI predictions and insights'),
  ('file.upload',          'Upload files and artwork'),
  ('file.view',            'View uploaded files');

-- Role permission assignments (optimized approach)
-- Owner: Full system access
INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions;

-- System Admin: User & system management
INSERT INTO role_permissions (role_id, permission_id) SELECT 2, id FROM permissions 
WHERE code IN ('user.manage','role.manage','audit.view','settings.manage','report.view');

-- Accountant: Finance operations
INSERT INTO role_permissions (role_id, permission_id) SELECT 3, id FROM permissions 
WHERE code IN ('invoice.create','invoice.view','invoice.send','payment.create','payment.view','payment.refund','journal.create','report.view','customer.view');

-- Controller: Operations oversight
INSERT INTO role_permissions (role_id, permission_id) SELECT 4, id FROM permissions 
WHERE code IN ('order.view','workorder.view','invoice.view','payment.view','report.view','material.view','supplier.view','ai.view');

-- Reception: Front desk operations
INSERT INTO role_permissions (role_id, permission_id) SELECT 5, id FROM permissions 
WHERE code IN ('customer.manage','lead.manage','quote.manage','quote.view','order.view','file.upload','file.view');

-- Technician: Production work
INSERT INTO role_permissions (role_id, permission_id) SELECT 6, id FROM permissions 
WHERE code IN ('workorder.view','worklog.create','material.view','file.view');

-- Production Manager: Production oversight
INSERT INTO role_permissions (role_id, permission_id) SELECT 7, id FROM permissions 
WHERE code IN ('workorder.create','workorder.update','workorder.view','worklog.create','order.update','material.view','supplier.view','report.view','file.view');

-- Inventory Manager: Stock control
INSERT INTO role_permissions (role_id, permission_id) SELECT 8, id FROM permissions 
WHERE code IN ('inventory.manage','material.view','supplier.view','report.view');

-- Sales Rep: Sales process
INSERT INTO role_permissions (role_id, permission_id) SELECT 9, id FROM permissions 
WHERE code IN ('customer.manage','lead.manage','quote.manage','quote.view','quote.approve','order.view','file.upload','file.view');

-- Marketing Manager: Marketing operations
INSERT INTO role_permissions (role_id, permission_id) SELECT 10, id FROM permissions 
WHERE code IN ('campaign.manage','campaign.launch','customer.view','report.view','ai.view');

-- POS Cashier: Point of sale
INSERT INTO role_permissions (role_id, permission_id) SELECT 11, id FROM permissions 
WHERE code IN ('pos.create','customer.view','payment.create');

-- Support Agent: Customer support
INSERT INTO role_permissions (role_id, permission_id) SELECT 12, id FROM permissions 
WHERE code IN ('conversation.view','message.send','customer.view','file.view');

-- Seed users
INSERT INTO users (name, email, phone, password_hash, role_id, status) VALUES
  ('Owner',        'owner@topdesign.com',        '+250700000001', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 1, 'active'),
  ('Sys Admin',    'sysadmin@topdesign.com',     '+250700000002', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 2, 'active'),
  ('Accountant',   'accountant@topdesign.com',   '+250700000003', '$2b$10$3vur6LuS/v7Ffx78D8YG5ecrVSfyA8oADp4nu7oyF9Kw2gLxHPFSO', 3, 'active'),
  ('Controller',   'controller@topdesign.com',   '+250700000004', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 4, 'active'),
  ('Reception',    'reception@topdesign.com',    '+250700000005', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 5, 'active'),
  ('Technician 1', 'tech1@topdesign.com',        '+250700000006', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 6, 'active'),
  ('Prod Manager', 'prod.manager@topdesign.com', '+250700000007', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 7, 'active'),
  ('Storekeeper',  'store@topdesign.com',        '+250700000008', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 8, 'active'),
  ('Sales Rep',    'sales@topdesign.com',        '+250700000009', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 9, 'active'),
  ('Marketing',    'marketing@topdesign.com',    '+250700000010', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 10, 'active'),
  ('Cashier',      'cashier@topdesign.com',      '+250700000011', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 11, 'active'),
  ('Support',      'support@topdesign.com',      '+250700000012', '$2b$10$y46HLKs9u4vtr9MbN9iIqeTbqWY6fqqH5tlupdrWypdZW2nkKioS.', 12, 'active');