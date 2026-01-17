-- Migration script to add transaction_id column to ecommerce_orders table
-- Run this script if you're getting "Unknown column 'transaction_id' in 'field list'" error

-- Check if column already exists before adding
SET @dbname = DATABASE();
SET @tablename = "ecommerce_orders";
SET @columnname = "transaction_id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column transaction_id already exists in ecommerce_orders table' AS result;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " VARCHAR(100) AFTER payment_status;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
