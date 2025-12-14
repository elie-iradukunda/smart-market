# Permission Implementation Guide

This guide explains how to ensure every page and action button is protected by permissions.

## Overview

The system now has:
1. **Route-level protection** - Routes are automatically protected based on their path
2. **Sidebar filtering** - Sidebar links are filtered based on user permissions
3. **Action button protection** - Action buttons (Add, Edit, Delete) are hidden based on permissions

## Components

### 1. ProtectedRoute Component
Located at: `frontend/src/components/auth/ProtectedRoute.tsx`

Automatically checks permissions for routes based on the route path. No need to manually specify permissions - they're derived from `routePermissions.ts`.

### 2. PermissionGate Component
Located at: `frontend/src/components/common/PermissionGate.tsx`

Use this to conditionally render UI elements (buttons, forms, sections) based on permissions.

### 3. Route Permissions Mapping
Located at: `frontend/src/utils/routePermissions.ts`

Maps route paths to required permission codes. Add new routes here.

## How to Add Permission Checks

### Step 1: Add Route Permission (if new route)

Add your route to `frontend/src/utils/routePermissions.ts`:

```typescript
export const ROUTE_PERMISSIONS: Record<string, string | null> = {
  '/your/new/route': 'permission.code',
  '/your/new/route/:id': 'permission.view',
}
```

### Step 2: Wrap Route with ProtectedRoute

In `frontend/src/router/routes.tsx`, use `createProtectedRoute`:

```typescript
createProtectedRoute('/your/new/route', <YourPage />)
```

### Step 3: Hide Action Buttons

In your page component, wrap action buttons with `PermissionGate`:

```typescript
import PermissionGate from '@/components/common/PermissionGate'

// Example: Hide "Create" button
<PermissionGate permission="resource.create">
  <button onClick={handleCreate}>
    Create New
  </button>
</PermissionGate>

// Example: Hide "Edit" button
<PermissionGate permission="resource.update">
  <button onClick={handleEdit}>
    Edit
  </button>
</PermissionGate>

// Example: Hide "Delete" button
<PermissionGate permission="resource.delete">
  <button onClick={handleDelete}>
    Delete
  </button>
</PermissionGate>
```

## Common Permission Codes

### Finance
- `invoice.create` - Create invoices
- `invoice.view` - View invoices
- `payment.create` - Record payments
- `payment.view` - View payments
- `journal.create` - Create journal entries
- `report.view` - View reports

### Inventory
- `material.create` - Create materials
- `material.view` - View materials
- `po.create` - Create purchase orders
- `po.view` - View purchase orders
- `supplier.view` - View suppliers
- `inventory.manage` - Manage inventory

### Production
- `workorder.create` - Create work orders
- `workorder.view` - View work orders
- `workorder.update` - Update work orders
- `worklog.create` - Log work time

### CRM
- `customer.create` - Create customers
- `customer.view` - View customers
- `lead.create` - Create leads
- `lead.view` - View leads
- `quote.create` - Create quotes
- `quote.view` - View quotes

### Orders
- `order.create` - Create orders
- `order.view` - View orders
- `order.update` - Update orders

### Marketing
- `campaign.create` - Create campaigns
- `campaign.view` - View campaigns
- `ad.view` - View ads

### Admin
- `user.view` - View users
- `user.create` - Create users
- `user.manage` - Manage users
- `role.manage` - Manage roles
- `audit.view` - View audit logs
- `settings.manage` - Manage settings

## Examples

### Example 1: InvoicesPage with Create Button Protection

```typescript
import PermissionGate from '@/components/common/PermissionGate'

// Hide the create invoice form
<PermissionGate permission="invoice.create">
  <form onSubmit={handleCreateInvoice}>
    {/* form fields */}
    <button type="submit">Create Invoice</button>
  </form>
</PermissionGate>
```

### Example 2: MaterialsPage with Add Button Protection

```typescript
import PermissionGate from '@/components/common/PermissionGate'

// Hide the "New Material" button
<PermissionGate permission="material.create">
  <button onClick={() => navigate('/inventory/materials/new')}>
    <Plus /> New Material
  </button>
</PermissionGate>
```

### Example 3: Table Actions with Multiple Permissions

```typescript
<tbody>
  {items.map(item => (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td>
        <PermissionGate permission="resource.view">
          <button onClick={() => viewItem(item.id)}>View</button>
        </PermissionGate>
        <PermissionGate permission="resource.update">
          <button onClick={() => editItem(item.id)}>Edit</button>
        </PermissionGate>
        <PermissionGate permission="resource.delete">
          <button onClick={() => deleteItem(item.id)}>Delete</button>
        </PermissionGate>
      </td>
    </tr>
  ))}
</tbody>
```

## Pages That Need Updates

The following pages have action buttons that should be wrapped with PermissionGate:

1. **Finance Pages**
   - InvoicesPage - ✅ Updated (Create invoice buttons)
   - PaymentsPage - Needs update
   - JournalEntriesPage - Needs update

2. **Inventory Pages**
   - MaterialsPage - ✅ Already uses permission check
   - PurchaseOrdersPage - Needs update
   - SuppliersPage - Needs update
   - StockMovementsPage - Needs update

3. **CRM Pages**
   - CustomersPage - Needs update (Add customer button)
   - LeadsPage - Needs update
   - QuotesPage - Needs update

4. **Orders Pages**
   - OrdersPage - Needs update
   - OrderDetailPage - Needs update

5. **Production Pages**
   - WorkOrdersBoardPage - Needs update
   - WorkOrderDetailPage - Needs update
   - NewWorkOrderPage - Needs update

6. **Marketing Pages**
   - CampaignsPage - Needs update
   - AdsManagementPage - Needs update

7. **Admin Pages**
   - UsersPage - Needs update
   - RolesPage - Needs update

## Testing

After implementing permissions:

1. Login as different user roles
2. Verify sidebar shows only allowed links
3. Verify pages redirect if no permission
4. Verify action buttons are hidden if no permission
5. Verify super admin and owner see everything

## Notes

- Super admins (`is_super_admin = true`) and owners (`role_id = 1`) see everything
- If a permission is `null`, the route/action is accessible to all authenticated users
- Permission checks are done client-side for UI, but backend also enforces permissions

