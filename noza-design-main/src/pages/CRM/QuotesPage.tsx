// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchQuotes } from '../../api/apiClient'

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchQuotes()
      .then((data) => {
        if (!isMounted) return
        setQuotes(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load quotes')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredQuotes = quotes.filter((q: any) => {
    const term = (search || '').toLowerCase()
    if (!term) return true
    return (
      String(q.id).toLowerCase().includes(term) ||
      (q.customer_name || q.customer || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">CRM</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Quotes</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Track quotes issued to customers and their current status.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Quotes</p>
          <input
            type="text"
            placeholder="Search by quote or customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading quotes...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">Quote</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Customer</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Value</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q: any) => (
                  <tr key={q.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{q.id}</td>
                    <td className="px-3 py-2 text-gray-800">{q.customer_name || q.customer}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${q.total || q.value}</td>
                    <td className="px-3 py-2 text-gray-800">{q.status}</td>
                  </tr>
                ))}
                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-xs text-gray-500">No quotes found.</td>
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
