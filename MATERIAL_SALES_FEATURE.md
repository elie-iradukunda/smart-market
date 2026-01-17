# Material Sales Feature - Implementation Summary

## Overview
This feature allows administrators to set prices per metre for materials (like banners) and enables privileged users to record sales where they specify the metres being sold.

## Features Implemented

### 1. Database Changes
- **Migration**: `backend/migrations/052_create_material_sales.sql`
  - Added `price_per_metre` column to `materials` table
  - Added `is_sellable` boolean flag to `materials` table
  - Created `material_sales` table to record all sales transactions

### 2. Backend Implementation

#### Controllers (`backend/src/controllers/inventoryController.js`)
- `setMaterialPrice()` - Admin function to set/update price per metre
- `recordMaterialSale()` - Record a material sale with metres sold
- `getMaterialSales()` - Get sales history with filters
- `getMaterialSale()` - Get single sale details
- `getSellableMaterials()` - Get materials that can be sold
- `getMaterialSalesStats()` - Get sales statistics and top materials

#### Routes (`backend/src/routes/inventory.js`)
- `PUT /api/materials/:id/price` - Set material price (requires `material.manage`)
- `GET /api/materials/sellable` - Get sellable materials
- `POST /api/material-sales` - Record sale (requires `material.sell`)
- `GET /api/material-sales` - List sales (requires `material.view` or `material.sell`)
- `GET /api/material-sales/:id` - Get single sale
- `GET /api/material-sales/stats` - Get statistics

#### Permissions (`backend/migrations/053_add_material_sales_permissions.sql`)
- `material.sell` - Permission to record material sales
- `material.manage` - Permission to manage material settings including pricing

**Permission Assignments**:
- `material.sell`: Receptionist (role 5), Sales Rep (role 9), POS Cashier (role 11)
- `material.manage`: Owner (role 1), Sys Admin (role 2), Inventory Manager (role 8)

### 3. Frontend Implementation

#### API Functions (`frontend/src/api/apiClient.ts`)
- `setMaterialPrice()` - Set material price
- `fetchSellableMaterials()` - Get sellable materials
- `recordMaterialSale()` - Record a sale
- `fetchMaterialSales()` - Get sales with filters
- `fetchMaterialSale()` - Get single sale
- `fetchMaterialSalesStats()` - Get statistics

#### Pages
1. **Material Pricing Page** (`frontend/src/pages/Inventory/MaterialPricingPage.tsx`)
   - Admin-only page to set price per metre for materials
   - Toggle sellable status
   - Search and filter materials
   - Inline editing of prices

2. **Material Sales Page** (`frontend/src/pages/Inventory/MaterialSalesPage.tsx`)
   - Record new material sales
   - Select material (only sellable materials shown)
   - Enter metres sold
   - Optional customer selection
   - Optional price override (defaults to material's price)
   - View sales history
   - Real-time total calculation

#### Routes & Navigation
- Added routes in `frontend/src/router/routes.tsx`:
  - `/inventory/material-pricing` - Material Pricing Page
  - `/inventory/material-sales` - Material Sales Page
- Added sidebar menu items in `frontend/src/components/layout/GlobalSidebar.tsx`:
  - "Material Pricing" (requires `material.manage`)
  - "Material Sales" (requires `material.sell`)

## Workflow

### Admin Workflow (Setting Prices)
1. Navigate to Inventory → Material Pricing
2. Search for material (e.g., "Banner")
3. Click edit icon
4. Enter price per metre (e.g., 5000 RWF)
5. Toggle "Sellable" checkbox
6. Save

### Sales Workflow (Recording Sales)
1. Navigate to Inventory → Material Sales
2. Click "Record Sale"
3. Select material from dropdown (only sellable materials shown)
4. Enter metres sold (e.g., 2.5 metres)
5. Optionally select customer
6. Optionally override price (defaults to material's price)
7. Add optional notes
8. Review total amount
9. Submit

## Database Schema

### materials table (updated)
```sql
ALTER TABLE materials 
ADD COLUMN price_per_metre DECIMAL(12,2) DEFAULT NULL,
ADD COLUMN is_sellable BOOLEAN DEFAULT FALSE;
```

### material_sales table (new)
```sql
CREATE TABLE material_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    customer_id INT,
    sold_by INT NOT NULL,
    metres_sold DECIMAL(12,2) NOT NULL,
    price_per_metre DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (sold_by) REFERENCES users(id)
);
```

## Key Features

1. **Automatic Stock Reduction**: When a sale is recorded, the material's stock is automatically reduced
2. **Stock Movement Tracking**: Each sale creates a stock movement record
3. **Price Flexibility**: Can override material's default price per sale
4. **Customer Tracking**: Optional customer association for sales
5. **Sales History**: Complete audit trail of all sales
6. **Statistics**: Sales statistics and top-selling materials
7. **Permission-Based Access**: Role-based access control

## Usage Example

### Setting Price (Admin)
```
Material: PVC Banner Roll 3m
Price per Metre: 5,000 RWF
Sellable: Yes
```

### Recording Sale (User)
```
Material: PVC Banner Roll 3m
Metres Sold: 2.5
Price per Metre: 5,000 RWF (from material default)
Total: 12,500 RWF
Customer: John Doe (optional)
```

## Next Steps

1. Run database migrations:
   ```bash
   cd backend
   mysql -u your_user -p your_database < migrations/052_create_material_sales.sql
   mysql -u your_user -p your_database < migrations/053_add_material_sales_permissions.sql
   ```

2. Restart backend server to load new routes

3. Test the feature:
   - Login as admin and set material prices
   - Login as receptionist/sales rep and record sales
   - View sales history

## Notes

- Stock is automatically reduced when a sale is recorded
- Only materials marked as "sellable" can be sold
- Price can be overridden per sale if needed
- All sales are tracked with user, timestamp, and optional customer
- Sales create stock movement records for audit trail

