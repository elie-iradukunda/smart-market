-- Default Chart of Accounts for Smart Market
-- This creates a standard chart of accounts for a retail business

-- ASSETS (1000-1999)
INSERT INTO chart_of_accounts (account_code, name, type) VALUES
('1000', 'Cash', 'asset'),
('1100', 'Bank Account', 'asset'),
('1200', 'Accounts Receivable', 'asset'),
('1300', 'Inventory', 'asset'),
('1400', 'Prepaid Expenses', 'asset'),
('1500', 'Equipment', 'asset'),
('1600', 'Accumulated Depreciation', 'asset');

-- LIABILITIES (2000-2999)
INSERT INTO chart_of_accounts (account_code, name, type) VALUES
('2000', 'Accounts Payable', 'liability'),
('2100', 'Sales Tax Payable', 'liability'),
('2200', 'Wages Payable', 'liability'),
('2300', 'Loans Payable', 'liability');

-- EQUITY (3000-3999)
INSERT INTO chart_of_accounts (account_code, name, type) VALUES
('3000', 'Owner Equity', 'equity'),
('3100', 'Retained Earnings', 'equity'),
('3200', 'Drawings', 'equity');

-- REVENUE (4000-4999)
INSERT INTO chart_of_accounts (account_code, name, type) VALUES
('4000', 'Sales Revenue', 'revenue'),
('4100', 'Service Revenue', 'revenue'),
('4200', 'Other Income', 'revenue');

-- EXPENSES (5000-5999)
INSERT INTO chart_of_accounts (account_code, name, type) VALUES
('5000', 'Cost of Goods Sold', 'expense'),
('5100', 'Salaries Expense', 'expense'),
('5200', 'Rent Expense', 'expense'),
('5300', 'Utilities Expense', 'expense'),
('5400', 'Marketing Expense', 'expense'),
('5500', 'Office Supplies', 'expense'),
('5600', 'Depreciation Expense', 'expense'),
('5700', 'Bank Charges', 'expense'),
('5800', 'Miscellaneous Expense', 'expense');
