-- Add material and other missing fields to suppliers table
ALTER TABLE suppliers
ADD COLUMN material_id INT NULL AFTER rating,
ADD COLUMN material_name VARCHAR(255) NULL AFTER material_id,
ADD COLUMN material_notes TEXT NULL AFTER material_name,
ADD COLUMN phone VARCHAR(50) NULL AFTER contact,
ADD COLUMN address TEXT NULL AFTER phone,
ADD COLUMN tax_id VARCHAR(100) NULL AFTER address,
ADD COLUMN payment_terms VARCHAR(50) DEFAULT 'net_30' AFTER tax_id,
ADD COLUMN notes TEXT NULL AFTER payment_terms,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER notes,
ADD FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL;
