-- Complete Suppliers Table Enhancement Migration
-- This migration adds all business-standard fields to the suppliers table

-- Add columns one by one to ensure partial success if some exist
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email VARCHAR(120) AFTER contact;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone VARCHAR(30) AFTER email;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS address TEXT AFTER phone;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS city VARCHAR(100) AFTER address;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Rwanda' AFTER city;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50) AFTER country;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50) DEFAULT 'net_30' AFTER tax_id;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bank_name VARCHAR(120) AFTER payment_terms;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50) AFTER bank_name;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS notes TEXT AFTER bank_account;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE AFTER notes;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_active;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS rating INT DEFAULT 0 AFTER notes;

-- Update existing suppliers to have default values
UPDATE suppliers 
SET 
  is_active = TRUE,
  country = 'Rwanda',
  payment_terms = 'net_30'
WHERE is_active IS NULL OR country IS NULL OR payment_terms IS NULL;

-- Add indexes for better performance
-- We use a stored procedure or just try/catch in the runner, but here we just list them
-- The runner handles "Duplicate key" errors.
CREATE INDEX idx_supplier_email ON suppliers(email);
CREATE INDEX idx_supplier_phone ON suppliers(phone);
CREATE INDEX idx_supplier_active ON suppliers(is_active);
CREATE INDEX idx_supplier_name ON suppliers(name);
