-- Add email column to suppliers table
ALTER TABLE suppliers ADD COLUMN email VARCHAR(255) AFTER contact;

-- Update existing suppliers with a placeholder email if needed (replace with actual emails)
UPDATE suppliers SET email = CONCAT(REPLACE(LOWER(name), ' ', '.'), '@example.com') WHERE email IS NULL;
