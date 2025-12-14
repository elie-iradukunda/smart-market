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
 * Super admins and Owner role (1) see everything, other roles see only what they have permission for
 */
export function filterSidebarItemsByPermission(items: SidebarItem[]): SidebarItem[] {
  const user = getAuthUser()

  if (!user) {
    return [] // No user, show nothing
  }

  // Super admins and Owner role have all permissions, so show everything
  if (user.is_super_admin || user.role_id === 1) {
    return items
  }

  const filtered: SidebarItem[] = []

  for (const item of items) {
    // If item has children, filter them first
    if (item.children && item.children.length > 0) {
      const filteredChildren = filterSidebarItemsByPermission(item.children)

      // Only include parent if it has at least one visible child
      if (filteredChildren.length > 0) {
        filtered.push({
          ...item,
          children: filteredChildren
        })
      }
      // If no children are visible, skip the parent entirely
    } else {
      // Item without children - check permission
      if (item.permission) {
        const hasPermission = currentUserHasPermission(item.permission)
        if (hasPermission) {
          filtered.push(item)
        }
        // If no permission, skip the item
      } else {
        // Item without permission requirement - show it (like Dashboard)
        filtered.push(item)
      }
    }
  }

  return filtered
}


