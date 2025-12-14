# How to Start Backend Server

## Quick Start:

```bash
cd backend
npm start
```

Or for development with auto-reload:

```bash
cd backend
npm run dev
```

## Expected Output:

You should see:
```
Top Design Backend running on port 3000
Socket.IO server initialized
```

## Then Test Login:

1. **Backend must be running** on `http://localhost:3000`
2. **Frontend** should point to `http://localhost:3000/api` (for local dev)
3. **Try login** with:
   - Email: `admin@topdesign.com`
   - Password: `Admin123!`

## Verify Backend is Running:

Open browser and go to: `http://localhost:3000/api/roles`

Should return JSON (even if empty array).

## If Still Getting "Invalid email or password":

1. ✅ Make sure backend is running
2. ✅ Check backend console for login logs
3. ✅ Verify frontend API URL matches backend
4. ✅ Use exact credentials: `admin@topdesign.com` / `Admin123!`
5. ✅ Check browser Network tab to see actual request/response

