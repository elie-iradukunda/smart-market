CREATE TABLE IF NOT EXISTS custom_design_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_sqm DECIMAL(15, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial data matching previous hardcoded values
INSERT INTO custom_design_settings (product_key, name, description, price_per_sqm) VALUES
('signboard', 'Signboard', 'Durable outdoor & indoor signboards', 45000.00),
('banner', 'Banner', 'High-quality vinyl PVC banners', 15000.00),
('shirt', 'T-shirt printing', 'Custom garment & apparel branding', 8500.00),
('stickers', 'Stickers', 'Vinyl cut & printed stickers', 12000.00),
('other', 'Other Design', 'Custom visual design products', 20000.00)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    price_per_sqm = VALUES(price_per_sqm);
