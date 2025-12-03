-- Create ads table for marketing advertisements
CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    button_text VARCHAR(100) DEFAULT 'Learn More',
    background_color VARCHAR(50) DEFAULT '#4F46E5',
    text_color VARCHAR(50) DEFAULT '#FFFFFF',
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Add index for active ads query optimization
CREATE INDEX idx_ads_active ON ads(is_active, start_date, end_date, display_order);

-- Add permissions for ad management
INSERT IGNORE INTO permissions (code, description) VALUES
  ('ad.create', 'Create advertisements'),
  ('ad.view', 'View advertisements'),
  ('ad.edit', 'Edit advertisements'),
  ('ad.delete', 'Delete advertisements'),
  ('ad.publish', 'Publish advertisements');

-- Grant ad permissions to marketing manager (role_id 10)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 10, id FROM permissions WHERE code IN ('ad.create', 'ad.view', 'ad.edit', 'ad.delete', 'ad.publish');

-- Grant ad permissions to owner (role_id 1)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE code IN ('ad.create', 'ad.view', 'ad.edit', 'ad.delete', 'ad.publish');
