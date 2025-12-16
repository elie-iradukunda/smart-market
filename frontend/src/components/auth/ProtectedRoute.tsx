// @ts-nocheck
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getAuthUser, currentUserHasPermission } from '@/utils/apiClient'
import { getRequiredPermission } from '@/utils/routePermissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string | null
  fallbackPath?: string
}

/**
 * ProtectedRoute component that checks if user has required permission
 * If no permission is required, it just checks authentication
 * If requiredPermission is not provided, it derives it from the current route
 */
export default function ProtectedRoute({ 
  children, 
  requiredPermission,
  fallbackPath = '/dashboard'
}: ProtectedRouteProps) {
  const location = useLocation()
  const user = getAuthUser()

  // Check authentication
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Super admin and owner have all permissions
  if (user.is_super_admin || user.role_id === 1) {
    return <>{children}</>
  }

  // Derive permission from route if not provided
  const permission = requiredPermission !== undefined 
    ? requiredPermission 
    : getRequiredPermission(location.pathname)

  // If permission is required, check it (exact or related)
  if (permission) {
    const hasExactPermission = currentUserHasPermission(permission)
    
    // If no exact permission, check for related permissions (same resource, different action)
    // This allows users with customer.create to access customer.view routes, etc.
    let hasRelatedPermission = false
    if (!hasExactPermission && user && user.permissions && Array.isArray(user.permissions)) {
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
      // Redirect to dashboard with error message
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 [ProtectedRoute] Blocking access:', {
          path: location.pathname,
          requiredPermission: permission,
          userPermissions: user?.permissions || [],
          hasExact: hasExactPermission,
          hasRelated: hasRelatedPermission
        })
      }
      return <Navigate to={fallbackPath} state={{ error: 'You do not have permission to access this page' }} replace />
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [ProtectedRoute] Allowing access:', {
        path: location.pathname,
        requiredPermission: permission,
        hasExact: hasExactPermission,
        hasRelated: hasRelatedPermission
      })
    }
  }

  return <>{children}</>
}

