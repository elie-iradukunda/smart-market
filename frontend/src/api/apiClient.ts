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
  city: string;
  country: string;
  tax_id: string;
  payment_terms: string;
  bank_name: string;
  bank_account: string;
  rating: number;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE = 'http://localhost:3000/api'

// ============================================================================
// BOM Templates API
// ============================================================================

export async function fetchBomTemplates() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/bom-templates`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch BOM templates')
  }

  return res.json()
}

export async function fetchBomTemplate(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/bom-templates/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch BOM template')
  }

  return res.json()
}

export async function createBomTemplate(payload: { code: string; name: string; description?: string; items?: Array<{ material_id: number; quantity: number }> }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/bom-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create BOM template')
  }

  return data
}

export async function updateBomTemplate(id: number | string, payload: { code?: string; name?: string; description?: string; items?: Array<{ material_id: number; quantity: number }> }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/bom-templates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update BOM template')
  }

  return data
}

export async function deleteBomTemplate(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/bom-templates/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete BOM template')
  }

  return data
}

// ============================================================================
// Dashboard Stats APIs
// ============================================================================

export async function fetchDashboardStats() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const [ordersRes, workOrdersRes, materialsRes, invoicesRes] = await Promise.all([
    fetch(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${API_BASE}/work-orders`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${API_BASE}/materials`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${API_BASE}/invoices`, { headers: { Authorization: `Bearer ${token}` } }),
  ])

  const orders = ordersRes.ok ? await ordersRes.json() : []
  const workOrders = workOrdersRes.ok ? await workOrdersRes.json() : []
  const materialsData = materialsRes.ok ? await materialsRes.json() : { data: [] }
  const invoices = invoicesRes.ok ? await invoicesRes.json() : []

  const materials = materialsData.data || materialsData || []

  const activeOrders = orders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length
  const pendingWorkOrders = workOrders.filter((w: any) => w.status !== 'completed').length
  const lowStockItems = materials.filter((m: any) => m.current_stock <= (m.reorder_level || 10)).length
  const unpaidInvoices = invoices.filter((i: any) => i.status !== 'paid').length
  const totalRevenue = invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + (i.total || 0), 0)

  return {
    activeOrders,
    pendingWorkOrders,
    lowStockItems,
    unpaidInvoices,
    totalRevenue,
    ordersCount: orders.length,
    workOrdersCount: workOrders.length,
    materialsCount: materials.length,
  }
}

// CRM: leads list (used by LeadsPage)
export async function fetchLeads(page = 1, limit = 50) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_BASE}/leads?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch leads')
  }

  const response = await res.json()

  // Handle both old array format (if backend rollback) and new object format
  const leadsData = Array.isArray(response) ? response : (response.leads || response.data || [])
  const pagination = response.pagination || null

  const mappedLeads = leadsData.map((lead: any) => ({
    id: `L-${lead.id}`,
    rawId: lead.id,
    customer_name: lead.customer_name || 'Unknown',
    name: lead.customer_name || 'Unknown',
    company: lead.company || null,
    channel: lead.channel,
    status: lead.status || 'New',
    owner: lead.owner_name || 'Unassigned',
    created_at: lead.created_at,
    customer_email: lead.customer_email,
    customer_phone: lead.customer_phone,
  }))

  return { leads: mappedLeads, pagination }
}

// Alias for backward compatibility
export const fetchDemoLeads = fetchLeads

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
export async function fetchOrders() {
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
    if (res.status === 403) {
      const errorMsg = data.error || data.message || 'Insufficient permissions'
      // Provide more helpful error message
      if (errorMsg.toLowerCase().includes('permission') || errorMsg.toLowerCase().includes('forbidden')) {
        throw new Error(`Insufficient permissions. ${data.required ? `Required: ${data.required}. ` : ''}Please log out and log back in to refresh your session.`)
      }
      throw new Error(errorMsg)
    }
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

// Alias for backward compatibility
export const fetchDemoOrders = fetchOrders

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

// Deprecated: Use fetchWorkOrders instead (already defined above)
export const fetchDemoWorkOrders = fetchWorkOrders

// Deprecated: Use fetchMaterials instead (already defined above)
export const fetchDemoMaterials = fetchMaterials

// Deprecated: Use fetchInvoices instead (already defined above)
export const fetchDemoInvoices = fetchInvoices

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

// Deprecated: Use fetchCampaigns instead (already defined above)
export const fetchDemoCampaigns = fetchCampaigns

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

// Alias for backward compatibility
export const fetchDemoConversations = fetchConversations

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

// AI insights now fetched from real APIs: fetchDemandPredictions, fetchPricingPredictions, etc.

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

// ============================================================================
// MISSING API FUNCTIONS - Added for complete backend coverage
// ============================================================================

// CRM: delete customer
export async function deleteCustomer(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete customer')
  }

  return data
}

// CRM: delete lead
export async function deleteLead(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete lead')
  }

  return data
}

// CRM: update quote
export async function updateQuote(id: number | string, payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/quotes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update quote')
  }

  return data
}

// Production: fetch work orders from backend
export async function fetchWorkOrders() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/work-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch work orders')
  }

  return res.json()
}

// Production: fetch single work order
export async function fetchWorkOrder(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/work-orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch work order')
  }

  return res.json()
}

// Production: update work order
export async function updateWorkOrder(id: number | string, payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/work-orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update work order')
  }

  return data
}

// Production: create work log
export async function createWorkLog(payload: { work_order_id: number | string; user_id: number | string; hours: number; notes?: string }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/work-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create work log')
  }

  return data
}

// Production: fetch work logs
export async function fetchWorkLogs() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/work-logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch work logs')
  }

  return res.json()
}

// Finance: update invoice
export async function updateInvoice(id: number | string, payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/invoices/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update invoice')
  }

  return data
}

// Finance: refund payment
export async function refundPayment(paymentId: number | string, reason?: string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/payments/${paymentId}/refund`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to refund payment')
  }

  return data
}

// Finance: fetch single payment
export async function fetchPayment(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/payments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch payment')
  }

  return res.json()
}

// Finance: fetch chart of accounts
export async function fetchChartOfAccounts() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/chart-of-accounts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch chart of accounts')
  }

  return res.json()
}

// Finance: fetch single journal entry
export async function fetchJournalEntry(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/journal-entries/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch journal entry')
  }

  return res.json()
}

// Marketing: broadcast to all customers
export async function broadcastToAllCustomers(payload: { subject: string; message: string; channel?: string }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/broadcast/all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to broadcast message')
  }

  return data
}

// Marketing: broadcast to segment
export async function broadcastToSegment(payload: { segment: string; subject: string; message: string; channel?: string }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/broadcast/segment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to broadcast to segment')
  }

  return data
}

// Communication: send email
export async function sendEmail(payload: { to: string; subject: string; body: string }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to send email')
  }

  return data
}

// Admin: create permission
export async function createPermission(payload: { code: string; description?: string }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create permission')
  }

  return data
}

// Admin: update permission
export async function updatePermission(id: number | string, payload: { code?: string; description?: string }) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/permissions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update permission')
  }

  return data
}

// Admin: delete permission
export async function deletePermission(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/permissions/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete permission')
  }

  return data
}

// Admin: fetch all role permissions
export async function fetchAllRolePermissions() {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/role-permissions`, {
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

// Admin: delete role permission
export async function deleteRolePermission(roleId: number | string, permissionId: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/roles/${roleId}/permissions/${permissionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete role permission')
  }

  return data
}

// Upload: upload artwork file
export async function uploadArtwork(file: File, quoteId?: number | string, orderId?: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('artwork', file)
  if (quoteId) formData.append('quote_id', String(quoteId))
  if (orderId) formData.append('order_id', String(orderId))

  const res = await fetch(`${API_BASE}/upload/artwork`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to upload artwork')
  }

  return data
}

// Upload: get file by ID
export async function getFile(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/files/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch file')
  }

  return res.blob()
}

// Reports: fetch sales report
export async function fetchSalesReport(startDate?: string, endDate?: string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  let url = `${API_BASE}/reports/sales`
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch sales report')
  }

  return res.json()
}

// Reports: fetch financial report
export async function fetchFinancialReport(startDate?: string, endDate?: string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  let url = `${API_BASE}/reports/financial`
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch financial report')
  }

  return res.json()
}

// ============================================================================
// Product Management APIs (E-commerce)
// ============================================================================

export async function fetchProducts() {
  const token = getAuthToken()
  console.log('fetchProducts - token:', token ? 'EXISTS' : 'MISSING')
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}/products`, { headers })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch products')
  }
  return res.json()
}

export async function fetchProduct(id: number | string) {
  const token = getAuthToken()
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}/products/${id}`, { headers })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Failed to fetch product')
  }
  return res.json()
}

export async function createProduct(payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to create product')
  }
  return data
}

export async function updateProduct(id: number | string, payload: any) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update product')
  }
  return data
}

export async function deleteProduct(id: number | string) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to delete product')
  }
  return data
}

// Upload product image
export async function uploadProductImage(file: File) {
  const token = getAuthToken()
  if (!token) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_BASE}/upload/product-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to upload image')
  }
  return data
}
