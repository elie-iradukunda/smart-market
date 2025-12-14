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

  // If permission is required, check it
  if (permission) {
    const hasPermission = currentUserHasPermission(permission)
    if (!hasPermission) {
      // Redirect to dashboard with error message
      return <Navigate to={fallbackPath} state={{ error: 'You do not have permission to access this page' }} replace />
    }
  }

  return <>{children}</>
}

