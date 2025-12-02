# Automated Accounting System for Smart Market

## Overview
This document explains the automated journal entry system that will be implemented for POS sales.

## 1. Default Chart of Accounts

The system uses a standard chart of accounts:

### Assets (1000-1999)
- 1000: Cash
- 1100: Bank Account
- 1200: Accounts Receivable
- 1300: Inventory
- 1400: Prepaid Expenses
- 1500: Equipment
- 1600: Accumulated Depreciation

### Liabilities (2000-2999)
- 2000: Accounts Payable
- 2100: Sales Tax Payable
- 2200: Wages Payable
- 2300: Loans Payable

### Equity (3000-3999)
- 3000: Owner Equity
- 3100: Retained Earnings
- 3200: Drawings

### Revenue (4000-4999)
- 4000: Sales Revenue
- 4100: Service Revenue
- 4200: Other Income

### Expenses (5000-5999)
- 5000: Cost of Goods Sold
- 5100: Salaries Expense
- 5200: Rent Expense
- 5300: Utilities Expense
- 5400: Marketing Expense
- 5500: Office Supplies
- 5600: Depreciation Expense
- 5700: Bank Charges
- 5800: Miscellaneous Expense

## 2. Automatic Journal Entries for POS Sales

When a POS sale is made, the system automatically creates TWO journal entries:

### Journal Entry #1: Record the Sale
**Date:** Sale date
**Description:** "POS Sale #{sale_id} - Cash Sale"

| Account | Debit | Credit |
|---------|-------|--------|
| Cash (1000) | $100.00 | |
| Sales Revenue (4000) | | $100.00 |

**Explanation:** Cash increases (debit), Revenue increases (credit)

### Journal Entry #2: Record Cost of Goods Sold
**Date:** Sale date
**Description:** "POS Sale #{sale_id} - Cost of Goods Sold"

| Account | Debit | Credit |
|---------|-------|--------|
| Cost of Goods Sold (5000) | $60.00 | |
| Inventory (1300) | | $60.00 |

**Explanation:** COGS increases (debit), Inventory decreases (credit)

## 3. How It Works

### When a sale happens:
1. Customer buys product for $100
2. Product cost was $60
3. System automatically:
   - Records $100 cash received
   - Records $100 revenue earned
   - Records $60 cost of goods sold
   - Reduces inventory by $60
   - Net profit: $40

### Database Flow:
```
POS Sale Created
    ↓
Items Recorded
    ↓
Stock Updated
    ↓
Journal Entry #1 (Sale)
    ↓
Journal Entry #2 (COGS)
    ↓
Financial Reports Updated
```

## 4. Financial Reports (Auto-Generated)

### Income Statement
```
Revenue:
  Sales Revenue          $10,000
  
Expenses:
  Cost of Goods Sold     $6,000
  Salaries              $2,000
  Rent                  $1,000
  Utilities             $500
  Total Expenses        $9,500
  
Net Income              $500
```

### Balance Sheet
```
Assets:
  Cash                  $5,000
  Inventory             $3,000
  Equipment             $2,000
  Total Assets          $10,000
  
Liabilities:
  Accounts Payable      $2,000
  Loans Payable         $3,000
  Total Liabilities     $5,000
  
Equity:
  Owner Equity          $4,000
  Retained Earnings     $1,000
  Total Equity          $5,000
  
Total Liabilities + Equity  $10,000
```

## 5. Implementation Status

✅ Database tables created (journal_entries, journal_lines, chart_of_accounts)
✅ Default chart of accounts SQL file created
✅ API endpoints ready (POST /api/journal-entries, GET /api/journal-entries)
⏳ Auto-generation logic needs to be added to createPOSSale function
⏳ Financial reports endpoints need to be created

## 6. Next Steps

1. Run the default chart of accounts migration
2. Update createPOSSale to auto-generate journal entries
3. Create financial report endpoints
4. Test the complete flow

## 7. Benefits

- ✅ **Automated**: No manual bookkeeping needed
- ✅ **Accurate**: Double-entry ensures balanced books
- ✅ **Real-time**: Financial reports always up-to-date
- ✅ **Audit Trail**: Every transaction is recorded
- ✅ **Tax Ready**: Easy to generate tax reports
