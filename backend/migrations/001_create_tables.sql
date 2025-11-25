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
    description VARCHAR(255),
    unit_price DECIMAL(12,2),
    quantity INT,
    total DECIMAL(12,2),
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
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
    name VARCHAR(120),
    platform ENUM('facebook','instagram','whatsapp'),
    budget DECIMAL(12,2),
    status ENUM('active','paused','ended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ad_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    cost_spent DECIMAL(12,2) DEFAULT 0,
    date DATE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Communications
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    channel ENUM('whatsapp','instagram','facebook','email'),
    status ENUM('open','closed') DEFAULT 'open',
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT,
    sender ENUM('customer','staff'),
    message TEXT,
    attachments VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);

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