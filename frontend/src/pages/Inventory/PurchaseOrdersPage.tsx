// @ts-nocheck
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import { fetchPurchaseOrders } from '../../api/apiClient'
import { getAuthUser } from '@/utils/apiClient'
import { ShoppingCart, Search, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchPurchaseOrders()
      .then((data) => {
        if (!isMounted) return
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load purchase orders')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filtered = orders.filter((po: any) => {
    const term = (search || '').toLowerCase()
    if (!term) return true
    return (
      String(po.id).toLowerCase().includes(term) ||
      (po.supplier_name || '').toLowerCase().includes(term)
    )
  })

  // Helper for status badges
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'received':
      case 'completed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><CheckCircle size={10} /> {status}</span>
      case 'pending':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"><Clock size={10} /> {status}</span>
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"><XCircle size={10} /> {status}</span>
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{status}</span>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 mb-2">
                Procurement
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="mt-2 text-gray-500 max-w-xl">
                Track incoming stock from your key suppliers.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search POs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 w-full md:w-64"
                />
              </div>
              <button
                type="button"
                onClick={() => navigate('/inventory/purchase-orders/new')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 transition-all"
              >
                <Plus size={18} />
                New PO
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-500">Loading purchase orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">PO #</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Supplier</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Total</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">ETA</th>
                    <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((po: any) => (
                    <tr
                      key={po.id}
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/inventory/purchase-orders/${po.id}`)}
                    >
                      <td className="px-6 py-4 text-gray-900 font-mono text-xs font-medium">#{po.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{po.supplier_name}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">${po.total}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(po.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{po.eta || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <ShoppingCart className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-sm font-medium">No purchase orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
