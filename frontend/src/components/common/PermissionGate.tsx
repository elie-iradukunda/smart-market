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

  // Super admin and owner have all permissions
  if (user?.is_super_admin || user?.role_id === 1) {
    return <>{children}</>
  }

  // Check single permission
  if (permission) {
    const hasPermission = currentUserHasPermission(permission)
    return hasPermission ? <>{children}</> : <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAllPermissions = permissions.every(perm => currentUserHasPermission(perm))
    const hasAnyPermission = permissions.some(perm => currentUserHasPermission(perm))
    const hasRequiredPermissions = requireAll ? hasAllPermissions : hasAnyPermission
    return hasRequiredPermissions ? <>{children}</> : <>{fallback}</>
  }

  // No permission required - show content
  return <>{children}</>
}

