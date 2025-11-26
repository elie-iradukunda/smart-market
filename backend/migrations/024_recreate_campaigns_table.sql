-- Drop and recreate campaigns table with new structure
DROP TABLE IF EXISTS ad_performance;
DROP TABLE IF EXISTS campaigns;

CREATE TABLE campaigns (
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