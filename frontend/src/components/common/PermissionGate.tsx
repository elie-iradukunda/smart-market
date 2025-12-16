// @ts-nocheck
import React from 'react'
import { currentUserHasPermission, getAuthUser } from '@/utils/apiClient'

interface PermissionGateProps {
  children: React.ReactNode
  permission: string | null
  fallback?: React.ReactNode
  requireAll?: boolean // If true, requires all permissions (for multiple permissions)
  permissions?: string[] // For multiple permissions check
}

/**
 * PermissionGate component - conditionally renders children based on user permissions
 * Super admins and owners always see the content
 */
export default function PermissionGate({ 
  children, 
  permission, 
  fallback = null,
  requireAll = false,
  permissions = []
}: PermissionGateProps) {
  const user = getAuthUser()

  // If no user, don't show content
  if (!user) {
    return <>{fallback}</>
  }

  // Super admin and owner have all permissions
  if (user.is_super_admin || user.role_id === 1) {
    return <>{children}</>
  }

  // Check single permission (exact or related)
  if (permission) {
    const hasExactPermission = currentUserHasPermission(permission)
    
    // If no exact permission, check for related permissions (same resource, different action)
    // This allows users with customer.create to see content requiring customer.view, etc.
    let hasRelatedPermission = false
    if (!hasExactPermission && user.permissions && Array.isArray(user.permissions)) {
      const permissionParts = permission.split('.')
      if (permissionParts.length === 2) {
        const resource = permissionParts[0]
        // Check if user has any permission for this resource (e.g., customer.create, customer.view, customer.manage)
        hasRelatedPermission = user.permissions.some(perm => {
          const userPermParts = perm.split('.')
          return userPermParts.length === 2 && userPermParts[0] === resource
        })
      }
    }
    
    const hasPermission = hasExactPermission || hasRelatedPermission
    
    if (!hasPermission) {
      // Debug in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`PermissionGate: User ${user.name} (role_id: ${user.role_id}) does NOT have permission: ${permission}`, {
          hasExact: hasExactPermission,
          hasRelated: hasRelatedPermission,
          userPermissions: user.permissions
        })
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`PermissionGate: User ${user.name} has permission (exact: ${hasExactPermission}, related: ${hasRelatedPermission}): ${permission}`)
      }
    }
    
    return hasPermission ? <>{children}</> : <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAllPermissions = permissions.every(perm => currentUserHasPermission(perm))
    const hasAnyPermission = permissions.some(perm => currentUserHasPermission(perm))
    const hasRequiredPermissions = requireAll ? hasAllPermissions : hasAnyPermission
    return hasRequiredPermissions ? <>{children}</> : <>{fallback}</>
  }

  // No permission required - but still check if user is authenticated
  // Only show if user exists (already checked above)
  return <>{children}</>
}




