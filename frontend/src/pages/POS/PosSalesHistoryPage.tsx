// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchPOSSales } from '../../api/apiClient'

export default function PosSalesHistoryPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchPOSSales()
      .then((data) => {
        if (!isMounted) return
        // Map backend shape to UI shape
        const mapped = (data || []).map((s) => {
          const dt = new Date(s.created_at)
          return {
            id: `POS-${s.id}`,
            customer: s.customer_name || 'Walk-in',
            total: Number(s.total) || 0,
            paymentMethod: 'Cash', // backend currently doesn’t store method; default label
            date: dt.toISOString().slice(0, 10),
            time: dt.toTimeString().slice(0, 5),
          }
        })
        setSales(mapped)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load POS sales history')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Helper function to dynamically color payment methods
  const getPaymentColor = (method) => {
    switch (method) {
      case 'Cash':
        return 'bg-green-100 text-green-800';
      case 'Mobile Money':
        return 'bg-blue-100 text-blue-800';
      case 'Bank Card':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Point of Sale</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Sales <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-green-600">History</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          Recent counter transactions for reconciliation and daily closing. Filter by payment method and date.
        </p>
      </div>

      {/* Transactions Table Card - Applying the clean aesthetic */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <p className="text-lg font-semibold text-gray-900">Recent Transactions</p>

          {/* Filters and Search - Enhanced for clarity and style */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <select className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150">
              <option>All payment methods</option>
              <option>Cash</option>
              <option>Mobile Money</option>
              <option>Bank Card</option>
              <option>Bank Transfer</option>
            </select>
            <input
              type="date"
              value="2025-11-18"
              // Professional input styling
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading POS sales...</p>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  {/* Table Headers - Increased padding and clearer typography */}
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-blue-50/50 transition duration-150 cursor-pointer">
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{sale.id}</td>
                    <td className="px-6 py-3 text-gray-800 font-medium">{sale.customer}</td>
                    <td className="px-6 py-3">
                      {/* Payment Method Tag - Dynamically colored tag */}
                      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium border border-transparent ${getPaymentColor(sale.paymentMethod)}`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900 font-bold">${sale.total.toFixed(2)}</td>
                    <td className="px-6 py-3 text-gray-600 font-medium">
                      {sale.date} <span className="text-xs text-gray-400">({sale.time})</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button className="text-sm font-medium text-teal-600 hover:text-teal-800">
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}