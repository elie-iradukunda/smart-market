# Role-Based Login Routing - TOP Design

## Overview
The application now supports role-based login routing where users are automatically redirected to their appropriate interface based on their role.

## User Roles

### Customer (Role ID: 13)
- **Login Page**: `/shop/login` (E-commerce login page)
- **Redirect**: E-commerce homepage `/` or redirect parameter
- **Interface**: E-commerce storefront with product browsing, cart, and checkout

### Business Users (Role IDs: 1-12)
- **Login Page**: Either `/login` (business) or `/shop/login` (e-commerce)
- **Redirect**: Role-specific dashboard
- **Interface**: Business management dashboard

## Role-to-Dashboard Mapping

| Role ID | Role Name | Dashboard Path |
|---------|-----------|----------------|
| 1 | Owner | `/dashboard/owner` |
| 2 | System Admin | `/dashboard/admin` |
| 3 | Accountant | `/dashboard/accountant` |
| 4 | Controller | `/dashboard/controller` |
| 5 | Reception | `/dashboard/reception` |
| 6 | Technician | `/dashboard/technician` |
| 7 | Production Manager | `/dashboard/production` |
| 8 | Inventory Manager | `/dashboard/inventory` |
| 9 | Sales Rep | `/dashboard/sales` |
| 10 | Marketing Manager | `/dashboard/marketing` |
| 11 | POS Cashier | `/dashboard/pos` |
| 12 | Support Agent | `/dashboard/support` |
| 13 | Customer | `/` (E-commerce) |

## Login Flow

### E-commerce Login (`/shop/login`)

1. User enters email and password
2. System calls `/api/auth/login` endpoint
3. Backend returns user data with `role_id`
4. Frontend checks `role_id`:
   - **If role_id === 13 (Customer)**:
     - Store auth data in sessionStorage (e-commerce context)
     - Redirect to e-commerce homepage or redirect parameter
   - **If role_id !== 13 and role_id !== null (Business User)**:
     - Store auth data in localStorage (business app context)
     - Redirect to role-specific dashboard
     - Show message: "Login successful! Redirecting to your dashboard..."

### Business Login (`/login`)

1. User enters email and password
2. System calls `/api/auth/login` endpoint
3. Backend returns user data with `role_id`
4. Frontend uses `getDashboardPathForRole()` to determine dashboard
5. Redirect to appropriate dashboard

## Implementation Details

### ShopLoginPage.tsx
```typescript
const CUSTOMER_ROLE_ID = 13

if (data.user.role_id !== CUSTOMER_ROLE_ID && data.user.role_id !== null) {
    // Non-customer: redirect to business dashboard
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.user))
    
    const dashboardPath = dashboardPaths[data.user.role_id] || '/dashboard/owner'
    navigate(dashboardPath)
} else {
    // Customer: continue with e-commerce login
    await login(email, password)
    navigate(redirect || '/')
}
```

### apiClient.ts
```typescript
export function getDashboardPathForRole(roleId: number | null | undefined): string {
  switch (roleId) {
    case 1: return '/dashboard/owner'
    case 2: return '/dashboard/admin'
    // ... other roles
    case 13: return '/' // Customer
    default: return '/dashboard/owner'
  }
}
```

## Storage Strategy

### E-commerce (Customers)
- **Token**: `sessionStorage.setItem('token', data.token)`
- **User**: Stored in AuthContext state
- **Reason**: Session-based for security, cleared on browser close

### Business App (Employees)
- **Token**: `localStorage.setItem('auth_token', data.token)`
- **User**: `localStorage.setItem('auth_user', JSON.stringify(data.user))`
- **Reason**: Persistent across sessions for convenience

## User Experience

### Scenario 1: Customer Login
1. Customer visits `/shop/login`
2. Enters credentials
3. Sees: "Login successful!"
4. Redirected to: `/` (e-commerce homepage)
5. Can browse products, add to cart, checkout

### Scenario 2: Employee Login via E-commerce
1. Employee visits `/shop/login` (by mistake or intentionally)
2. Enters credentials
3. Sees: "Login successful! Redirecting to your dashboard..."
4. Redirected to: `/dashboard/accountant` (for example)
5. Can access business management features

### Scenario 3: Employee Login via Business
1. Employee visits `/login`
2. Enters credentials
3. Redirected to: Role-specific dashboard
4. Can access business management features

## Security Considerations

1. **Role Validation**: Backend validates role on every protected endpoint
2. **Token Verification**: JWT tokens verified on backend
3. **Frontend Routing**: Role-based routing is convenience, not security
4. **Separate Storage**: E-commerce and business use different storage mechanisms

## Testing

### Test Customer Login
```bash
# Register as customer
POST /api/auth/register
{
  "name": "John Doe",
  "email": "customer@test.com",
  "phone": "+250788123456",
  "password": "password123"
}

# Login via e-commerce
POST /api/auth/login
{
  "email": "customer@test.com",
  "password": "password123"
}
# Should redirect to: /
```

### Test Employee Login
```bash
# Login as accountant (role_id: 3)
POST /api/auth/login
{
  "email": "accountant@company.com",
  "password": "password123"
}
# Should redirect to: /dashboard/accountant
```

## Future Enhancements

1. **Remember Me**: Implement persistent login for customers
2. **Multi-Factor Auth**: Add 2FA for business users
3. **Session Management**: Track active sessions
4. **Role Switching**: Allow users with multiple roles to switch contexts
5. **SSO Integration**: Single sign-on for enterprise customers
