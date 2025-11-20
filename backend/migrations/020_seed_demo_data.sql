-- 020_seed_demo_data.sql
-- Demo business data for Smart Market / TOP Design
-- NOTE: run AFTER 001_create_tables.sql and 010_seed_roles_permissions_users.sql

SET FOREIGN_KEY_CHECKS = 0;

/* =========================
   1. CUSTOMERS
   ========================= */

INSERT INTO customers (id, name, phone, email, address, source) VALUES
  (1, 'ABC Marketing Ltd', '+250780000001', 'contact@abcmarketing.com', 'Kigali, Rwanda', 'web'),
  (2, 'Sunrise Hotel',     '+250780000002', 'info@sunrisehotel.rw',     'Kigali, Rwanda', 'walkin'),
  (3, 'Green Farm Co',     '+250780000003', 'hello@greenfarm.rw',       'Muhanga, Rwanda', 'whatsapp'),
  (4, 'TechHub Cowork',    '+250780000004', 'team@techhub.rw',          'Kigali, Rwanda', 'instagram')
ON DUPLICATE KEY UPDATE name = VALUES(name);

/* =========================
   2. LEADS
   ========================= */

INSERT INTO leads (id, customer_id, channel, status) VALUES
  (1, 1, 'web',       'converted'),
  (2, 2, 'whatsapp',  'contacted'),
  (3, 3, 'whatsapp',  'new'),
  (4, 4, 'instagram', 'converted');

/* =========================
   3. QUOTES & QUOTE ITEMS
   ========================= */

-- Assume created_by users from seed: 9 = Sales Rep, 10 = Marketing, 5 = Reception
INSERT INTO quotes (id, customer_id, created_by, total_amount, status, created_at) VALUES
  (1, 1, 9,  500000, 'approved', NOW() - INTERVAL 10 DAY),
  (2, 2, 9,  250000, 'pending',  NOW() - INTERVAL 5 DAY),
  (3, 3, 5,  150000, 'approved', NOW() - INTERVAL 3 DAY),
  (4, 4, 10, 800000, 'approved', NOW() - INTERVAL 15 DAY)
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount);

INSERT INTO quote_items (id, quote_id, description, unit_price, quantity, total) VALUES
  (1, 1, 'Roll-up banners (x5)',     80000, 5,  400000),
  (2, 1, 'Design fee',              100000, 1, 100000),
  (3, 2, 'Restaurant menu boards',   50000, 5,  250000),
  (4, 3, 'Product labels (x1000)',   1500, 1000,150000),
  (5, 4, 'Large outdoor billboard', 800000, 1, 800000)
ON DUPLICATE KEY UPDATE total = VALUES(total);

/* =========================
   4. ORDERS (PRODUCTION)
   ========================= */

INSERT INTO orders (id, quote_id, customer_id, status, due_date, deposit_paid, balance, created_at) VALUES
  (1, 1, 1, 'print',      CURDATE() + INTERVAL 2 DAY, 250000, 250000, NOW() - INTERVAL 9 DAY),
  (2, 2, 2, 'design',     CURDATE() + INTERVAL 5 DAY,  50000, 200000, NOW() - INTERVAL 4 DAY),
  (3, 3, 3, 'finishing',  CURDATE() + INTERVAL 1 DAY, 150000,      0, NOW() - INTERVAL 2 DAY),
  (4, 4, 4, 'qa',         CURDATE() + INTERVAL 7 DAY, 400000, 400000, NOW() - INTERVAL 14 DAY)
ON DUPLICATE KEY UPDATE status = VALUES(status);

/* =========================
   5. WORK ORDERS & WORK LOGS
   ========================= */

-- Use technician user id 6 from seed
INSERT INTO work_orders (id, order_id, stage, assigned_to, started_at, ended_at, notes) VALUES
  (1, 1, 'design',    6, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 7 DAY, 'Initial design concepts'),
  (2, 1, 'print',     6, NOW() - INTERVAL 3 DAY, NULL,                   'Waiting for material delivery'),
  (3, 3, 'print',     6, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY, 'Labels printed'),
  (4, 3, 'finishing', 6, NOW() - INTERVAL 1 DAY, NULL,                   'Cutting & packing in progress')
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

INSERT INTO work_logs (id, work_order_id, technician_id, time_spent_minutes, material_used) VALUES
  (1, 1, 6, 120, 'Paper stock, ink CMYK'),
  (2, 2, 6,  60, 'Vinyl roll, laminate'),
  (3, 3, 6,  90, 'Label stock, varnish'),
  (4, 4, 6,  45, 'Cutting blades, packaging')
ON DUPLICATE KEY UPDATE time_spent_minutes = VALUES(time_spent_minutes);

/* =========================
   6. INVENTORY: MATERIALS, SUPPLIERS, PURCHASE ORDERS, STOCK MOVEMENTS
   ========================= */

INSERT INTO materials (id, name, unit, category, reorder_level, current_stock) VALUES
  (1, 'Vinyl roll 1.2m',       'm',   'Large format', 50, 40),
  (2, 'PVC banner 440gsm',     'm',   'Large format', 80, 60),
  (3, 'Label stock gloss A4',  'sheet','Labels',      500,120),
  (4, 'Ink CMYK set',          'set', 'Consumables', 10,  4),
  (5, 'Lamination film 75mic', 'm',   'Finishing',    60, 30)
ON DUPLICATE KEY UPDATE current_stock = VALUES(current_stock);

INSERT INTO suppliers (id, name, contact, rating) VALUES
  (1, 'PrintSupplies Rwanda', '+250780010001', 5),
  (2, 'Africa Media Stock',   '+250780010002', 4)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO purchase_orders (id, supplier_id, total, status, created_at) VALUES
  (1, 1, 800000, 'sent',     NOW() - INTERVAL 5 DAY),
  (2, 2, 450000, 'approved', NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO stock_movements (id, material_id, type, quantity, reference, user_id, created_at) VALUES
  (1, 1, 'issue',   20, 'Order #1 print',      6, NOW() - INTERVAL 1 DAY),
  (2, 3, 'issue',   50, 'Order #3 labels',     6, NOW() - INTERVAL 1 DAY),
  (3, 4, 'grn',      5, 'PO #1 ink delivery',  8, NOW() - INTERVAL 3 DAY),
  (4, 5, 'damage',   5, 'Film damaged',        8, NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

/* =========================
   7. FINANCE: INVOICES, PAYMENTS, POS
   ========================= */

INSERT INTO invoices (id, order_id, amount, status, created_at) VALUES
  (1, 1, 500000, 'partial', NOW() - INTERVAL 8 DAY),
  (2, 2, 250000, 'unpaid',  NOW() - INTERVAL 4 DAY),
  (3, 3, 150000, 'paid',    NOW() - INTERVAL 2 DAY),
  (4, 4, 800000, 'unpaid',  NOW() - INTERVAL 10 DAY)
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Use accountant (3) and cashier (11) as user_id for payments
INSERT INTO payments (id, invoice_id, method, amount, user_id, reference, created_at) VALUES
  (1, 1, 'momo', 250000, 3,  'MOMO-TXN-001', NOW() - INTERVAL 7 DAY),
  (2, 3, 'cash',150000, 11, 'CASH-REC-003', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE amount = VALUES(amount);

INSERT INTO pos_sales (id, customer_id, cashier_id, total, created_at) VALUES
  (1, 2, 11,  50000, NOW() - INTERVAL 1 DAY),
  (2, 1, 11,  75000, NOW() - INTERVAL 2 DAY)
ON DUPLICATE KEY UPDATE total = VALUES(total);

INSERT INTO pos_items (id, pos_id, item_id, quantity, price) VALUES
  (1, 1, 1, 2, 25000),
  (2, 2, 3, 3, 25000)
ON DUPLICATE KEY UPDATE price = VALUES(price);

/* =========================
   8. CHART OF ACCOUNTS & JOURNALS (MINIMAL)
   ========================= */

INSERT INTO chart_of_accounts (id, account_code, name, type) VALUES
  (1, '1000', 'Cash',                 'asset'),
  (2, '1100', 'Accounts Receivable',  'asset'),
  (3, '2000', 'Accounts Payable',     'liability'),
  (4, '4000', 'Sales Revenue',        'revenue'),
  (5, '5000', 'Cost of Goods Sold',   'expense')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO journal_entries (id, date, description) VALUES
  (1, CURDATE() - INTERVAL 3 DAY, 'Invoice #1 issued'),
  (2, CURDATE() - INTERVAL 2 DAY, 'Payment on Invoice #1'),
  (3, CURDATE() - INTERVAL 1 DAY, 'POS sales day summary')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO journal_lines (id, journal_id, account_id, debit, credit) VALUES
  (1, 1, 2, 500000,      0), -- AR
  (2, 1, 4,      0, 500000), -- Sales
  (3, 2, 1, 250000,      0), -- Cash
  (4, 2, 2,      0, 250000), -- AR
  (5, 3, 1, 125000,      0), -- Cash
  (6, 3, 4,      0, 125000)  -- Sales
ON DUPLICATE KEY UPDATE debit = VALUES(debit), credit = VALUES(credit);

/* =========================
   9. MARKETING: CAMPAIGNS & AD PERFORMANCE
   ========================= */

INSERT INTO campaigns (id, name, platform, budget, status, created_at) VALUES
  (1, 'Whatsapp reorders', 'whatsapp', 300000, 'active', NOW() - INTERVAL 20 DAY),
  (2, 'Instagram showcase','instagram',500000, 'active', NOW() - INTERVAL 15 DAY),
  (3, 'Facebook promos',   'facebook', 400000, 'paused', NOW() - INTERVAL 30 DAY)
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO ad_performance (id, campaign_id, impressions, clicks, conversions, cost_spent, date) VALUES
  (1, 1,  5000, 400, 40, 120000, CURDATE() - INTERVAL 3 DAY),
  (2, 2, 12000, 800, 60, 200000, CURDATE() - INTERVAL 2 DAY),
  (3, 3,  8000, 300, 15,  80000, CURDATE() - INTERVAL 5 DAY)
ON DUPLICATE KEY UPDATE impressions = VALUES(impressions);

/* =========================
   10. COMMUNICATIONS: CONVERSATIONS & MESSAGES
   ========================= */

INSERT INTO conversations (id, customer_id, channel, status) VALUES
  (1, 1, 'whatsapp',  'open'),
  (2, 2, 'instagram', 'open'),
  (3, 3, 'email',     'closed')
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO messages (id, conversation_id, sender, message, attachments, timestamp) VALUES
  (1, 1, 'customer', 'Hi, we need new banners for next month.', NULL,           NOW() - INTERVAL 2 DAY),
  (2, 1, 'staff',    'Thanks! We will prepare a quote today.',  NULL,           NOW() - INTERVAL 2 DAY + INTERVAL 2 HOUR),
  (3, 2, 'customer', 'Can you share recent samples?',          NULL,           NOW() - INTERVAL 1 DAY),
  (4, 2, 'staff',    'Sure, sending you a PDF now.',           'samples.pdf',  NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR),
  (5, 3, 'customer', 'Order delivered, thanks!',               NULL,           NOW() - INTERVAL 6 DAY)
ON DUPLICATE KEY UPDATE message = VALUES(message);

/* =========================
   11. AI PREDICTIONS & AUDIT LOGS (BASIC)
   ========================= */

INSERT INTO ai_predictions (id, type, target_id, predicted_value, confidence, created_at) VALUES
  (1, 'demand',  1, 120.00, 85.0, NOW() - INTERVAL 2 DAY),
  (2, 'reorder', 4,  10.00, 90.0, NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE predicted_value = VALUES(predicted_value);

INSERT INTO audit_logs (id, user_id, action, table_name, record_id, timestamp, ip_address) VALUES
  (1, 2,  'Created quote #1',      'quotes',      1, NOW() - INTERVAL 10 DAY, '127.0.0.1'),
  (2, 9,  'Updated order #1',      'orders',      1, NOW() - INTERVAL 8 DAY,  '127.0.0.1'),
  (3, 3,  'Recorded payment #1',   'payments',    1, NOW() - INTERVAL 7 DAY,  '127.0.0.1'),
  (4, 11, 'Registered POS sale #1','pos_sales',   1, NOW() - INTERVAL 1 DAY,  '127.0.0.1')
ON DUPLICATE KEY UPDATE action = VALUES(action);

SET FOREIGN_KEY_CHECKS = 1;
