# Product Management System - Complete Setup Guide

## ✅ What Has Been Created

### 1. Database Table
**Table**: `products`
**Location**: Created via migration `032_create_products_table.sql`

**Columns**:
- `id` - INT, PRIMARY KEY, AUTO_INCREMENT
- `name` - VARCHAR(255), NOT NULL
- `description` - TEXT
- `price` - DECIMAL(10,2), NOT NULL
- `image` - VARCHAR(500) (stores base64 or URL)
- `category` - VARCHAR(100)
- `stock_quantity` - INT, DEFAULT 0
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### 2. Backend API
**Controller**: `backend/src/controllers/productController.js`
- `getProducts()` - Get all products
- `getProduct(id)` - Get single product
- `createProduct()` - Create new product
- `updateProduct()` - Update product
- `deleteProduct()` - Delete product

**Routes**: `backend/src/routes/products.js`
- `GET /api/products` - Public
- `GET /api/products/:id` - Public
- `POST /api/products` - Protected (requires auth)
- `PUT /api/products/:id` - Protected (requires auth)
- `DELETE /api/products/:id` - Protected (requires auth)

**RBAC Configuration**: `backend/config/rbac.js`
- GET routes are public (no permissions required)
- POST/PUT/DELETE require `inventory.manage` permission

### 3. Frontend
**API Client**: `frontend/src/api/apiClient.ts`
- `fetchProducts()` - Get all products
- `fetchProduct(id)` - Get single product
- `createProduct(payload)` - Create new product
- `updateProduct(id, payload)` - Update product
- `deleteProduct(id)` - Delete product

**Products Page**: `frontend/src/pages/Inventory/ProductsPage.tsx`
- Table view of all products
- Add Product modal with image upload
- Delete functionality
- Image upload from PC (converts to base64)
- Image URL paste option
- Error handling and loading states

**Navigation**: Added to `InventoryManagerSidebar.tsx`
- "Products" link with ShoppingBag icon
- Requires `inventory.manage` permission

**Route**: `frontend/src/router/routes.tsx`
- Path: `/inventory/products`

## 🚀 How to Use

### Step 1: Log In
1. Go to `http://localhost:3001/login`
2. Log in with:
   - **Inventory Manager** account (role_id: 8)
   - **Owner** account (role_id: 1)

### Step 2: Navigate to Products
1. After login, you'll be at `/dashboard/inventory`
2. Click **"Products"** in the sidebar (between Materials and Suppliers)

### Step 3: Add a Product
1. Click the **"Add Product"** button
2. Fill in the form:
   - **Name** (required)
   - **Description** (optional)
   - **Price** (required, e.g., 29.99)
   - **Stock** (required, e.g., 100)
   - **Category** (optional, e.g., "Electronics")
   - **Image**: Either:
     - Click the upload area to browse and select from your PC
     - OR paste an image URL

3. Click **"Create Product"**

### Step 4: Manage Products
- **View**: All products appear in the table
- **Delete**: Click the trash icon next to any product

## 📸 Image Upload Features

The product form supports **two ways** to add images:

### Option 1: Upload from PC
- Click the upload area
- Browse and select an image file (PNG, JPG, etc.)
- Image is converted to base64 and stored in database
- Preview shown before saving

### Option 2: Paste Image URL
- Paste a direct image URL (e.g., from Unsplash, your CDN, etc.)
- URL is stored in database

## 🔐 Permissions

- **View Products**: Anyone (public route)
- **Create/Update/Delete Products**: Requires `inventory.manage` permission
  - Owner (role_id: 1) ✅
  - Inventory Manager (role_id: 8) ✅

## 📊 Product Data Structure

```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "category": "Category Name",
  "stock_quantity": 100,
  "image": "base64_string_or_url"
}
```

## ✨ Features

- ✅ Full CRUD operations
- ✅ Image upload from PC
- ✅ Image URL paste
- ✅ Image preview before upload
- ✅ Table view with product details
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Role-based access control
- ✅ Beautiful UI with Tailwind CSS

## 🎯 Next Steps (Optional Enhancements)

1. **Edit Product**: Add edit functionality
2. **Bulk Upload**: Upload multiple products via CSV
3. **Image Gallery**: Support multiple images per product
4. **Search & Filter**: Add search and category filters
5. **Pagination**: Add pagination for large product lists
6. **Product Variants**: Add size, color variants
7. **SEO**: Add meta tags for products
8. **Analytics**: Track product views and sales

## 🐛 Troubleshooting

### "Access token required" error
- **Solution**: Make sure you're logged in before accessing `/inventory/products`

### Products not showing
- **Solution**: Check that the `products` table exists in your database
- Run: `node scripts/run_products_migration.js` if needed

### Image not uploading
- **Solution**: Images are converted to base64 (works offline)
- For production, consider using a CDN or cloud storage (AWS S3, Cloudinary, etc.)

## 📝 Summary

You now have a complete product management system that allows you to:
1. Create products with images from your PC
2. View all products in a beautiful table
3. Delete products
4. Access everything from the Inventory dashboard

The system is fully integrated with your existing authentication and RBAC system! 🎉
