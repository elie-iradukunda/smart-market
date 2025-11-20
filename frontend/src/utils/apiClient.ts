export interface ApiUser {
  id: number
  name: string
  email: string
  role_id: number | null
}

export interface LoginResponse {
  token: string
  user: ApiUser
}

const API_BASE = 'http://localhost:3000/api'

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Login failed')
  }

  return res.json()
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token)
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function setAuthUser(user: ApiUser) {
  localStorage.setItem('auth_user', JSON.stringify(user))
}

export function getAuthUser(): ApiUser | null {
  const raw = localStorage.getItem('auth_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as ApiUser
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}

// Simple permission mapping per role_id for UI visibility (must stay in sync with backend seeds)
export function getPermissionsForRole(roleId: number | null | undefined): string[] {
  switch (roleId) {
    case 1: // Owner – all permissions
      return ['*']
    case 2: // Sys Admin
      return ['user.manage', 'role.manage', 'audit.view', 'settings.manage', 'report.view']
    case 3: // Accountant
      return ['invoice.create', 'payment.create', 'journal.create', 'pos.create', 'report.view']
    case 4: // Controller
      return ['report.view', 'inventory.manage', 'material.view']
    case 5: // Reception
      return ['customer.manage', 'lead.manage', 'quote.manage', 'material.view']
    case 6: // Technician
      return ['worklog.create', 'workorder.update', 'order.update', 'material.view']
    case 7: // Production Manager
      return ['order.update', 'workorder.create', 'workorder.update', 'worklog.create', 'inventory.manage', 'material.view', 'report.view']
    case 8: // Inventory Manager
      return ['inventory.manage', 'material.view', 'report.view']
    case 9: // Sales Rep
      return ['customer.manage', 'lead.manage', 'quote.manage']
    case 10: // Marketing Manager
      return ['campaign.view', 'campaign.create', 'campaign.update', 'adperformance.view', 'lead.manage', 'report.view', 'ai.view']
    case 11: // POS Cashier
      return ['pos.create', 'payment.create']
    case 12: // Support Agent
      return ['conversation.view', 'message.send', 'customer.manage']
    default:
      return []
  }
}

export function currentUserHasPermission(code: string): boolean {
  const user = getAuthUser()
  if (!user) return false
  const perms = getPermissionsForRole(user.role_id)
  if (perms.includes('*')) return true
  return perms.includes(code)
}

// Map backend role_id to the correct dashboard route inside the business app
export function getDashboardPathForRole(roleId: number | null | undefined): string {
  switch (roleId) {
    case 1: // Owner
      return '/dashboard/owner'
    case 2: // Sys Admin
      return '/dashboard/admin'
    case 3: // Accountant
      return '/dashboard/accountant'
    case 4: // Controller
      return '/dashboard/controller'
    case 5: // Reception
      return '/dashboard/reception'
    case 6: // Technician
      return '/dashboard/technician'
    case 7: // Production Manager
      return '/dashboard/production'
    case 8: // Inventory Manager (Storekeeper)
      return '/dashboard/inventory'
    case 9: // Sales Rep
      return '/dashboard/sales'
    case 10: // Marketing Manager
      return '/dashboard/marketing'
    case 11: // POS Cashier
      return '/dashboard/pos'
    case 12: // Support Agent
      return '/dashboard/support'
    default:
      // Fallback to admin overview if something is missing
      return '/dashboard/admin'
  }
}
