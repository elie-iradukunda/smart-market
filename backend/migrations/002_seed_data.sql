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

-- Additional demo users for each main role
-- All use the same password hash as admin (admin123) for development
INSERT INTO users (name, email, phone, password_hash, role_id) VALUES
('Front Desk Reception', 'reception@smartmarket.com', '+250780000010', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/jF5Nf7lbmxVgJd7aQvKVzXkzKWZu', 2),
('Finance Accountant', 'accountant@smartmarket.com', '+250780000011', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/jF5Nf7lbmxVgJd7aQvKVzXkzKWZu', 3),
('Marketing Officer', 'marketing@smartmarket.com', '+250780000012', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/jF5Nf7lbmxVgJd7aQvKVzXkzKWZu', 4),
('Floor Technician', 'technician@smartmarket.com', '+250780000013', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/jF5Nf7lbmxVgJd7aQvKVzXkzKWZu', 5),
('Inventory Controller', 'controller@smartmarket.com', '+250780000014', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8/jF5Nf7lbmxVgJd7aQvKVzXkzKWZu', 6);

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

-- ==========================================================
-- BUSINESS DATA SEED (customers, quotes, orders, inventory,
-- finance, marketing, communications, ai, etc.)
-- Note: we reuse existing admin user (id = 1) as creator
-- and technician where a user FK is required.
-- ==========================================================

-- CRM: customers
INSERT INTO customers (name, phone, email, address, source) VALUES
('Acme School', '+250780000001', 'contact@acmeschool.rw', 'KG 123 St, Kigali', 'web'),
('Bright Church', '+250780000002', 'info@brightchurch.rw', 'KN 45 Ave, Kigali', 'whatsapp'),
('Downtown Cafe', '+250780000003', 'hello@downtowncafe.rw', 'Downtown mall, Kigali', 'walkin'),
('City University', '+250780000004', 'marketing@cityuni.rw', 'KG 555 Blvd, Kigali', 'instagram');

-- CRM: leads
INSERT INTO leads (customer_id, channel, status) VALUES
(1, 'web', 'converted'),
(2, 'whatsapp', 'contacted'),
(3, 'whatsapp', 'new'),
(4, 'instagram', 'contacted');

-- Quotes and items
INSERT INTO quotes (customer_id, created_by, total_amount, status) VALUES
(1, 1, 500000, 'approved'),  -- Large banner job
(2, 1, 220000, 'pending'),   -- Church flyers & posters
(3, 1, 85000,  'approved');  -- Cafe menus

INSERT INTO quote_items (quote_id, description, unit_price, quantity, total) VALUES
(1, 'PVC banner 3m x 1m', 50000, 5, 250000),
(1, 'Roll-up stand design & print', 50000, 5, 250000),
(2, 'A5 flyers full color (1000pcs)', 220, 500, 110000),
(2, 'A2 posters (100pcs)', 1100, 100, 110000),
(3, 'Table menu A4 laminated (50pcs)', 1700, 50, 85000);

-- Artwork files (linked to quotes)
INSERT INTO artwork_files (quote_id, order_id, file_url, version) VALUES
(1, NULL, 'https://files.topdesign.local/acme-banners-v1.pdf', 1),
(2, NULL, 'https://files.topdesign.local/bright-flyers-v1.pdf', 1),
(3, NULL, 'https://files.topdesign.local/cafe-menus-v1.pdf', 1);

-- Orders created from approved quotes (1 and 3)
INSERT INTO orders (quote_id, customer_id, status, due_date, deposit_paid, balance) VALUES
(1, 1, 'design',    DATE_ADD(CURDATE(), INTERVAL 3 DAY), 250000, 250000),
(3, 3, 'prepress',  DATE_ADD(CURDATE(), INTERVAL 1 DAY),  42500,  42500);

-- Production: work orders for each stage
INSERT INTO work_orders (order_id, stage, assigned_to, started_at, ended_at, notes) VALUES
-- Order 1: Acme School campaign
(1, 'design',    1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY, 'Initial layouts approved.'),
(1, 'prepress',  1, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY, 'Files prepared for large format.'),
(1, 'print',     1, NOW() - INTERVAL 1 DAY, NULL,                     'Printing in progress.'),
-- Order 2: Downtown Cafe menus
(2, 'design',    1, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 20 HOUR, 'Menu layout finalized.'),
(2, 'prepress',  1, NOW() - INTERVAL 20 HOUR, NOW() - INTERVAL 10 HOUR, 'Color profiles adjusted.');

-- Work logs
INSERT INTO work_logs (work_order_id, technician_id, time_spent_minutes, material_used) VALUES
(1, 1, 120, 'Design time for banners and roll-ups'),
(2, 1, 90,  'Pre-press checks and imposition'),
(3, 1, 60,  'First print run on PVC roll'),
(4, 1, 45,  'Menu design variants'),
(5, 1, 30,  'Pre-press proofing');

-- Inventory: materials
INSERT INTO materials (name, unit, category, reorder_level, current_stock) VALUES
('PVC Banner Roll 3m', 'meter', 'Large format', 50, 200),
('Vinyl Sticker Roll', 'meter', 'Large format', 30, 150),
('A4 130gsm Gloss', 'sheet', 'Digital print', 500, 5000),
('Lamination Film 32mic', 'meter', 'Finishing', 100, 800),
('Foam Board 5mm', 'sheet', 'Display', 20, 120);

-- BOM templates
INSERT INTO bom (product_name, material_id, quantity_required) VALUES
('PVC Banner 3x1m', 1, 3.2),
('Roll-up Stand', 2, 1.5),
('A5 Flyer', 3, 0.5),
('Laminated Menu', 3, 1.0);

-- Suppliers
INSERT INTO suppliers (name, contact, rating) VALUES
('Rwanda Print Supplies', '+250780010010', 5),
('East Africa Papers', '+250780010020', 4),
('WideFormat Imports', '+250780010030', 4);

-- Purchase orders
INSERT INTO purchase_orders (supplier_id, total, status) VALUES
(1, 1500000, 'approved'),
(2, 800000,  'sent'),
(3, 650000,  'received');

-- Stock movements
INSERT INTO stock_movements (material_id, type, quantity, reference, user_id) VALUES
(1, 'grn',    100, 'PO-1', 1),
(3, 'grn',   2000, 'PO-2', 1),
(1, 'issue',   30, 'ORDER-1', 1),
(3, 'issue',  500, 'ORDER-2', 1),
(2, 'adjustment', -5, 'Damage - print head issue', 1);

-- Finance: invoices for orders
INSERT INTO invoices (order_id, amount, status) VALUES
(1, 500000, 'partial'),
(2,  85000, 'unpaid');

-- Payments
INSERT INTO payments (invoice_id, method, amount, user_id, reference) VALUES
(1, 'cash', 250000, 1, 'DEP-ACME-001');

-- POS: walk-in sales
INSERT INTO pos_sales (customer_id, cashier_id, total) VALUES
(3, 1, 35000.00),  -- Downtown Cafe
(NULL, 1, 12000.00), -- Anonymous walk-in
(2, 1, 58000.00);  -- Bright Church quick job

INSERT INTO pos_items (pos_id, item_id, quantity, price) VALUES
(1, 1, 1, 25000.00),
(1, 3, 2,  5000.00),
(2, 3, 4,  3000.00),
(3, 2, 2, 19000.00);

-- Journal entries and lines (simple opening balances)
INSERT INTO journal_entries (date, description) VALUES
(CURDATE() - INTERVAL 10 DAY, 'Opening balances'),
(CURDATE() - INTERVAL 5 DAY, 'Inventory purchase'),
(CURDATE() - INTERVAL 2 DAY, 'POS sales');

INSERT INTO journal_lines (journal_id, account_id, debit, credit) VALUES
-- J1: owner invests cash
(1, 1, 1000000, 0),   -- Cash
(1, 5, 0, 1000000),   -- Owner Equity
-- J2: buy inventory on credit
(2, 3, 800000, 0),    -- Inventory
(2, 4, 0, 800000),    -- Accounts Payable
-- J3: POS sale (cash + revenue)
(3, 1, 50000, 0),     -- Cash
(3, 6, 0, 50000);     -- Sales Revenue

-- Marketing: campaigns and ad performance
INSERT INTO campaigns (name, platform, budget, status) VALUES
('Back to School 2025', 'facebook', 500000, 'active'),
('Church Outreach Posters', 'instagram', 200000, 'paused'),
('Cafe Loyalty Launch', 'whatsapp', 150000, 'active');

INSERT INTO ad_performance (campaign_id, impressions, clicks, conversions, cost_spent, date) VALUES
(1, 12000, 800, 60, 120000, CURDATE() - INTERVAL 3 DAY),
(1, 15000, 950, 80, 160000, CURDATE() - INTERVAL 2 DAY),
(1, 18000, 1100, 95, 180000, CURDATE() - INTERVAL 1 DAY),
(2, 8000, 300, 15, 50000, CURDATE() - INTERVAL 4 DAY),
(3, 6000, 450, 40, 40000, CURDATE() - INTERVAL 1 DAY);

-- Communications: conversations and messages
INSERT INTO conversations (customer_id, channel, status) VALUES
(1, 'whatsapp', 'open'),
(2, 'instagram', 'open'),
(3, 'whatsapp', 'closed');

INSERT INTO messages (conversation_id, sender, message, attachments) VALUES
(1, 'customer', 'Hi, we need 5 large banners for the school opening.', NULL),
(1, 'staff',    'Great, we can do that for you. I will prepare a quote.', NULL),
(1, 'customer', 'Please also add 5 roll-up stands.', NULL),
(2, 'customer', 'Can you design posters for our upcoming event?', NULL),
(2, 'staff',    'Yes, please share the event details and dates.', NULL),
(3, 'customer', 'Thanks, the menus look great!', NULL);

-- AI predictions sample
INSERT INTO ai_predictions (type, target_id, predicted_value, confidence) VALUES
('demand', 1, 200.00, 92.5),   -- demand for PVC Banner Roll
('reorder', 3, 1500.00, 88.0), -- reorder suggestion for A4 gloss
('pricing', 1, 52000.00, 75.0);