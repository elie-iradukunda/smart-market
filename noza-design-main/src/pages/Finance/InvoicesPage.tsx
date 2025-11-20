// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchInvoices } from '../../api/apiClient'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchInvoices()
      .then((data) => {
        if (!isMounted) return
        setInvoices(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load invoices')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const openCount = invoices.filter((i: any) => (i.status || '').toLowerCase() !== 'paid').length
  const filtered = invoices.filter((inv: any) => {
    const matchesStatus =
      statusFilter === 'All' ||
      (inv.status || '').toLowerCase() === statusFilter.toLowerCase()
    const term = (search || '').toLowerCase()
    const matchesSearch =
      !term ||
      (inv.customer_name || '').toLowerCase().includes(term) ||
      String(inv.id).toLowerCase().includes(term)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Invoices</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Accounts receivable for TOP Design customers. See which customers owe money and how much is overdue.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Open invoices</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{openCount}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Total invoices</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{invoices.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Overdue</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">2</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <p className="text-sm font-medium text-gray-900">Invoice list</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
            </select>
            <input
              type="text"
              placeholder="Search by customer or invoice"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-xs text-gray-500 py-4">Loading invoices...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">Invoice</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Customer</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Amount</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Order</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv: any) => (
                  <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{inv.id}</td>
                    <td className="px-3 py-2 text-gray-800">{inv.customer_name}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${inv.amount}</td>
                    <td className="px-3 py-2 text-gray-800">{inv.status}</td>
                    <td className="px-3 py-2 text-gray-800">{inv.order_number}</td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-xs text-gray-500">No invoices found.</td>
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
