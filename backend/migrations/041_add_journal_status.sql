-- Add status column to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN status ENUM('draft', 'posted') DEFAULT 'draft' AFTER description;

-- Update existing entries to 'posted' status (since they're already in the system)
UPDATE journal_entries SET status = 'posted';
