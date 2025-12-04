# Debugging Permission Issues

## Current Issue
Production Manager (role_id: 7) is getting 403 Forbidden when accessing `/api/orders`.

## Verification Steps

### 1. Check Database Permissions
Run this to verify permissions are correct:
```bash
cd backend
node verify-production-manager-permissions.js
```

### 2. Check Backend Console Logs
When the request fails, check the backend console. You should see:
- `RBAC check:` log showing the permission being checked
- If denied: `RBAC Permission Denied:` with detailed info
- List of permissions the user actually has

### 3. Test RBAC Logic
Run this to simulate the RBAC check:
```bash
cd backend
node test-rbac-check.js
```

## Common Solutions

### Solution 1: Log Out and Log Back In (MOST COMMON)
The JWT token might be cached. Even though the auth middleware fetches user data from the database on each request, there might be browser caching or token issues.

**Steps:**
1. Click "Logout" in the application
2. Clear browser cache (Ctrl+Shift+Delete)
3. Log back in with Production Manager credentials
4. Try accessing Orders again

### Solution 2: Check Backend Server is Running
Make sure the backend server is running and has the latest code:
```bash
cd backend
npm run dev
```

### Solution 3: Verify User's Role in Database
Check what role the logged-in user actually has:
```sql
SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'your-email@example.com';
```

### Solution 4: Check Backend Logs
Look at the backend console when making the request. You should see:
```
RBAC check: { path: '/orders', method: 'GET', resource: 'order', permissionCode: 'order.view', role_id: 7 }
```

If you see `RBAC Permission Denied:`, it will show:
- The required permission
- The user's role_id
- All permissions the user actually has

## Fixed Permissions

Production Manager (role_id: 7) should have these permissions:
- ✅ order.view
- ✅ order.update
- ✅ workorder.create
- ✅ workorder.update
- ✅ workorder.view
- ✅ worklog.create
- ✅ material.view
- ✅ supplier.view
- ✅ report.view
- ✅ file.view

## If Still Not Working

1. Check backend console logs for detailed error messages
2. Verify the user's role_id matches 7 (Production Manager)
3. Ensure the backend server was restarted after permission changes
4. Try accessing from a different browser or incognito mode
5. Check if there are any proxy or CORS issues

