# Login Troubleshooting Guide

## Issue: "Invalid email or password" Error

### Common Causes:

1. **API URL Mismatch**
   - Frontend is pointing to production: `https://topdesign.lanari.rw/api`
   - But backend is running locally: `http://localhost:3000/api`
   - **Solution**: Update API_BASE in `frontend/src/utils/apiClient.ts`

2. **Database Not Synced**
   - Production database might not have the admin users
   - Local database has the users but frontend calls production
   - **Solution**: Ensure you're using the correct API endpoint

3. **User Status**
   - User exists but status is not 'active'
   - **Solution**: Run `node scripts/debug-login.js` to check

4. **Password Hash Mismatch**
   - Password hash doesn't match
   - **Solution**: Run `node scripts/check-user-password.js` to fix

## Quick Fixes:

### Fix 1: Update API URL for Local Development

Edit `frontend/src/utils/apiClient.ts`:
```typescript
// Change from:
const API_BASE = 'https://topdesign.lanari.rw/api'

// To:
const API_BASE = 'http://localhost:3000/api'
```

### Fix 2: Verify Users Exist

Run:
```bash
cd backend
node scripts/debug-login.js
```

### Fix 3: Fix All User Passwords

Run:
```bash
cd backend
node scripts/check-user-password.js
```

### Fix 4: Test Login Directly

Run:
```bash
cd backend
node scripts/test-login.js
```

## Current Admin Users:

1. **System Administrator**
   - Email: `admin@topdesign.com`
   - Password: `Admin123!`

2. **Operations Admin**
   - Email: `ops.admin@topdesign.com`
   - Password: `Admin123!`

3. **IT Administrator**
   - Email: `it.admin@topdesign.com`
   - Password: `Admin123!`

## Testing:

1. **Backend Test** (should work):
   ```bash
   cd backend
   node scripts/test-login.js
   ```

2. **Frontend Test**:
   - Make sure backend is running: `npm start` or `npm run dev`
   - Make sure API_BASE points to correct URL
   - Try logging in with: `admin@topdesign.com` / `Admin123!`

## Debug Steps:

1. Check backend logs when you try to login
2. Check browser console for errors
3. Check Network tab in browser DevTools
4. Verify backend is running and accessible
5. Verify database has users with correct status

## Updated Login Controller:

The login controller now:
- ✅ Normalizes email (trim + lowercase)
- ✅ Better error messages
- ✅ Detailed logging
- ✅ Checks user status
- ✅ Validates password hash exists

Check backend console logs when logging in to see detailed debug info.

