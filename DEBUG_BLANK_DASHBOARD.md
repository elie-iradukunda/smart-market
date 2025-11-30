# Debug: Dashboard Not Showing Content

## Issue
After logging in at `/login`, users are redirected to their dashboard (e.g., `/dashboard/owner`) but see a blank page with no content.

## Root Cause Analysis

### 1. Auth Guard Redirect Loop
In `OwnerDashboard.tsx` (lines 74-77):
```typescript
if (!user || user.role_id !== 1) {
  navigate('/login')
  return null  // Returns null, showing blank page
}
```

**Problem**: If `getAuthUser()` returns `null` or wrong role, the component:
1. Calls `navigate('/login')` (client-side navigation)
2. Returns `null` (blank page)
3. User sees blank page briefly before redirect

### 2. Possible Auth Data Issues

The auth data might not be available when the component first renders because:

**a) Timing Issue**:
- Login page does: `window.location.href = dashboardPath` (full reload)
- Page reloads
- Dashboard component renders
- `getAuthUser()` reads from `localStorage`
- If `localStorage` hasn't been written yet, returns `null`

**b) Storage Key Mismatch**:
- Login stores: `localStorage.setItem('auth_user', JSON.stringify(data.user))`
- Dashboard reads: `getAuthUser()` which does `localStorage.getItem('auth_user')`
- Keys should match ✓

**c) Data Format Issue**:
- Backend returns: `{ id, name, email, role_id }`
- Frontend expects: Same format
- Should work ✓

## Debugging Steps

### Step 1: Check if auth data is stored
Open browser console after login and run:
```javascript
console.log('Auth Token:', localStorage.getItem('auth_token'))
console.log('Auth User:', localStorage.getItem('auth_user'))
```

Expected output:
```
Auth Token: "eyJhbGc..."
Auth User: "{"id":1,"name":"Owner","email":"owner@company.com","role_id":1}"
```

### Step 2: Check if user object is parsed correctly
```javascript
const user = JSON.parse(localStorage.getItem('auth_user'))
console.log('User:', user)
console.log('Role ID:', user.role_id)
console.log('Role ID Type:', typeof user.role_id)
```

Expected output:
```
User: {id: 1, name: "Owner", email: "owner@company.com", role_id: 1}
Role ID: 1
Role ID Type: "number"
```

### Step 3: Check DashboardLayout rendering
The `DashboardLayout` component should:
1. Call `getAuthUser()`
2. Check `user.role_id`
3. Render appropriate layout (e.g., `OwnerDashboardLayout`)

If `user` is `null`, it returns just `{children}` without layout.

## Potential Fixes

### Fix 1: Add Loading State
Instead of immediately returning `null`, show a loading state:

```typescript
export default function OwnerDashboard() {
  const navigate = useNavigate()
  const user = getAuthUser()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Give time for auth to load
    setTimeout(() => {
      if (!user || user.role_id !== 1) {
        window.location.href = '/login'  // Use full reload
      } else {
        setIsChecking(false)
      }
    }, 100)
  }, [user])

  if (isChecking) {
    return <div>Loading...</div>
  }

  // Rest of component...
}
```

### Fix 2: Use window.location.href for redirect
Change line 75 from:
```typescript
navigate('/login')
```
To:
```typescript
window.location.href = '/login'
```

This ensures a full page reload instead of client-side navigation.

### Fix 3: Remove Auth Guard (Rely on DashboardLayout)
Since `DashboardLayout` already checks the role, the individual dashboard components don't need their own guards:

```typescript
export default function OwnerDashboard() {
  // Remove this guard:
  // if (!user || user.role_id !== 1) {
  //   navigate('/login')
  //   return null
  // }

  // Just render content
  return (
    <DashboardLayout>
      {/* Dashboard content */}
    </DashboardLayout>
  )
}
```

## Quick Test

### Test 1: Manual Auth Check
1. Open browser console
2. Manually set auth data:
```javascript
localStorage.setItem('auth_token', 'test-token')
localStorage.setItem('auth_user', JSON.stringify({
  id: 1,
  name: 'Test Owner',
  email: 'owner@test.com',
  role_id: 1
}))
```
3. Navigate to `http://localhost:3001/dashboard/owner`
4. Dashboard should show content

### Test 2: Check Network Tab
1. Login at `/login`
2. Open Network tab
3. Check if `/api/auth/login` returns correct data
4. Verify response has `role_id: 1`

### Test 3: Check Console Errors
1. Login and navigate to dashboard
2. Open browser console
3. Look for errors like:
   - "Cannot read property 'role_id' of null"
   - "User not authenticated"
   - API errors

## Recommended Solution

I recommend **Fix 3** - Remove the auth guards from individual dashboard components and rely solely on `DashboardLayout` for role-based rendering. This is cleaner and avoids redirect loops.

Update all dashboard files:
- `OwnerDashboard.tsx`
- `InventoryDashboard.tsx`
- `AccountantDashboard.tsx`
- etc.

Remove lines like:
```typescript
if (!user || user.role_id !== X) {
  navigate('/login')
  return null
}
```

The `DashboardLayout` will handle role checking and render the appropriate layout or redirect to login if needed.
