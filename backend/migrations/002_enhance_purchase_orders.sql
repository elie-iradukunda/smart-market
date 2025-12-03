-- Migration to enhance purchase_orders and suppliers tables
-- Run this migration to update the database structure

-- First, add missing columns to suppliers table
ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS email VARCHAR(120) AFTER contact,
ADD COLUMN IF NOT EXISTS phone VARCHAR(30) AFTER email,
ADD COLUMN IF NOT EXISTS address TEXT AFTER phone,
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50) AFTER address,
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50) DEFAULT 'net_30' AFTER tax_id,
ADD COLUMN IF NOT EXISTS notes TEXT AFTER payment_terms,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER notes,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_active,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Now enhance purchase_orders table
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN IF NOT EXISTS order_date DATE DEFAULT (CURRENT_DATE) AFTER supplier_id,
ADD COLUMN IF NOT EXISTS expected_delivery DATE AFTER order_date,
ADD COLUMN IF NOT EXISTS delivery_address TEXT AFTER expected_delivery,
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50) DEFAULT 'net_30' AFTER delivery_address,
ADD COLUMN IF NOT EXISTS notes TEXT AFTER payment_terms,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0 AFTER total,
ADD COLUMN IF NOT EXISTS tax DECIMAL(12,2) DEFAULT 0 AFTER subtotal,
ADD COLUMN IF NOT EXISTS created_by INT AFTER tax,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Add foreign key for created_by if it doesn't exist
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
                  WHERE CONSTRAINT_SCHEMA = DATABASE() 
                  AND TABLE_NAME = 'purchase_orders' 
                  AND CONSTRAINT_NAME = 'fk_po_created_by');

SET @sql = IF(@fk_exists = 0, 
              'ALTER TABLE purchase_orders ADD CONSTRAINT fk_po_created_by FOREIGN KEY (created_by) REFERENCES users(id)', 
              'SELECT "Foreign key already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records to have reference numbers
UPDATE purchase_orders 
SET reference_number = CONCAT('PO-', LPAD(id, 6, '0'))
WHERE reference_number IS NULL;

-- Add indexes for better query performance (ignore errors if they already exist)
-- These will fail silently if indexes already exist
CREATE INDEX idx_po_reference ON purchase_orders(reference_number);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_created_by ON purchase_orders(created_by);
CREATE INDEX idx_supplier_email ON suppliers(email);

