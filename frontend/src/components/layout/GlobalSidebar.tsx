// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken } from '@/utils/apiClient'
import { API_BASE } from '@/config/api'
import {
    LayoutDashboard,
    ShoppingCart,
    DollarSign,
    Users,
    Settings,
    ChevronDown,
    ChevronRight,
    LogOut,
    Package,
    Factory,
    FileText,
    BarChart3,
    Megaphone,
    MessageSquare,
    Zap,
    ClipboardList,
    Truck,
    Box,
    Building2,
    CreditCard,
    Receipt,
    BookOpen,
    TrendingUp,
    ShoppingBag,
    UserPlus,
    Shield,
    Activity,
    Eye,
    Calendar,
    Layers,
    Store,
    Sparkles,
    Mail,
    KeyRound,
    FolderOpen
} from 'lucide-react'
import { clearAuth, getAuthUser, currentUserHasPermission, getPermissionsForRole } from '@/utils/apiClient'
import { filterSidebarItemsByPermission, SidebarItem } from '@/utils/sidebarUtils'

const sidebarItems: SidebarItem[] = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        permission: null, // Dashboard is accessible to all authenticated users (will be handled specially)
    },
    {
        label: 'Financial Management',
        icon: DollarSign,
        permission: null, // Show if any child is visible
        children: [
            { label: 'Finance Reports', path: '/finance/reports', icon: BarChart3, permission: 'report.view' },
            { label: 'Invoices', path: '/finance/invoices', icon: Receipt, permission: 'invoice.view' },
            { label: 'Payments', path: '/finance/payments', icon: CreditCard, permission: 'payment.view' },
            { label: 'Chart of Accounts', path: '/finance/accounts', icon: BookOpen, permission: 'report.view' },
            { label: 'Journal Entries', path: '/finance/journals', icon: FileText, permission: 'journal.create' },
            { label: 'POS Terminal', path: '/pos/terminal', icon: Store, permission: 'pos.create' },
            { label: 'POS Sales History', path: '/pos/sales-history', icon: ShoppingBag, permission: 'pos.view' },
        ]
    },
    {
        label: 'Operations & Production',
        icon: Factory,
        permission: null, // Show if any child is visible
        children: [
            { label: 'Customer Orders', path: '/orders', icon: ShoppingCart, permission: 'order.view' },
            { label: 'Work Orders', path: '/production/work-orders', icon: ClipboardList, permission: 'workorder.view' },
            { label: 'Production Schedule', path: '/production/schedule', icon: Calendar, permission: 'workorder.view' },
            { label: 'New Work Order', path: '/production/new-order', icon: Factory, permission: 'workorder.create' },
        ]
    },
    {
        label: 'Inventory Management',
        icon: Package,
        permission: null, // Show if any child is visible
        children: [
            { label: 'Raw Materials', path: '/inventory/materials', icon: Box, permission: 'material.view' },
            { label: 'Products', path: '/inventory/products', icon: ShoppingBag, permission: 'material.view' },
            { label: 'Material Pricing', path: '/inventory/material-pricing', icon: DollarSign, permission: 'material.manage' },
            { label: 'Material Sales', path: '/inventory/material-sales', icon: ShoppingCart, permission: 'material.sell' },
            { label: 'Purchase Orders', path: '/inventory/purchase-orders', icon: ShoppingCart, permission: 'po.view' },
            { label: 'Suppliers', path: '/inventory/suppliers', icon: Building2, permission: 'supplier.view' },
            { label: 'Stock Movements', path: '/inventory/stock-movements', icon: Truck, permission: 'inventory.manage' },
            { label: 'BOM Templates', path: '/inventory/bom-templates', icon: Layers, permission: 'material.view' },
            { label: 'Inventory Reports', path: '/inventory/reports', icon: BarChart3, permission: 'report.view' },
        ]
    },
    {
        label: 'Sales & Customer Relations',
        icon: Users,
        permission: null, // Show if any child is visible
        children: [
            { label: 'Customers', path: '/crm/customers', icon: Users, permission: 'customer.view' },
            { label: 'Sales Leads', path: '/crm/leads', icon: UserPlus, permission: 'lead.view' },
            { label: 'Quotes Management', path: '/crm/quotes', icon: FileText, permission: 'quote.view' },
            { label: 'Sales Orders', path: '/orders', icon: ShoppingCart, permission: 'order.view' },
        ]
    },
    {
        label: 'Marketing & Campaigns',
        icon: Megaphone,
        permission: null, // Show if any child is visible
        children: [
            { label: 'Campaigns', path: '/marketing/campaigns', icon: Megaphone, permission: 'campaign.view' },
            { label: 'Ads Management', path: '/marketing/ads', icon: Sparkles, permission: 'ad.view' },
            { label: 'Ad Performance', path: '/marketing/ad-performance', icon: TrendingUp, permission: 'campaign.view' },
        ]
    },
    {
        label: 'Communications',
        icon: MessageSquare,
        permission: null, // Show if any child is visible
        children: [
            { label: 'Team Inbox', path: '/communications/inbox', icon: Mail, permission: 'conversation.view' },
        ]
    },
    {
        label: 'Reports & Analytics',
        icon: BarChart3,
        permission: null, // Show if any child is visible
        children: [
            { label: 'Financial Reports', path: '/finance/reports', icon: BarChart3, permission: 'report.view' },
            { label: 'Operations Reports', path: '/reports/operations', icon: TrendingUp, permission: 'report.view' },
            { label: 'Production Reports', path: '/reports/production', icon: Factory, permission: 'report.view' },
            { label: 'Inventory Reports', path: '/inventory/reports', icon: Package, permission: 'report.view' },
        ]
    },
    {
        label: 'AI & Insights',
        icon: Zap,
        permission: null, // Show if any child is visible
        children: [
            { label: 'AI Overview', path: '/ai/overview', icon: Sparkles, permission: 'ai.view' },
        ]
    },
    {
        label: 'Administration',
        icon: Settings,
        permission: null, // Show if any child is visible
        children: [
            { label: 'Manage Users', path: '/admin/users', icon: Users, permission: 'user.view' },
            { label: 'Roles & Permissions', path: '/admin/roles', icon: Shield, permission: 'role.manage' },
            { label: 'Employee Activity', path: '/admin/employee-activity', icon: Activity, permission: 'user.view' },
            { label: 'Audit Logs', path: '/admin/audit-logs', icon: Eye, permission: 'audit.view' },
            { label: 'System Settings', path: '/admin/system-settings', icon: Settings, permission: 'settings.manage' },
            { label: 'Change Password', path: '/account/change-password', icon: KeyRound, permission: null }, // Everyone can change their password
            { label: 'Files', path: '/files', icon: FolderOpen, permission: 'file.view' },
        ]
    },
]

const GlobalSidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [expandedItems, setExpandedItems] = useState<string[]>([
        'Financial Management',
        'Operations & Production',
        'Inventory Management',
        'Sales & Customer Relations',
        'Marketing & Campaigns',
        'Reports & Analytics',
        'Administration'
    ])
    
    // Use state to track user and force re-renders
    const [user, setUser] = useState(() => getAuthUser())
    const [filterKey, setFilterKey] = useState(0) // Force re-filter key
    const [userActualPermissions, setUserActualPermissions] = useState<string[]>([]) // Real permissions from backend
    
    // Fetch user's actual permissions from backend - CRITICAL for accurate filtering
    useEffect(() => {
        const fetchUserPermissions = async () => {
            const currentUser = getAuthUser()
            if (!currentUser || !currentUser.id) {
                setUserActualPermissions([])
                return
            }
            
            // Super admin and owner don't need permission check
            if (currentUser.is_super_admin || currentUser.role_id === 1) {
                // They have all permissions, but we'll still fetch to be accurate
                setUserActualPermissions(['*'])
                return
            }
            
            try {
                const token = getAuthToken()
                if (!token) {
                    // No token - use empty permissions (will only show Dashboard)
                    setUserActualPermissions([])
                    return
                }
                
                console.log('🔒 [SIDEBAR] Fetching permissions for user:', currentUser.id)
                const res = await fetch(`${API_BASE}/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                if (res.ok) {
                    const data = await res.json()
                    const permissionCodes = data.permissions || []
                    console.log('🔒 [SIDEBAR] ✅ Fetched actual permissions from backend:', {
                        userId: currentUser.id,
                        roleId: currentUser.role_id,
                        permissions: permissionCodes,
                        count: permissionCodes.length
                    })
                    setUserActualPermissions(permissionCodes)
                } else {
                    const errorData = await res.json().catch(() => ({}))
                    console.warn('🔒 [SIDEBAR] ⚠️ Failed to fetch permissions:', res.status, errorData)
                    // DENY BY DEFAULT: If we can't fetch permissions, assume user has NONE
                    // This ensures security - only show Dashboard
                    console.log('🔒 [SIDEBAR] Cannot verify permissions - denying all (security first)')
                    setUserActualPermissions([])
                }
            } catch (error) {
                console.error('🔒 [SIDEBAR] ❌ Error fetching permissions:', error)
                // DENY BY DEFAULT: On error, use empty array (only Dashboard will show)
                console.log('🔒 [SIDEBAR] Error fetching - denying all (security first)')
                setUserActualPermissions([])
            }
        }
        
        fetchUserPermissions()
    }, [user?.id, user?.role_id])
    
    // Watch for user changes in localStorage
    useEffect(() => {
        const checkUser = () => {
            const currentUser = getAuthUser()
            if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
                setUser(currentUser)
                setFilterKey(prev => prev + 1) // Force re-filter
            }
        }
        
        // Check immediately
        checkUser()
        
        // Check on storage events (when localStorage changes)
        const handleStorageChange = () => {
            checkUser()
        }
        
        window.addEventListener('storage', handleStorageChange)
        
        // Also check periodically (in case storage event doesn't fire)
        const interval = setInterval(checkUser, 1000)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            clearInterval(interval)
        }
    }, [user])

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        )
    }

    const isActive = (path?: string) => {
        if (!path) return false
        return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    const handleLogout = () => {
        clearAuth()
        navigate('/login')
    }

    // DENY-BY-DEFAULT filtering: Hide everything first, then show only what user has permission for
    const filteredItems = useMemo(() => {
      // Start with EMPTY array - deny by default
      if (!user) {
        return []
      }

      // Super admins and owners see everything
      if (user.is_super_admin || user.role_id === 1) {
        return sidebarItems
      }

      // STRICT: Use ONLY ACTUAL permissions from backend
      // If permissions haven't loaded yet (empty array), show ONLY Dashboard
      // Never use role-based fallback - we want actual backend permissions only
      const userPerms = userActualPermissions
      
      // If permissions are empty, user might still be loading OR has no permissions
      // To be safe, show ONLY Dashboard until permissions are confirmed
      if (userPerms.length === 0) {
        console.log('🔒 [FILTER] No permissions loaded yet - showing ONLY Dashboard')
        return sidebarItems.filter(item => item.path === '/dashboard' || item.path === '/')
      }
      
      console.log('🔒 [FILTER] Starting filter for user:', {
        userId: user.id,
        roleId: user.role_id,
        isSuperAdmin: user.is_super_admin,
        usingActualPermissions: true,
        userPermissions: userPerms,
        permissionCount: userPerms.length
      })
      
      // Start with EMPTY array - deny by default, ONLY add items user has explicit permission for
      const filtered: SidebarItem[] = []
      
      // Go through each sidebar item
      for (const item of sidebarItems) {
        // If item has children, check each child individually
        if (item.children && item.children.length > 0) {
          // Start with EMPTY children array - deny by default
          const allowedChildren: SidebarItem[] = []
          
          // Check each child - ONLY add if user has explicit permission
          for (const child of item.children) {
            let shouldShow = false
            
            // STRICT: If child has no permission requirement, DENY by default
            // Only Dashboard is allowed without permission
            if (!child.permission) {
              // Only allow Dashboard path
              if (child.path === '/dashboard' || child.path === '/') {
                shouldShow = true
                console.log('✅ [FILTER] Allowing Dashboard (special case):', child.label)
              } else {
                // DENY everything else that has no permission requirement
                console.log('🔒 [FILTER] HIDING (no permission requirement):', child.label, child.path)
                shouldShow = false
              }
            } else {
              // Child requires permission - Check if user has this permission OR any related permission
              // For example, if link requires 'customer.view', also show if user has 'customer.create', 'customer.manage', etc.
              const hasExactPermission = userPerms.includes('*') || userPerms.includes(child.permission)
              
              // If no exact match, check for related permissions (same resource, different action)
              let hasRelatedPermission = false
              if (!hasExactPermission && child.permission) {
                // Extract resource from permission (e.g., 'customer' from 'customer.view')
                const permissionParts = child.permission.split('.')
                if (permissionParts.length === 2) {
                  const resource = permissionParts[0]
                  // Check if user has any permission for this resource (customer.create, customer.view, customer.manage, etc.)
                  hasRelatedPermission = userPerms.some(perm => {
                    const userPermParts = perm.split('.')
                    return userPermParts.length === 2 && userPermParts[0] === resource
                  })
                }
              }
              
              shouldShow = hasExactPermission || hasRelatedPermission
              
              if (shouldShow) {
                console.log('✅ [FILTER] Allowing:', child.label, {
                  required: child.permission,
                  hasExact: hasExactPermission,
                  hasRelated: hasRelatedPermission,
                  userPermissions: userPerms.filter(p => p.includes(child.permission.split('.')[0]))
                })
              } else {
                console.log('🔒 [FILTER] HIDING (no permission):', child.label, {
                  required: child.permission,
                  userHas: userPerms,
                  path: child.path
                })
              }
            }
            
            // ONLY add if explicitly allowed
            if (shouldShow) {
              allowedChildren.push(child)
            }
          }
          
          // ONLY include parent if it has at least one allowed child
          if (allowedChildren.length > 0) {
            console.log('✅ [FILTER] Adding parent:', item.label, 'with', allowedChildren.length, 'children')
            filtered.push({
              ...item,
              children: allowedChildren
            })
          } else {
            console.log('🔒 [FILTER] HIDING parent (no allowed children):', item.label)
          }
        } else {
          // Item without children - STRICT permission check
          let shouldShow = false
          
          if (!item.permission) {
            // No permission required - ONLY allow Dashboard
            if (item.path === '/dashboard' || item.path === '/') {
              shouldShow = true
              console.log('✅ [FILTER] Allowing Dashboard (special case):', item.label)
            } else {
              // DENY everything else
              console.log('🔒 [FILTER] HIDING (no permission requirement):', item.label, item.path)
              shouldShow = false
            }
          } else {
            // Item requires permission - Check if user has this permission OR any related permission
            const hasExactPermission = userPerms.includes('*') || userPerms.includes(item.permission)
            
            // If no exact match, check for related permissions (same resource, different action)
            let hasRelatedPermission = false
            if (!hasExactPermission && item.permission) {
              // Extract resource from permission (e.g., 'customer' from 'customer.view')
              const permissionParts = item.permission.split('.')
              if (permissionParts.length === 2) {
                const resource = permissionParts[0]
                // Check if user has any permission for this resource (customer.create, customer.view, customer.manage, etc.)
                hasRelatedPermission = userPerms.some(perm => {
                  const userPermParts = perm.split('.')
                  return userPermParts.length === 2 && userPermParts[0] === resource
                })
              }
            }
            
            shouldShow = hasExactPermission || hasRelatedPermission
            
            if (shouldShow) {
              console.log('✅ [FILTER] Allowing:', item.label, {
                required: item.permission,
                hasExact: hasExactPermission,
                hasRelated: hasRelatedPermission,
                userPermissions: userPerms.filter(p => p.includes(item.permission.split('.')[0]))
              })
            } else {
              console.log('🔒 [FILTER] HIDING (no permission):', item.label, {
                required: item.permission,
                userHas: userPerms
              })
            }
          }
          
          // ONLY add if explicitly allowed
          if (shouldShow) {
            filtered.push(item)
          }
        }
      }
      
      console.log('🔒 [FILTER] Final result:', {
        originalCount: sidebarItems.length,
        filteredCount: filtered.length,
        filteredItems: filtered.map(i => ({
          label: i.label,
          childrenCount: i.children?.length || 0,
          children: i.children?.map(c => c.label) || []
        }))
      })
      
      return filtered
    }, [user?.id, user?.role_id, user?.is_super_admin, filterKey, userActualPermissions]) // Re-filter when user changes or permissions change
    
    // Debug logging in development - ALWAYS log to help debug
    if (user) {
      const userPerms = user.role_id ? getPermissionsForRole(user.role_id) : []
      console.log('🔒 GlobalSidebar - STRICT Permission Filtering:', {
        userId: user.id,
        roleId: user.role_id,
        isSuperAdmin: user.is_super_admin,
        userPermissions: userPerms,
        originalItems: sidebarItems.length,
        filteredItems: filteredItems.length,
        filteredItemsList: filteredItems.map(item => ({
          label: item.label,
          hasChildren: !!item.children,
          childrenCount: item.children?.length || 0,
          children: item.children?.map(c => {
            const hasPerm = c.permission ? (userPerms.includes('*') || userPerms.includes(c.permission)) : true
            return {
              label: c.label,
              path: c.path,
              permission: c.permission,
              hasPermission: hasPerm,
              willShow: hasPerm
            }
          })
        })),
        // Show what was filtered OUT
        filteredOut: sidebarItems.filter(item => {
          if (item.children) {
            const hasAnyChild = item.children.some(child => {
              if (!child.permission) return true
              return userPerms.includes('*') || userPerms.includes(child.permission)
            })
            return !hasAnyChild
          }
          if (item.permission) {
            return !(userPerms.includes('*') || userPerms.includes(item.permission))
          }
          return false
        }).map(item => item.label)
      })
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-gradient-to-b from-slate-50 via-white to-gray-50 border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center justify-center border-b border-slate-200 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                            <LayoutDashboard size={20} />
                        </div>
                        <span>
                            Top<span className="font-light">Design</span>
                        </span>
                    </div>
                </div>

                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                            <p className="truncate text-xs text-slate-600">{user?.email || 'user@topdesign.com'}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                    {!user ? (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                    ) : filteredItems.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-500">No accessible pages</div>
                    ) : (
                        filteredItems.map((item) => {
                          // Pre-check: Count visible children to hide parent if none
                          if (item.children) {
                            const userPerms = userActualPermissions.length > 0 
                              ? userActualPermissions 
                              : (user ? getPermissionsForRole(user.role_id) : [])
                            
                            const visibleCount = item.children.filter((child) => {
                              if (!user) return false
                              if (user.is_super_admin || user.role_id === 1) return true
                              if (!child.permission) return child.path === '/dashboard' || child.path === '/'
                              
                              const hasExact = userPerms.includes('*') || userPerms.includes(child.permission)
                              if (hasExact) return true
                              
                              // Check for related permissions
                              const parts = child.permission.split('.')
                              if (parts.length === 2) {
                                return userPerms.some(p => {
                                  const pParts = p.split('.')
                                  return pParts.length === 2 && pParts[0] === parts[0]
                                })
                              }
                              return false
                            }).length
                            
                            // Don't render parent if no children are visible
                            if (visibleCount === 0) {
                              return null
                            }
                          }
                          
                          return (
                        <div key={item.label}>
                            {item.children ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                            expandedItems.includes(item.label)
                                                ? 'text-blue-700 bg-blue-50/80 shadow-sm border border-blue-100'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={expandedItems.includes(item.label) ? 'text-blue-600' : 'text-slate-500'} />
                                            <span>{item.label}</span>
                                        </div>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown size={16} className="text-slate-500" />
                                        ) : (
                                            <ChevronRight size={16} className="text-slate-500" />
                                        )}
                                    </button>

                                    <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${
                                        expandedItems.includes(item.label) ? 'max-h-[800px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                                    }`}>
                                        {/* FINAL CHECK: Only render children that user has explicit permission for */}
                                         {(() => {
                                          // Use ACTUAL permissions from backend if available
                                          const userPerms = userActualPermissions.length > 0 
                                            ? userActualPermissions 
                                            : (user ? getPermissionsForRole(user.role_id) : [])
                                           
                                          // FILTERING: Check for exact or related permissions
                                          const allowedChildren = item.children.filter((child) => {
                                            // Deny by default - only show if explicitly allowed
                                            if (!user) {
                                              console.log('🔒 [RENDER] No user, hiding:', child.label)
                                              return false
                                            }
                                            
                                            // Super admin and owner see everything
                                            if (user.is_super_admin || user.role_id === 1) {
                                              return true
                                            }
                                            
                                            // STRICT: If child has no permission requirement, DENY by default
                                            // Only Dashboard is allowed
                                            if (!child.permission) {
                                              const allowed = child.path === '/dashboard' || child.path === '/'
                                              if (!allowed) {
                                                console.log('🔒 [RENDER] HIDING (no permission requirement):', child.label, child.path)
                                              }
                                              return allowed
                                            }
                                            
                                            // Check if user has this permission OR any related permission
                                            const hasExactPermission = userPerms.includes('*') || userPerms.includes(child.permission)
                                            
                                            // If no exact match, check for related permissions (same resource, different action)
                                            let hasRelatedPermission = false
                                            if (!hasExactPermission && child.permission) {
                                              // Extract resource from permission (e.g., 'customer' from 'customer.view')
                                              const permissionParts = child.permission.split('.')
                                              if (permissionParts.length === 2) {
                                                const resource = permissionParts[0]
                                                // Check if user has any permission for this resource (customer.create, customer.view, customer.manage, etc.)
                                                hasRelatedPermission = userPerms.some(perm => {
                                                  const userPermParts = perm.split('.')
                                                  return userPermParts.length === 2 && userPermParts[0] === resource
                                                })
                                              }
                                            }
                                            
                                            const hasPermission = hasExactPermission || hasRelatedPermission
                                            
                                            if (!hasPermission) {
                                              console.log('🔒 [RENDER] HIDING (no permission):', child.label, {
                                                requiredPermission: child.permission,
                                                userPermissions: userPerms,
                                                usingActualPermissions: userActualPermissions.length > 0,
                                                roleId: user.role_id
                                              })
                                            } else {
                                              console.log('✅ [RENDER] SHOWING:', child.label, {
                                                requiredPermission: child.permission,
                                                hasExact: hasExactPermission,
                                                hasRelated: hasRelatedPermission,
                                                userPermissions: userPerms.filter(p => p.includes(child.permission.split('.')[0]))
                                              })
                                            }
                                            
                                            return hasPermission
                                          })
                                          
                                          // Don't render parent section if no children are allowed
                                          if (allowedChildren.length === 0) {
                                            return null
                                          }
                                          
                                          return allowedChildren.map((child) => (
                                            <Link
                                              key={child.label}
                                              to={child.path!}
                                              onClick={() => setIsOpen(false)}
                                              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ml-2 ${
                                                isActive(child.path)
                                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                              }`}
                                            >
                                              <child.icon size={16} className={`transition-colors ${
                                                isActive(child.path) ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                                              }`} />
                                              <span>{child.label}</span>
                                            </Link>
                                          ))
                                        })()}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path!}
                                    onClick={() => setIsOpen(false)}
                                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                                        isActive(item.path)
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <item.icon size={18} className={`transition-colors ${
                                        isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                                    }`} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                          )
                        })
                    )}
                </nav>

                {/* Footer Section */}
                <div className="border-t border-slate-200 p-4 space-y-2 bg-gradient-to-b from-white to-slate-50/50">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white p-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-all shadow-sm hover:shadow-md"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default GlobalSidebar

