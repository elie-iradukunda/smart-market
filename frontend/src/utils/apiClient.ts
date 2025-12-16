export interface ApiUser {
  id: number
  name: string
  email: string
  role_id: number | null
  is_super_admin?: boolean
  permissions?: string[]
}

export interface LoginResponse {
  token: string
  user: ApiUser
}

// Use localhost for local development, production URL for production
const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:3000/api'
  : 'https://topdesign.lanari.rw/api'

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

export async function forgotPasswordRequest(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as any).error || 'Failed to send reset email')
  }
  return data as { message: string }
}

export async function resetPasswordRequest(token: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as any).error || 'Failed to reset password')
  }
  return data as { message: string }
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
  localStorage.removeItem('cart')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('currentUser')
}

// ============================================================================
// User Profile APIs
// ============================================================================

export async function fetchCurrentUser(): Promise<{ id: number; name: string; email: string; role: string; role_id: number; permissions: string[] }> {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch user profile')
  }

  return res.json()
}

// Simple permission mapping per role_id for UI visibility (must stay in sync with backend seeds)
export function getPermissionsForRole(roleId: number | null | undefined): string[] {
  switch (roleId) {
    case 1: // Owner – full access
      return ['*']
    case 2: // Sys Admin – system management
      return [
        'user.manage',
        'role.manage',
        'audit.view',
        'settings.manage',
        'report.view',
        'customer.view',
        'order.view',
        'invoice.view',
        'payment.view',
      ]
    case 3: // Accountant – finance
      return [
        'invoice.create',
        'invoice.view',
        'invoice.send',
        'payment.create',
        'payment.view',
        'payment.refund',
        'journal.create',
        'journal.view',
        'pos.create',
        'pos.view',
        'report.view',
        'customer.view',
        'order.view',
        'supplier.view',
      ]
    case 4: // Controller – operations oversight
      return [
        'order.view',
        'order.update',
        'inventory.manage',
        'material.view',
        'material.create',
        'supplier.view',
        'report.view',
        'ai.view',
        'workorder.view',
        'customer.view',
      ]
    case 5: // Reception – front desk
      return [
        'customer.create',
        'customer.view',
        'customer.manage',
        'lead.create',
        'lead.view',
        'lead.manage',
        'quote.create',
        'quote.view',
        'quote.manage',
        'quote.approve',
        'order.view',
        'order.create',
        'pos.create',
        'pos.view',
        'material.view',
        'file.upload',
        'file.view',
        'invoice.view',
        'payment.view',
      ]
    case 6: // Technician – production work
      return [
        'worklog.create',
        'workorder.view',
        'workorder.update',
        'order.view',
        'order.update',
        'material.view',
        'file.view',
      ]
    case 7: // Production Manager – production oversight
      return [
        'workorder.view',
        'workorder.create',
        'workorder.update',
        'worklog.create',
        'order.view',
        'order.update',
        'material.view',
        'material.create',
        'supplier.view',
        'inventory.manage',
        'report.view',
        'file.view',
        'customer.view',
      ]
    case 8: // Inventory Manager – stock management
      return [
        'inventory.manage',
        'material.view',
        'material.create',
        'material.update',
        'stock.move',
        'stock.adjust',
        'po.create',
        'po.view',
        'po.approve',
        'supplier.view',
        'supplier.create',
        'report.view',
        'order.view',
      ]
    case 9: // Sales Rep – CRM and sales
      return [
        'customer.manage',
        'customer.view',
        'customer.create',
        'lead.manage',
        'lead.view',
        'lead.create',
        'quote.manage',
        'quote.view',
        'quote.create',
        'quote.approve',
        'order.view',
        'order.create',
        'pos.create',
        'pos.view',
        'report.view',
        'file.upload',
        'file.view',
        'invoice.view',
        'payment.view',
      ]
    case 10: // Marketing Manager – campaigns and analytics
      return [
        'campaign.view',
        'campaign.create',
        'campaign.update',
        'campaign.manage',
        'ad.create',
        'ad.view',
        'ad.edit',
        'ad.delete',
        'marketing.analytics',
        'lead.view',
        'lead.manage',
        'report.view',
        'ai.view',
        'customer.view',
      ]
    case 11: // POS Cashier – point of sale
      return [
        'pos.create',
        'pos.view',
        'customer.view',
        'customer.create',
        'invoice.create',
        'invoice.view',
        'payment.create',
        'payment.view',
        'material.view',
        'lead.create',
        'quote.create',
      ]
    case 12: // Support Agent – customer support
      return [
        'conversation.view',
        'conversation.create',
        'message.send',
        'customer.view',
        'customer.manage',
        'order.view',
        'file.view',
        'file.upload',
      ]
    default:
      return []
  }
}

export function currentUserHasPermission(code: string): boolean {
  const user = getAuthUser()
  if (!user) {
    console.warn('currentUserHasPermission: No user found')
    return false
  }

  // Super admin has all permissions
  if (user.is_super_admin) {
    return true
  }

  // Owner (role_id 1) has all permissions
  if (user.role_id === 1) {
    return true
  }

  // Use permissions from backend - if not available, return false (don't use fallback)
  // This ensures we only grant permissions that are explicitly assigned
  let userPermissions = user.permissions

  // If permissions array is missing or empty, try to fetch from backend
  // But don't use fallback role-based permissions as they might be too permissive
  if (!userPermissions || !Array.isArray(userPermissions) || userPermissions.length === 0) {
    // In development, log a warning
    if (process.env.NODE_ENV === 'development') {
      console.warn(`User ${user.name} (role_id: ${user.role_id}) has no permissions loaded. Permission check for '${code}' will fail.`)
    }
    // Return false - don't grant permissions unless explicitly assigned
    return false
  }

  const hasPermission = userPermissions.includes(code)

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Permission check: ${code} = ${hasPermission}`, {
      userId: user.id,
      userName: user.name,
      roleId: user.role_id,
      availablePermissions: userPermissions,
      requestedPermission: code,
      hasPermission
    })
  }

  return hasPermission
}

// Map backend role_id to the correct dashboard route inside the business app
// All users now go to the global dashboard
export function getDashboardPathForRole(roleId: number | null | undefined): string {
  // Use global dashboard for all business users
  // Customers (role_id 13) go to e-commerce homepage
  if (roleId === 13) {
    return '/' // Customer role goes to e-commerce homepage
  }
  return '/dashboard' // All business users go to global dashboard
}

// --- CRM & Inventory API Helpers ---

export async function fetchLeads() {
  const res = await fetch(`${API_BASE}/leads`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!res.ok) throw new Error('Failed to fetch leads')
  return res.json()
}

export async function fetchLead(id: string | number) {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!res.ok) throw new Error('Failed to fetch lead')
  return res.json()
}

export async function createLead(data: any) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create lead')
  return res.json()
}

export async function fetchMaterials() {
  const res = await fetch(`${API_BASE}/materials`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!res.ok) throw new Error('Failed to fetch materials')
  return res.json()
}

export async function createCustomer(data: any) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create customer')
  return res.json()
}

export async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/customers`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!res.ok) throw new Error('Failed to fetch customers')
  return res.json()
}

export async function fetchQuotes() {
  const res = await fetch(`${API_BASE}/quotes`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!res.ok) throw new Error('Failed to fetch quotes')
  return res.json()
}

export async function createQuote(data: any) {
  const res = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create quote')
  return res.json()
}

export async function approveQuote(id: number) {
  const res = await fetch(`${API_BASE}/quotes/${id}/approve`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  })
  if (!res.ok) throw new Error('Failed to approve quote')
  return res.json()
}
