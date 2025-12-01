# Login Pages - Correct Usage Guide

## Two Separate Login Pages

The application has **two different login pages** for different types of users:

### 1. Business Login (`/login`)
**For**: Employees, staff, business users (accountants, inventory managers, etc.)
**URL**: `http://localhost:5173/login`
**Redirects to**: Role-specific dashboards

#### Supported Roles:
- Owner → `/dashboard/owner`
- System Admin → `/dashboard/admin`
- Accountant → `/dashboard/accountant`
- Controller → `/dashboard/controller`
- Reception → `/dashboard/reception`
- Technician → `/dashboard/technician`
- Production Manager → `/dashboard/production`
- Inventory Manager → `/dashboard/inventory`
- Sales Rep → `/dashboard/sales`
- Marketing Manager → `/dashboard/marketing`
- POS Cashier → `/dashboard/pos`
- Support Agent → `/dashboard/support`

### 2. E-commerce Login (`/shop/login`)
**For**: Customers shopping on the e-commerce site
**URL**: `http://localhost:5173/shop/login`
**Redirects to**: E-commerce homepage `/`

#### Special Handling:
- If a **business user** accidentally logs in via `/shop/login`, they will be automatically redirected to their business dashboard
- If a **customer** logs in via `/shop/login`, they stay on the e-commerce site

## How It Works

### Business Login Flow (`/login`)
```
1. User visits /login
2. Enters email and password
3. System calls /api/auth/login
4. Backend returns user data with role_id
5. Frontend stores auth in localStorage:
   - auth_token
   - auth_user
6. Page reloads and redirects to role-specific dashboard
7. Dashboard loads with full content
```

### E-commerce Login Flow (`/shop/login`)
```
Customer Login:
1. Customer visits /shop/login
2. Enters email and password
3. System calls /api/auth/login
4. Backend returns user with role_id = 13 (customer)
5. Frontend stores auth in sessionStorage
6. Redirects to / (e-commerce homepage)
7. Can browse products and checkout

Business User Login (edge case):
1. Employee visits /shop/login (by mistake)
2. Enters email and password
3. System detects role_id ≠ 13
4. Stores auth in localStorage (business format)
5. Page reloads and redirects to business dashboard
6. Shows message: "Redirecting to your dashboard..."
```

## Technical Implementation

### Business Login (`LoginPage.tsx`)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setLoading(true)
  try {
    const res = await loginRequest(email, password)
    setAuthToken(res.token)
    setAuthUser(res.user)

    const dashboardPath = getDashboardPathForRole(res.user.role_id)
    
    // Full page reload for proper dashboard initialization
    window.location.href = dashboardPath
  } catch (err: any) {
    setError(err.message || 'Login failed')
  } finally {
    setLoading(false)
  }
}
```

### E-commerce Login (`ShopLoginPage.tsx`)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... validation ...
  
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()
  const CUSTOMER_ROLE_ID = 13

  if (data.user.role_id !== CUSTOMER_ROLE_ID && data.user.role_id !== null) {
    // Business user - redirect to dashboard
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    
    window.location.href = dashboardPaths[data.user.role_id]
  } else {
    // Customer - continue with e-commerce
    await login(email, password)
    navigate(redirect || '/')
  }
}
```

## Why Full Page Reload?

Both login pages use `window.location.href` instead of React Router's `navigate()` for business users because:

1. **Separate App Contexts**: Business app (`/dashboard/*`) is a separate routing context
2. **Proper Initialization**: Full reload ensures all contexts, layouts, and API clients initialize correctly
3. **Auth Data Loading**: `DashboardLayout` reads from `localStorage` on page load
4. **Prevents Blank Pages**: Client-side navigation was causing blank dashboard pages

## User Instructions

### For Business Users (Employees):
✅ **Use**: `http://localhost:5173/login`
- This is your dedicated login page
- You'll be redirected to your role-specific dashboard
- All business features will work correctly

❌ **Avoid**: `/shop/login` (but it will still work if you use it)

### For Customers:
✅ **Use**: `http://localhost:5173/shop/login`
- This is for shopping on the e-commerce site
- You'll stay on the e-commerce interface
- You can browse products, add to cart, and checkout

❌ **Don't use**: `/login` (this is for employees only)

## Testing

### Test Business Login
```bash
# Test as Inventory Manager
1. Go to http://localhost:5173/login
2. Email: inventory@company.com
3. Password: [password]
4. Should redirect to /dashboard/inventory
5. Should see full dashboard with stock alerts, materials, etc.
```

### Test E-commerce Login
```bash
# Test as Customer
1. Go to http://localhost:5173/shop/login
2. Email: customer@example.com
3. Password: [password]
4. Should redirect to / (homepage)
5. Should see product catalog and can shop
```

### Test Cross-Login (Edge Case)
```bash
# Business user logs in via shop login
1. Go to http://localhost:5173/shop/login
2. Email: accountant@company.com
3. Password: [password]
4. Should see: "Redirecting to your dashboard..."
5. Should redirect to /dashboard/accountant
6. Dashboard should load correctly
```

## Common Issues

### Issue: Blank Dashboard After Login
**Cause**: Using client-side navigation instead of full page reload
**Solution**: Already fixed - both login pages now use `window.location.href`

### Issue: "Not Authorized" Error
**Cause**: Auth token not stored correctly
**Solution**: Check that `localStorage.setItem('auth_token', token)` is called

### Issue: User Sees Wrong Dashboard
**Cause**: Incorrect role_id or dashboard path mapping
**Solution**: Verify `getDashboardPathForRole()` in `apiClient.ts`

## Files Modified
- `frontend/src/pages/LoginPage.tsx` - Business login (fixed)
- `frontend/src/pages/Shop/ShopLoginPage.tsx` - E-commerce login (fixed)
- `frontend/src/utils/apiClient.ts` - Dashboard path mapping
- `frontend/src/components/layout/DashboardLayout.tsx` - Role-based layout selector

## Summary

| User Type | Login Page | Redirect | Storage |
|-----------|-----------|----------|---------|
| Business Users | `/login` | `/dashboard/{role}` | localStorage |
| Customers | `/shop/login` | `/` | sessionStorage |
| Business via Shop | `/shop/login` | `/dashboard/{role}` | localStorage |
