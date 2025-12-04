// Debug utility to test permission checking
import { getAuthUser, getPermissionsForRole, currentUserHasPermission } from './apiClient'

export function debugPermissions() {
  const user = getAuthUser()
  if (!user) {
    console.warn('No user found')
    return
  }

  console.log('=== Permission Debug Info ===')
  console.log('User:', {
    id: user.id,
    name: user.name,
    email: user.email,
    role_id: user.role_id
  })

  const perms = getPermissionsForRole(user.role_id)
  console.log('Permissions for role:', perms)

  // Test specific permissions
  const testPerms = [
    'order.view',
    'workorder.view',
    'material.view',
    'supplier.view',
    'report.view',
    'file.view',
    'customer.view', // Should be false
    'invoice.view', // Should be false
    'user.manage', // Should be false
  ]

  console.log('\nPermission Checks:')
  testPerms.forEach(perm => {
    const has = currentUserHasPermission(perm)
    console.log(`  ${perm}: ${has ? '✅' : '❌'}`)
  })
}

// Call this in browser console: window.debugPermissions()
if (typeof window !== 'undefined') {
  (window as any).debugPermissions = debugPermissions
}

