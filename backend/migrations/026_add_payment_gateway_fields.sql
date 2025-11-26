-- Add payment gateway fields to payments table
ALTER TABLE payments 
ADD COLUMN gateway VARCHAR(50) DEFAULT 'cash',
ADD COLUMN gateway_transaction_id VARCHAR(255),
ADD COLUMN gateway_response TEXT,
ADD COLUMN customer_phone VARCHAR(20);