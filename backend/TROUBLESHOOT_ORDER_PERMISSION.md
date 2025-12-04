# Troubleshooting: Production Manager "Insufficient Permissions" for Orders

## ✅ Verification Results

**Database Check**: Production Manager (Role 7) **DOES HAVE** `order.view` permission
- Permission exists in `role_permissions` table
- Test script confirms permission check passes

**Frontend Check**: Frontend permission mapping includes `order.view` for Production Manager

**Route Check**: Backend route `/api/orders` correctly uses RBAC middleware

## 🔍 Why You're Still Seeing the Error

The most common reason is **JWT token caching**. Even though:
- ✅ Permissions are correct in the database
- ✅ Backend checks permissions in real-time
- ✅ Frontend mapping is correct

The browser may still be using an **old JWT token** that was created before permissions were updated.

## 🛠️ Solution Steps

### Step 1: Log Out and Log Back In
1. Click the **"Logout"** button (top right)
2. Wait 2-3 seconds for logout to complete
3. **Log back in** with your Production Manager credentials
4. Try accessing Orders again

### Step 2: Clear Browser Cache (if Step 1 doesn't work)
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear storage** or **Clear site data**
4. Refresh the page and log in again

### Step 3: Check Backend Console
Look at your backend server console. You should see:
```
RBAC check: { path: '/orders', method: 'GET', permissionCode: 'order.view', role_id: 7 }
```

If you see `RBAC Permission Denied:`, it will show:
- The required permission
- The user's role_id
- All permissions the user actually has

### Step 4: Verify Your User Account
Make sure you're logged in as a user with `role_id = 7`:
```sql
SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'your-email@example.com';
```

## 📊 Current Permissions for Production Manager

Production Manager (Role 7) has these permissions:
- ✅ `order.view` - View orders
- ✅ `order.update` - Update orders
- ✅ `workorder.view` - View work orders
- ✅ `workorder.create` - Create work orders
- ✅ `workorder.update` - Update work orders
- ✅ `material.view` - View materials
- ✅ `material.create` - Create materials
- ✅ `inventory.manage` - Manage inventory
- ✅ `supplier.view` - View suppliers
- ✅ `report.view` - View reports
- ✅ `file.view` - View files
- ✅ `customer.view` - View customers
- ✅ `worklog.create` - Create work logs

## 🔧 If Still Not Working

1. **Restart Backend Server**:
   ```bash
   cd backend
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Check Backend Logs**: Look for RBAC check messages in the console

3. **Verify Route Path**: The route should be `/api/orders` and the middleware should derive `order.view` from it

4. **Test Direct API Call**: Use Postman or curl to test:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/orders
   ```

## ✅ Expected Result After Fix

- Orders page loads successfully
- No "Insufficient permissions" error
- You can see the orders list
- All Production Manager features work correctly

