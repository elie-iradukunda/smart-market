import { getAuthToken } from '@/utils/apiClient'

// Types for supplier product fields
interface SupplierMaterial {
  material_id?: number;
  material_name?: string;
  material_notes?: string;
}

export interface Supplier extends SupplierMaterial {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_terms: string;
  rating: number;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE = 'http://localhost:3000/api'

// CRM: leads list (used by LeadsPage)
export async function fetchDemoLeads() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/leads`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch leads')
  }

  const leads = await res.json()

  // Map backend shape to UI shape expected by CRM LeadsPage
  return leads.map((lead: any) => ({
    id: `L-${lead.id}`,
    name: lead.customer_name || `Lead ${lead.id}`,
    channel: lead.channel,
    status: lead.status || 'New',
    owner: lead.owner_name || 'Unassigned',
  }))
}

// CRM: single lead detail
export async function fetchLead(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/leads/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch lead')
  }

  return res.json()
}

// Finance: Lanari mobile money payment
export async function initiateLanariPayment(payload: { invoice_id: number | string; amount: number; customer_phone: string }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/payments/lanari`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to initiate Lanari payment')
  }

  return data
}

export async function checkLanariPaymentStatus(paymentId: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/payments/${paymentId}/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to check Lanari payment status')
  }

  return data
}

// CRM: single quote detail (used by technician to see materials for an order)
export async function fetchQuote(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/quotes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch quote')
  }

  return res.json()
}

// Finance: single invoice detail
export async function fetchInvoice(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/invoices/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch invoice')
  }

  return res.json()
}

// Orders: customers with orders ready/delivered for reception follow-up
export async function fetchOrdersReadyForCommunication() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/orders/ready-for-communication`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch orders ready for communication')
  }

  return res.json()
}

// CRM: customers list
export async function fetchCustomers() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/customers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch customers')
  }

  return res.json()
}

// Materials: fetch all materials
export async function fetchMaterials() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/materials`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch materials')
  }

  const response = await res.json()
  // Return the data array from the response
  return response.data || []
}

// Inventory: suppliers list
export async function fetchSuppliers() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/suppliers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch suppliers')
  }

  const response = await res.json()
  // Return the data array from the response
  return response.data || []
}

// Inventory: single supplier
export async function fetchSupplier(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch supplier')
  }

  return res.json()
}

// Inventory: create supplier
export async function createSupplier(payload: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create supplier')
  }

  return data
}

// Production: issue materials for an order (used by technicians before/when starting production)
export async function issueOrderMaterials(orderId: number | string, items: Array<{ material_id: number; quantity: number }>) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}/issue-materials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to issue materials for order')
  }

  return data
}

// CRM: approve quote and create order
export async function approveQuote(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/quotes/${id}/approve`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to approve quote')
  }

  return data
}

// Inventory: update supplier
export async function updateSupplier(id: number | string, payload: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update supplier')
  }

  return data
}

// Inventory: delete supplier
export async function deleteSupplier(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete supplier')
  }

  return data
}

// Inventory: stock movements
export async function fetchStockMovements() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/stock-movements`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch stock movements')
  }

  const response = await res.json()
  // Handle both array responses and { data: [...] } responses
  return Array.isArray(response) ? response : (response.data || [])
}

export async function createStockMovement(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/stock-movements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const response = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(response.message || response.error || 'Failed to record stock movement')
  }

  // Return the created stock movement data
  return response.data || response
}

// Production: update order status
export async function updateOrderStatus(id: number | string, status: string) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  // Backend mounts productionRoutes at /api, and the route there is router.put('/orders/:id/status', ...)
  // So the correct URL is /api/orders/:id/status
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update order status')
  }

  return data
}

// Finance: journal entries list
export async function fetchJournalEntries() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/journal-entries`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch journal entries')
  }

  return res.json()
}

// Inventory: single material
export async function fetchMaterial(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/materials/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch material')
  }

  return res.json()
}

// Inventory: create material
export async function createMaterial(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/materials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create material')
  }

  return data
}

// Finance: invoices list
export async function fetchInvoices() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch invoices')
  }

  return res.json()
}

// Communications: update conversation status (open/closed)
export async function updateConversationStatus(conversationId: number | string, status: 'open' | 'closed') {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/conversations/${conversationId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update conversation status')
  }

  return data
}

// Inventory: update material
export async function updateMaterial(id: number | string, payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/materials/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update material')
  }

  return data
}

// Inventory: delete material
export async function deleteMaterial(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/materials/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete material')
  }

  return data
}

// CRM: single customer
export async function fetchCustomer(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/customers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch customer')
  }

  return res.json()
}

// CRM: create customer
export async function createCustomer(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create customer')
  }

  return data
}

// CRM: quotes list
export async function fetchQuotes() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/quotes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch quotes')
  }

  return res.json()
}

// Admin: delete user
export async function deleteUser(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/auth/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete user')
  }

  return data
}

// Finance: create invoice
export async function createInvoice(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create invoice')
  }

  return data
}

// Finance: record payment
export async function recordPayment(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to record payment')
  }

  return data
}

// Finance: payments list
export async function fetchPayments() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/payments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch payments')
  }

  return res.json()
}

// Finance: chart of accounts
export async function fetchAccounts() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/chart-of-accounts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch accounts')
  }

  return res.json()
}

// CRM: create lead
export async function createLead(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create lead')
  }

  return data
}

// CRM: create quote
export async function createQuote(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create quote')
  }

  return data
}

// Marketing: record ad performance metrics for a campaign
export async function recordAdPerformance(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/ad-performance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to record ad performance')
  }

  return data
}

// Admin: audit logs (expects backend GET /api/audit-logs)
export async function fetchAuditLogs() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/audit-logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch audit logs')
  }

  return res.json()
}

// Admin: update role permissions
export async function updateRolePermissions(roleId: number | string, permissionIds: Array<number | string>) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/roles/${roleId}/permissions`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ permission_ids: permissionIds }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update role permissions')
  }

  return data
}

// Inventory: materials list

// Inventory: purchase orders list
export async function fetchPurchaseOrders() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/purchase-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch purchase orders')
  }

  const response = await res.json()
  // Handle both array responses and { data: [...] } responses
  return Array.isArray(response) ? response : (response.data || [])
}

// Inventory: single purchase order
export async function fetchPurchaseOrder(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/purchase-orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch purchase order')
  }

  const response = await res.json()
  // Return the purchase order data, handling both direct and nested response.data
  return response.data || response
}

// Inventory: create purchase order
export async function createPurchaseOrder(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/purchase-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const response = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(response.message || response.error || 'Failed to create purchase order')
  }

  // Return the created purchase order data
  return response.data || response
}

// Inventory: update purchase order
export async function updatePurchaseOrder(id: number | string, payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/purchase-orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update purchase order')
  }

  return data
}

// Admin: create user
export async function createUser(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/auth/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create user')
  }

  return data
}

// Admin: update user
export async function updateUser(id: number | string, payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/auth/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update user')
  }

  return data
}

// Admin: create role
export async function createRole(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create role')
  }

  return data
}

// Admin: update role
export async function updateRole(id: number | string, payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/roles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update role')
  }

  return data
}

// Admin: delete role
export async function deleteRole(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/roles/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete role')
  }

  return data
}

// Admin: permissions catalogue
export async function fetchPermissions() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/permissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch permissions')
  }

  return res.json()
}

// Admin: role permissions for a role
export async function fetchRolePermissions(roleId: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/roles/${roleId}/permissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch role permissions')
  }

  return res.json()
}

// Orders list for OrdersPage (mapped from backend orders API)
export async function fetchDemoOrders() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch orders')
  }

  const orders = await res.json()

  // Map backend orders to UI shape expected by OrdersPage
  return orders.map((o: any) => ({
    id: o.id,
    customer: o.customer_name,
    total: o.total_amount || o.balance || 0,
    status: o.status,
    paymentStatus: o.invoice_status || 'unbilled',
    eta: o.eta || o.created_at,
  }))
}

// Orders: single order
export async function fetchOrder(id: number | string) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch order')
  }

  return res.json()
}

export function fetchDemoWorkOrders() {
  return [
    { id: 'WO-501', orderId: 'ORD-23001', jobName: 'School Opening Banners', stage: 'Print', technician: 'Joseph', sla: '4h' },
    { id: 'WO-502', orderId: 'ORD-23002', jobName: 'Backdrop 4x3m', stage: 'Finishing', technician: 'Grace', sla: '2h' },
    { id: 'WO-503', orderId: 'ORD-23003', jobName: 'Polo Shirt Branding', stage: 'Design', technician: 'Peter', sla: '8h' }
  ];
}

export function fetchDemoMaterials() {
  return [
    { sku: 'VINYL-3M-GLOSS', name: '3m Glossy Vinyl', stockQty: 120, uom: 'm', category: 'Vinyl' },
    { sku: 'INK-CMYK-1L', name: 'Solvent Ink CMYK 1L Set', stockQty: 15, uom: 'set', category: 'Ink' },
    { sku: 'TSHIRT-M-BLACK', name: 'T-Shirt Black M', stockQty: 75, uom: 'pcs', category: 'Garments' }
  ];
}

export function fetchDemoInvoices() {
  return [
    { id: 'INV-2025-001', customer: 'Acme School', amount: 450.0, status: 'Partially Paid', dueDate: '2025-11-30' },
    { id: 'INV-2025-002', customer: 'Hope Church', amount: 320.0, status: 'Paid', dueDate: '2025-11-18' },
    { id: 'INV-2025-003', customer: 'Top Merch Ltd', amount: 1200.0, status: 'Unpaid', dueDate: '2025-12-05' }
  ];
}

export async function fetchFinancialOverview() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const now = new Date()
  const end = now.toISOString().slice(0, 10)
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 30)
  const start = startDate.toISOString().slice(0, 10)

  const res = await fetch(`${API_BASE}/reports/financial?start_date=${start}&end_date=${end}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch financial overview')
  }

  return res.json() as Promise<{ total_revenue: number; outstanding_amount: number }>
}

// Reports: inventory stock status
export async function fetchInventoryReport() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/reports/inventory`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch inventory report')
  }

  return res.json()
}

// Reports: production status counts
export async function fetchProductionReport() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/reports/production`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch production report')
  }

  return res.json()
}

export function fetchDemoCampaigns() {
  return [
    { id: 'CMP-BACK2SCHOOL', name: 'Back to School Banners', channel: 'Facebook/Instagram', budget: 500.0, status: 'Active' },
    { id: 'CMP-CHRISTMAS', name: 'Christmas Promo', channel: 'WhatsApp Broadcast', budget: 300.0, status: 'Planned' }
  ];
}

// Marketing: create campaign
export async function createCampaign(payload: { name: string; channel: string; budget: number }) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: payload.name,
      platform: payload.channel,
      budget: payload.budget,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as any).message || (data as any).error || 'Failed to create campaign')
  }

  return data
}

// Marketing: campaigns from backend
export async function fetchCampaigns() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/campaigns`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch campaigns')
  }

  return res.json()
}

// Marketing: single campaign by id
export async function fetchCampaign(id: number | string) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/campaigns/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch campaign')
  }

  return res.json()
}

// Production: create work order (owner/controller assigns work to a user)
export async function createWorkOrder(payload: { order_id: number | string; stage: string; assigned_to: number | string }) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/work-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create work order')
  }

  return data
}

export function fetchDemoConversations() {
  return [
    { id: 'CONV-IG-001', customer: 'Jane (IG)', channel: 'Instagram', subject: 'Polo branding', slaStatus: 'On Track' },
    { id: 'CONV-WA-002', customer: 'John (WA)', channel: 'WhatsApp', subject: 'Event backdrop', slaStatus: 'At Risk' }
  ];
}

// Communications: conversations from backend
export async function fetchConversations() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch conversations')
  }

  return res.json()
}

// Communications: messages for a conversation
export async function fetchConversationMessages(conversationId: number | string) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch messages')
  }

  return res.json()
}

// Communications: send message in a conversation
export async function sendConversationMessage(payload: { conversation_id: number | string; message: string; attachments?: any[] }) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to send message')
  }

  return data
}

// Marketing: campaign performance
export async function fetchCampaignPerformance(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/campaigns/${id}/performance`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch campaign performance')
  }

  return res.json()
}

// Finance: create POS sale
export async function createPOSSale(payload: { customer_id?: number | string; items: any[]; total: number }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/pos-sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to record POS sale')
  }

  return data
}

// Finance: POS sales history
export async function fetchPOSSales() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/pos-sales`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch POS sales')
  }
  return res.json()
}

// Auth: change password for current user
export async function changeUserPassword(id: number | string, currentPassword: string, newPassword: string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/auth/users/${id}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as any).error || (data as any).message || 'Failed to change password')
  }
  return data
}

// AI: demand predictions
export async function fetchDemandPredictions() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/predictions/demand`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch demand predictions')
  }

  return res.json()
}

// AI: reorder suggestions
export async function fetchReorderSuggestions() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/reorder-suggestions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch reorder suggestions')
  }

  return res.json()
}

// AI: customer insights
export async function fetchCustomerInsights() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/customer-insights`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch customer insights')
  }

  return res.json()
}

// AI: churn predictions
export async function fetchChurnPredictions() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/predictions/churn`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch churn predictions')
  }

  return res.json()
}

// AI: customer segment predictions
export async function fetchSegmentPredictions() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/predictions/segments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch customer segments')
  }

  return res.json()
}

// AI: pricing predictions
export async function fetchPricingPredictions() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/predictions/pricing`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch pricing predictions')
  }

  return res.json()
}

export function fetchDemoAiInsights() {
  return {
    demandForecast: [
      { category: 'Banners', month: '2025-12', expectedJobs: 42 },
      { category: 'Garments', month: '2025-12', expectedJobs: 28 },
      { category: 'Stickers', month: '2025-12', expectedJobs: 15 }
    ],
    priceRecommendations: [
      { item: '3m Banner Print', currentPrice: 45, suggestedPrice: 49, reason: 'High demand before holidays' },
      { item: 'T-Shirt Vinyl Print', currentPrice: 7, suggestedPrice: 6.5, reason: 'Price-sensitive segment' }
    ]
  };
}

// Admin: Users
export async function fetchUsers() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/auth/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch users')
  }

  return res.json()
}

// Admin: single user
export async function getUser(id: number | string) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/auth/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch user')
  }

  return res.json()
}

// Admin: single role
export async function getRole(id: number | string) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/roles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch role')
  }

  return res.json()
}

// Admin: Roles
export async function fetchRoles() {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch roles')
  }

  return res.json()
}
