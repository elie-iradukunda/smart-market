// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchPayments } from '../../api/apiClient'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [methodFilter, setMethodFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchPayments()
      .then((data) => {
        if (!isMounted) return
        setPayments(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load payments')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filtered = payments.filter((p: any) => {
    const matchesMethod =
      methodFilter === 'All' ||
      (p.method || '').toLowerCase() === methodFilter.toLowerCase()
    const matchesDate = !dateFilter || (p.created_at || '').startsWith(dateFilter)
    return matchesMethod && matchesDate
  })

  const totalReceived = filtered.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Payments</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Recorded payments from cash, mobile money, and bank. Use this view to reconcile invoices with money
          received.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Transactions</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{filtered.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Total received</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">${totalReceived}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Payment methods</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">3</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <p className="text-sm font-medium text-gray-900">Payment list</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All methods</option>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank">Bank</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
          )}
          {loading ? (
            <p className="text-xs text-gray-500 py-4">Loading payments...</p>
          ) : (
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">Payment</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Invoice</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Method</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Amount</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pmt: any) => (
                  <tr key={pmt.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{pmt.id}</td>
                    <td className="px-3 py-2 text-gray-800">{pmt.invoice_number}</td>
                    <td className="px-3 py-2 text-gray-800">{pmt.method}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${pmt.amount}</td>
                    <td className="px-3 py-2 text-gray-800">{(pmt.created_at || '').slice(0, 10)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-xs text-gray-500">No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
