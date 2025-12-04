# Comprehensive Role Permissions Fix

## Overview
This document describes the comprehensive permission fix for all roles in the Smart Market system to prevent "insufficient permissions" errors.

## What Was Fixed

### 1. Created Comprehensive Permission Script
**File**: `backend/fix-all-role-permissions.js`

This script grants all necessary permissions to each role based on their responsibilities:

- **Owner (Role 1)**: Has all permissions (special handling)
- **Sys Admin (Role 2)**: System management + viewing capabilities
- **Accountant (Role 3)**: Full finance access (invoices, payments, journals, POS)
- **Controller (Role 4)**: Operations oversight (orders, inventory, materials, reports)
- **Reception (Role 5)**: Front desk operations (customers, leads, quotes, orders, POS)
- **Technician (Role 6)**: Production work (work orders, work logs, materials)
- **Production Manager (Role 7)**: Full production oversight (work orders, orders, inventory, reports)
- **Inventory Manager (Role 8)**: Stock management (materials, suppliers, purchase orders)
- **Sales Rep (Role 9)**: CRM and sales (customers, leads, quotes, orders, POS, reports)
- **Marketing Manager (Role 10)**: Campaigns and analytics (campaigns, ads, leads, reports, AI)
- **POS Cashier (Role 11)**: Point of sale operations (POS, customers, invoices, payments)
- **Support Agent (Role 12)**: Customer support (conversations, messages, customers, orders)

### 2. Updated Frontend Permission Mapping
**File**: `frontend/src/utils/apiClient.ts`

Updated the `getPermissionsForRole()` function to match the backend permissions, ensuring:
- All view permissions are included
- Create/update permissions match role responsibilities
- File upload/view permissions where needed
- Report access for appropriate roles

### 3. Added NPM Script
**File**: `backend/package.json`

Added script: `npm run fix-all-permissions` to easily run the permission fix.

## How to Use

### Step 1: Run the Permission Fix Script
```bash
cd backend
npm run fix-all-permissions
```

Or directly:
```bash
node backend/fix-all-role-permissions.js
```

### Step 2: Verify Permissions
The script will output:
- Which permissions were granted to each role
- Total count of permissions per role
- List of all permissions for each role

### Step 3: Users Must Refresh Their Session
**IMPORTANT**: After running the script, all users must:
1. **Log out** of the application
2. **Log back in** to refresh their JWT tokens
3. The new permissions will then be active

## Key Permission Additions

### View Permissions Added
- `invoice.view` - For Reception, Sales Rep, POS Cashier, Accountant
- `payment.view` - For Reception, Sales Rep, POS Cashier, Accountant, Controller
- `order.view` - For Sales Rep, Controller, Support Agent
- `customer.view` - For multiple roles that need customer access
- `quote.view` - For Reception and Sales Rep
- `workorder.view` - For Technician and Controller

### Additional Permissions
- `file.upload` and `file.view` - For roles that need to handle files
- `quote.approve` - For Reception and Sales Rep to close deals
- `pos.view` - For Accountant to view POS transactions
- `report.view` - For Sales Rep to see sales performance
- `supplier.view` - For Accountant and Controller

## Permission Matrix

| Role | Key Permissions |
|------|----------------|
| **Owner** | All permissions (*) |
| **Sys Admin** | User management, roles, audit, settings, reports |
| **Accountant** | Invoices, payments, journals, POS, reports |
| **Controller** | Orders, inventory, materials, reports, AI |
| **Reception** | Customers, leads, quotes, orders, POS, files |
| **Technician** | Work orders, work logs, orders, materials |
| **Production Manager** | Work orders, orders, inventory, materials, reports |
| **Inventory Manager** | Inventory, materials, suppliers, purchase orders, reports |
| **Sales Rep** | Customers, leads, quotes, orders, POS, reports, files |
| **Marketing Manager** | Campaigns, ads, leads, reports, AI |
| **POS Cashier** | POS, customers, invoices, payments, materials |
| **Support Agent** | Conversations, messages, customers, orders, files |

## Troubleshooting

### Still Getting Permission Errors?

1. **Check if script ran successfully**
   - Look for "✅ All role permissions updated successfully!" message
   - Verify permissions were added in the output

2. **User must log out and back in**
   - JWT tokens cache permissions
   - New permissions only take effect after re-login

3. **Check database directly**
   ```sql
   SELECT r.name, p.code 
   FROM role_permissions rp
   JOIN roles r ON rp.role_id = r.id
   JOIN permissions p ON rp.permission_id = p.id
   WHERE r.id = [ROLE_ID]
   ORDER BY p.code;
   ```

4. **Verify frontend mapping matches**
   - Check `frontend/src/utils/apiClient.ts`
   - Ensure `getPermissionsForRole()` includes all needed permissions

5. **Check backend RBAC middleware**
   - Verify route permissions in `backend/src/middleware/rbac.js`
   - Check that permission codes match between frontend and backend

## Next Steps

1. Run the script: `npm run fix-all-permissions`
2. Test each role to ensure they can access their required features
3. Monitor for any remaining permission errors
4. Update permissions as needed based on business requirements

## Notes

- The script removes existing permissions and adds fresh ones to ensure consistency
- Owner role (1) is skipped as it has special handling (all permissions)
- All permission codes must exist in the `permissions` table before running
- The script will report any missing permissions that need to be added to the database first

