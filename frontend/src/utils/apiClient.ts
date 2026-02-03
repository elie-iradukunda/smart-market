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

// Simple permission mapping per role_id for UI visibility (must stay in sync with backend seeds)
export function getPermissionsForRole(roleId: number | null | undefined): string[] {
  switch (roleId) {
    case 1: // Admin (includes: owner, admin, accountant, controller)
      return [
        '*', // Full access like owner
        'user.manage',
        'role.manage',
        'audit.view',
        'settings.manage',
        'invoice.create',
        'invoice.view',
        'invoice.send',
        'payment.create',
        'payment.view',
        'payment.refund',
        'journal.create',
        'report.view',
        'customer.view',
        'order.view',
        'order.update',
        'inventory.manage',
        'material.view',
        'material.create',
        'supplier.view',
        'ai.view',
        'workorder.view',
        'workorder.create',
        'workorder.update',
        'pos.create',
        'file.upload',
        'file.view',
        'campaign.view',
        'campaign.create',
        'campaign.update',
        'campaign.manage',
        'ad.create',
        'ad.view',
        'ad.edit',
        'ad.delete',
        'conversation.view',
        'conversation.create',
        'message.send',
        'customer.manage',
        'customer.create',
        'lead.manage',
        'lead.view',
        'lead.create',
        'quote.manage',
        'quote.view',
        'quote.create',
        'quote.approve',
        'worklog.create',
        'stock.move',
        'stock.adjust',
        'po.create',
        'po.view',
        'po.approve',
        'marketing.analytics'
      ]
    
    case 2: // Sales (includes: sales_rep, marketing, pos_cashier)
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
        'campaign.view',
        'campaign.create',
        'campaign.update',
        'campaign.manage',
        'ad.create',
        'ad.view',
        'ad.edit',
        'ad.delete',
        'marketing.analytics',
        'ai.view',
        'conversation.view',
        'conversation.create',
        'message.send',
        'material.view',
        'invoice.create',
        'payment.create'
      ]
    
    case 3: // Staff (includes: production_manager, inventory_manager, technician, reception, support_agent)
      return [
        'worklog.create',
        'workorder.view',
        'workorder.create',
        'workorder.update',
        'order.view',
        'order.update',
        'order.create',
        'material.view',
        'material.create',
        'file.view',
        'file.upload',
        'inventory.manage',
        'supplier.view',
        'supplier.create',
        'stock.move',
        'stock.adjust',
        'po.create',
        'po.view',
        'po.approve',
        'report.view',
        'customer.view',
        'customer.create',
        'customer.manage',
        'lead.create',
        'lead.view',
        'lead.manage',
        'quote.create',
        'quote.view',
        'quote.manage',
        'quote.approve',
        'pos.create',
        'pos.view',
        'invoice.create',
        'invoice.view',
        'invoice.send',
        'payment.create',
        'payment.view',
        'conversation.view',
        'conversation.create',
        'message.send'
      ]
    
    case 4: // Client (customer) - external user
      return [
        'customer.view', // their own profile
        'order.view', // their own orders
        'quote.view', // their own quotes
        'file.view', // their own files
        'conversation.view', // their conversations
        'message.send' // send messages
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

  const perms = getPermissionsForRole(user.role_id)

  // Owner has all permissions
  if (perms.includes('*')) {
    return true
  }

  const hasPermission = perms.includes(code)

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    if (!hasPermission && user.role_id === 7) {
      console.log(`Permission check for Production Manager: ${code} = ${hasPermission}`, {
        roleId: user.role_id,
        availablePermissions: perms
      })
    }
  }

  return hasPermission
}

// Map backend role_id to the correct dashboard route inside the business app
export function getDashboardPathForRoless(roleId: number | null | undefined): string {
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
    case 8: // Inventory Manager
      return '/dashboard/inventory'
    case 9: // Sales Rep
      return '/dashboard/sales'
    case 10: // Marketing Manager
      return '/dashboard/marketing'
    case 11: // POS Cashier
      return '/dashboard/pos'
    case 12: // Support Agent
      return '/dashboard/support'
    case 13: // Customer (e-commerce)
      return '/' 
    default:
      
      return '/dashboard/owner'
  }
}

// Map backend role_id to the correct dashboard route (4 dashboards total)
export function getDashboardPathForRole(roleId: number | null | undefined): string {
  switch (roleId) {
    case 1: // Admin (includes owner, admin, accountant, controller)
      return '/dashboard/admin'
    case 2: // Sales (includes sales_rep, marketing, pos_cashier)
      return '/dashboard/sales'
    case 3: 
    // Staff (includes production_manager, inventory_manager,
    // technician, reception, support_agent)
      return '/dashboard/staff'
    case 4: // Client (customer)
      return '/client'
    default:
      return '/dashboard/admin'
  }
}
// Get role display name

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
