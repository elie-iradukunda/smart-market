# Quick Fix: "Insufficient permissions" Error

## ✅ Database Permissions Are Correct
Production Manager (role_id: 7) **HAS** `order.view` permission in the database.

## 🔄 Solution: Refresh Your Session

The error is happening because your **JWT token is cached** in your browser. Even though the database permissions are correct, your browser is still using an old token.

### Steps to Fix:

1. **Click "Logout"** button (top right or bottom of sidebar)
2. **Wait 2-3 seconds** for the logout to complete
3. **Log back in** with your Production Manager credentials
4. **Try accessing Orders again**

### Why This Happens:
- JWT tokens contain user information (including role_id)
- When permissions are updated in the database, existing tokens don't automatically update
- Logging out and back in generates a fresh token with current permissions

## 🔍 If Still Not Working:

### Check Backend Console
Look at your backend server console (where you ran `npm run dev`). You should see logs like:
```
RBAC check: { path: '/orders', method: 'GET', permissionCode: 'order.view', role_id: 7 }
```

If you see `RBAC Permission Denied:`, it will show:
- The required permission
- The user's role_id
- All permissions the user actually has

### Verify Your User Account
Make sure you're logged in as a user with role_id = 7 (Production Manager):
```sql
SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'your-email@example.com';
```

### Restart Backend Server
Sometimes the backend needs a restart:
```bash
cd backend
# Stop the server (Ctrl+C)
npm run dev
```

## ✅ Expected Result After Fix:
- Orders page loads successfully
- No "Insufficient permissions" error
- You can see the orders list

