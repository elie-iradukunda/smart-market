-- Clean migration with only used tables

-- Core system tables
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT,
    permission_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120),
    email VARCHAR(120) UNIQUE,
    password VARCHAR(255),
    role_id INT,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Customer management
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120),
    email VARCHAR(120),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120),
    email VARCHAR(120),
    phone VARCHAR(20),
    source VARCHAR(50),
    status ENUM('new','contacted','qualified','lost') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales process
CREATE TABLE IF NOT EXISTS quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    total DECIMAL(12,2),
    status ENUM('draft','sent','approved','rejected') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS quote_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT,
    description VARCHAR(255),
    unit_price DECIMAL(12,2),
    quantity INT,
    total DECIMAL(12,2),
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT,
    customer_id INT,
    status ENUM('pending','in_progress','ready','delivered') DEFAULT 'pending',
    due_date DATE,
    deposit_paid DECIMAL(12,2) DEFAULT 0,
    balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Production
CREATE TABLE IF NOT EXISTS work_orders (
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

CREATE TABLE IF NOT EXISTS work_logs (
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
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120),
    unit VARCHAR(50),
    category VARCHAR(100),
    reorder_level INT DEFAULT 0,
    current_stock DECIMAL(12,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120),
    contact VARCHAR(120),
    rating INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    total DECIMAL(12,2),
    status ENUM('pending','approved','sent','received') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
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
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    amount DECIMAL(12,2),
    status ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS payments (
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

CREATE TABLE IF NOT EXISTS pos_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    cashier_id INT,
    total DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS pos_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pos_id INT,
    item_id INT,
    quantity INT,
    price DECIMAL(12,2),
    FOREIGN KEY (pos_id) REFERENCES pos_sales(id)
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_code VARCHAR(50),
    name VARCHAR(120),
    type ENUM('asset','liability','equity','revenue','expense')
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS journal_lines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_id INT,
    account_id INT,
    debit DECIMAL(12,2) DEFAULT 0,
    credit DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (journal_id) REFERENCES journal_entries(id),
    FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id)
);

-- Marketing
CREATE TABLE IF NOT EXISTS campaigns (
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

CREATE TABLE IF NOT EXISTS ad_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    cost_spent DECIMAL(12,2) DEFAULT 0,
    date DATE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- AI and Analytics
CREATE TABLE IF NOT EXISTS ai_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('demand','pricing','churn','reorder','segment'),
    target_id INT,
    predicted_value DECIMAL(12,2),
    confidence DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Files
CREATE TABLE IF NOT EXISTS artwork_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT,
    order_id INT,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    table_name VARCHAR(120),
    record_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed data (only if not exists)
INSERT IGNORE INTO roles (name, description) VALUES
  ('owner', 'Business owner with full access'),
  ('sys_admin', 'System administrator'),
  ('accountant', 'Finance user'),
  ('controller', 'Operations controller'),
  ('reception', 'Front desk receptionist'),
  ('technician', 'Production technician'),
  ('production_manager', 'Production manager'),
  ('inventory_manager', 'Inventory manager'),
  ('sales_rep', 'Sales representative'),
  ('marketing_manager', 'Marketing manager'),
  ('pos_cashier', 'POS cashier'),
  ('support_agent', 'Support agent');

INSERT IGNORE INTO permissions (code, description) VALUES
  ('user.manage', 'Manage users'),
  ('role.manage', 'Manage roles'),
  ('audit.view', 'View audit logs'),
  ('settings.manage', 'Manage settings'),
  ('customer.manage', 'Manage customers'),
  ('customer.view', 'View customers'),
  ('lead.manage', 'Manage leads'),
  ('quote.manage', 'Manage quotes'),
  ('quote.view', 'View quotes'),
  ('quote.approve', 'Approve quotes'),
  ('order.update', 'Update orders'),
  ('order.view', 'View orders'),
  ('workorder.create', 'Create work orders'),
  ('workorder.update', 'Update work orders'),
  ('workorder.view', 'View work orders'),
  ('worklog.create', 'Create work logs'),
  ('inventory.manage', 'Manage inventory'),
  ('material.view', 'View materials'),
  ('supplier.view', 'View suppliers'),
  ('invoice.create', 'Create invoices'),
  ('invoice.view', 'View invoices'),
  ('invoice.send', 'Send invoices'),
  ('payment.create', 'Create payments'),
  ('payment.view', 'View payments'),
  ('payment.refund', 'Refund payments'),
  ('pos.create', 'Create POS sales'),
  ('journal.create', 'Create journal entries'),
  ('report.view', 'View reports'),
  ('campaign.manage', 'Manage campaigns'),
  ('campaign.launch', 'Launch campaigns'),
  ('adperformance.view', 'View ad performance'),
  ('conversation.view', 'View conversations'),
  ('message.send', 'Send messages'),
  ('ai.view', 'View AI insights'),
  ('file.upload', 'Upload files'),
  ('file.view', 'View files');

-- Role permissions (only essential ones)
INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 1, id FROM permissions; -- Owner gets all

INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 2, id FROM permissions WHERE code IN ('user.manage','role.manage','audit.view','settings.manage','report.view');

INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 3, id FROM permissions WHERE code IN ('invoice.create','invoice.view','payment.create','payment.view','journal.create','report.view');

INSERT IGNORE INTO role_permissions (role_id, permission_id) 
SELECT 9, id FROM permissions WHERE code IN ('customer.manage','lead.manage','quote.manage','quote.approve','order.view');