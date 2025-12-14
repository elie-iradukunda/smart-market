# Quick Login Fix Guide

## ✅ What's Working:
- Database has correct users ✅
- Password hashes are correct ✅
- Login API endpoint works ✅
- Backend code is updated ✅

## ⚠️ Common Issues:

### 1. Backend Not Restarted
**Problem**: Updated code not active
**Solution**: Restart backend server
```bash
# Stop current server (Ctrl+C)
# Then restart:
cd backend
npm start
# or
npm run dev
```

### 2. Wrong Password Typed
**Problem**: User typing wrong password
**Solution**: Use exact password: `Admin123!`
- Case sensitive
- No spaces before/after
- Includes exclamation mark

### 3. Email Issues
**Problem**: Email with spaces or wrong case
**Solution**: Use exact email: `admin@topdesign.com`
- Will work with uppercase: `ADMIN@TOPDESIGN.COM` ✅
- Will NOT work with spaces: ` admin@topdesign.com ` ❌

### 4. Frontend API URL
**Problem**: Frontend pointing to wrong server
**Solution**: Check `frontend/src/utils/apiClient.ts`
- Local: `http://localhost:3000/api`
- Production: `https://topdesign.lanari.rw/api`

## 🧪 Test Login:

### Via Script (Backend):
```bash
cd backend
node scripts/test-login-api.js
```

### Via Browser:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the request/response

### Via curl:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@topdesign.com","password":"Admin123!"}'
```

## 📝 Correct Credentials:

**Email**: `admin@topdesign.com` (or `ops.admin@topdesign.com` or `it.admin@topdesign.com`)
**Password**: `Admin123!` (exact, case-sensitive, no spaces)

## 🔍 Debug Steps:

1. **Check backend is running**:
   ```bash
   # Should see: "Top Design Backend running on port 3000"
   ```

2. **Check backend logs** when logging in:
   - Should see: "Login attempt: { email: '...', hasPassword: true }"
   - Should see: "Login successful:" or "Login failed:"

3. **Check browser console**:
   - Look for network errors
   - Check request payload
   - Check response

4. **Verify user exists**:
   ```bash
   cd backend
   node scripts/debug-login.js
   ```

## 🚀 Quick Fix Checklist:

- [ ] Backend server is running
- [ ] Backend server was restarted after code changes
- [ ] Using correct email: `admin@topdesign.com`
- [ ] Using correct password: `Admin123!` (no spaces)
- [ ] Frontend API URL matches backend URL
- [ ] No CORS errors in browser console
- [ ] Check backend console for login logs

