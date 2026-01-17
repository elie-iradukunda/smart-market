-- Migration: Material Sales Feature
-- Adds pricing per metre and sales recording functionality

-- Add price_per_metre column to materials table
ALTER TABLE materials 
ADD COLUMN price_per_metre DECIMAL(12,2) DEFAULT NULL AFTER current_stock,
ADD COLUMN is_sellable BOOLEAN DEFAULT FALSE AFTER price_per_metre;

-- Create material_sales table to record sales
CREATE TABLE IF NOT EXISTS material_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    customer_id INT,
    sold_by INT NOT NULL,
    metres_sold DECIMAL(12,2) NOT NULL,
    price_per_metre DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (sold_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_material_id (material_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_sold_by (sold_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add comment to table
ALTER TABLE material_sales COMMENT = 'Records of material sales by metre';

