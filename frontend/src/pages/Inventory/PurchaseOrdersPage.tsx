// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPurchaseOrders } from '../../api/apiClient'

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

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Inventory</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Purchase orders</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Track incoming stock from your key suppliers.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Purchase orders</p>
          <div className="flex w-full sm:w-auto gap-2">
            <input
              type="text"
              placeholder="Search by PO or supplier"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => navigate('/inventory/purchase-orders/new')}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              + New PO
            </button>
          </div>
        </div>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading purchase orders...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">PO</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Supplier</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                  <th className="px-3 py-2 font-medium text-gray-700">ETA</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((po: any) => (
                  <tr
                    key={po.id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/inventory/purchase-orders/${po.id}`)}
                  >
                    <td className="px-3 py-2 text-gray-800">{po.id}</td>
                    <td className="px-3 py-2 text-gray-800">{po.supplier_name}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${po.total}</td>
                    <td className="px-3 py-2 text-gray-800">{po.status}</td>
                    <td className="px-3 py-2 text-gray-800">{po.eta || '-'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-xs text-gray-500">No purchase orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
