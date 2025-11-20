// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchJournalEntries } from '../../api/apiClient'

export default function JournalEntriesPage() {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchJournalEntries()
      .then((data) => {
        if (!isMounted) return
        setJournals(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load journal entries')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filtered = journals.filter((j: any) => {
    const term = (search || '').toLowerCase()
    if (!term) return true
    return (
      String(j.id).toLowerCase().includes(term) ||
      (j.description || '').toLowerCase().includes(term)
    )
  })

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Journal entries</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Double-entry postings behind invoices, payments, and adjustments. This view is mainly for accountants and
          auditors.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Entries</p>
          <input
            type="text"
            placeholder="Search by entry or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
        )}
        {loading ? (
          <p className="text-xs text-gray-500 py-4">Loading journal entries...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">Entry</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Date</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Description</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j: any) => (
                  <tr key={j.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{j.id}</td>
                    <td className="px-3 py-2 text-gray-800">{j.date}</td>
                    <td className="px-3 py-2 text-gray-800">{j.description}</td>
                    <td className="px-3 py-2 text-gray-800">{j.status}</td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-xs text-gray-500">No journal entries found.</td>
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
