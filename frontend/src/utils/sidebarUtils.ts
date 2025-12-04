import { currentUserHasPermission, getAuthUser } from './apiClient'

export interface SidebarItem {
  label: string
  path?: string
  icon: React.ElementType
  permission?: string | null
  children?: SidebarItem[]
}

/**
 * Filters sidebar items based on user permissions
 * Owner role (1) sees everything, other roles see only what they have permission for
 */
export function filterSidebarItemsByPermission(items: SidebarItem[]): SidebarItem[] {
  const user = getAuthUser()
  
  if (!user) {
    return [] // No user, show nothing
  }
  
  // Owner role has all permissions, so show everything
  if (user.role_id === 1) {
    return items
  }

  return items.filter(item => {
    // If item has permission requirement, check it first
    if (item.permission) {
      const hasPermission = currentUserHasPermission(item.permission)
      if (!hasPermission) {
        return false // Hide item if permission check fails
      }
    }
    
    // If item has children, filter them recursively
    if (item.children && item.children.length > 0) {
      const filteredChildren = filterSidebarItemsByPermission(item.children)
      // Only show parent if it has at least one visible child
      if (filteredChildren.length === 0) {
        return false // Hide parent if no children are visible
      }
      return true
    }
    
    // Item without children - show if permission check passed (or no permission required)
    return true
  }).map(item => {
    // Map to create new objects with filtered children, preserving icon components
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: filterSidebarItemsByPermission(item.children)
      }
    }
    return item
  })
}

