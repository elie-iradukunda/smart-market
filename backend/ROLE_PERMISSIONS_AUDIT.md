# Smart Market Role & Permission Audit

## 🎭 ROLES OVERVIEW

### 1. **Owner** (Role ID: 1)
- **Access**: ALL permissions (full system access)
- **Users**: owner@topdesign.com

### 2. **Sys Admin** (Role ID: 2) 
- **Permissions**: user.manage, role.manage, audit.view, settings.manage, report.view
- **Users**: sysadmin@topdesign.com

### 3. **Accountant** (Role ID: 3)
- **Permissions**: invoice.create, payment.create, journal.create, pos.create, report.view
- **Users**: accountant@topdesign.com

### 4. **Controller** (Role ID: 4)
- **Permissions**: report.view, inventory.manage, material.view
- **Users**: controller@topdesign.com

### 5. **Reception** (Role ID: 5)
- **Permissions**: customer.manage, lead.manage, quote.manage, material.view
- **Users**: reception@topdesign.com

### 6. **Technician** (Role ID: 6)
- **Permissions**: worklog.create, workorder.update, order.update, material.view
- **Users**: tech1@topdesign.com

### 7. **Production Manager** (Role ID: 7)
- **Permissions**: order.update, workorder.create, workorder.update, worklog.create, inventory.manage, material.view, report.view
- **Users**: prod.manager@topdesign.com

### 8. **Inventory Manager** (Role ID: 8)
- **Permissions**: inventory.manage, material.view, report.view
- **Users**: store@topdesign.com

### 9. **Sales Rep** (Role ID: 9)
- **Permissions**: customer.manage, lead.manage, quote.manage
- **Users**: sales@topdesign.com

### 10. **Marketing Manager** (Role ID: 10)
- **Permissions**: campaign.manage, adperformance.view, lead.manage, report.view, ai.view
- **Users**: marketing@topdesign.com

### 11. **POS Cashier** (Role ID: 11)
- **Permissions**: pos.create, payment.create
- **Users**: cashier@topdesign.com

### 12. **Support Agent** (Role ID: 12)
- **Permissions**: conversation.view, message.send, customer.manage
- **Users**: support@topdesign.com

## 🔧 PERMISSION GAPS & FIXES NEEDED

### ❌ **Current Issues**

1. **Invoice Access Too Restrictive**
   - Only Accountant + Owner can view invoices
   - Reception/Sales should see invoices for their customers

2. **Payment Access Issues**
   - POS Cashier can create payments but can't view them
   - Controller should see payment reports

3. **Missing View Permissions**
   - No separate view permissions for invoices, payments
   - All roles use create permissions for viewing

4. **Report Access Limited**
   - Only Owner, Sys Admin, Accountant, Controller, Production Manager, Inventory Manager, Marketing Manager have report access
   - Sales Rep should see sales reports

## 🎯 **RECOMMENDED FIXES**

### Add Missing Permissions
```sql
INSERT IGNORE INTO permissions (code, description) VALUES
('invoice.view', 'View invoices'),
('payment.view', 'View payments'),
('order.view', 'View orders'),
('customer.view', 'View customers'),
('quote.view', 'View quotes');
```

### Update Role Permissions
```sql
-- Reception: Add invoice/payment viewing
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 5, p.id FROM permissions p WHERE p.code IN ('invoice.view', 'payment.view');

-- Sales Rep: Add invoice/payment viewing + reports
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 9, p.id FROM permissions p WHERE p.code IN ('invoice.view', 'payment.view', 'report.view');

-- POS Cashier: Add payment viewing
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 11, p.id FROM permissions p WHERE p.code IN ('payment.view');

-- Controller: Add payment viewing
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 4, p.id FROM permissions p WHERE p.code IN ('payment.view');
```

## 📊 **FEATURE ACCESS MATRIX**

| Feature | Owner | Admin | Accountant | Controller | Reception | Technician | Prod Mgr | Inventory | Sales | Marketing | Cashier | Support |
|---------|-------|-------|------------|------------|-----------|------------|----------|-----------|-------|-----------|---------|---------|
| **Customers** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Quotes** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Orders** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Invoices** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Payments** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Inventory** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Reports** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Marketing** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **POS Sales** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

## 🚨 **CRITICAL FIXES NEEDED**

1. **Add view permissions** for better role separation
2. **Give Reception invoice/payment viewing** for customer service
3. **Give Sales Rep report access** for sales performance
4. **Give Controller payment viewing** for financial oversight
5. **Update route permissions** to use view permissions where appropriate