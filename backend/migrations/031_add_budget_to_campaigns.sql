-- Add budget column to campaigns table
ALTER TABLE campaigns ADD COLUMN budget DECIMAL(12,2) DEFAULT 0 AFTER platform;
