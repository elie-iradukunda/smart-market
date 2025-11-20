// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDemoOrders } from '../../api/apiClient'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchDemoOrders()
      .then(data => {
        if (!isMounted) return
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load orders')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Orders</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Orders list</h1>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading orders...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">ID</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Customer</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Total</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-3 py-2 text-gray-800">{order.id}</td>
                    <td className="px-3 py-2 text-gray-800">{order.customer}</td>
                    <td className="px-3 py-2 text-gray-800">{order.total}</td>
                    <td className="px-3 py-2 text-gray-800">{order.status}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-xs text-gray-500">No orders found.</td>
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
