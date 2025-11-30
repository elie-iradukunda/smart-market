// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchCustomers } from '@/api/apiClient'

export default function CustomersPage() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchCustomers()
      .then((data) => {
        if (!isMounted) return
        setCustomers(data || [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load customers')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleView = (id: number | string) => {
    navigate(`/crm/customers/${id}`)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">CRM</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Directory</span>
            </h1>
            <p className="mt-3 text-base text-gray-600 max-w-xl">
              View all customers in the system and drill into AI-powered insights for each profile.
            </p>
          </div>

          {/* Customers table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">All customers</h2>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>
            )}

            {loading ? (
              <p className="text-sm text-gray-500 py-4">Loading customers...</p>
            ) : customers.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No customers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-indigo-50/80 border-b border-indigo-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-indigo-700 uppercase tracking-wider text-xs">ID</th>
                      <th className="px-4 py-2 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Name</th>
                      <th className="px-4 py-2 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Phone</th>
                      <th className="px-4 py-2 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Email</th>
                      <th className="px-4 py-2 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Source</th>
                      <th className="px-4 py-2 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2 text-xs text-slate-500">{c.id}</td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900">{c.name}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{c.phone || '-'}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{c.email || '-'}</td>
                        <td className="px-4 py-2 text-xs text-slate-500 uppercase tracking-wide">{c.source || '-'}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => handleView(c.id)}
                            className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            View details
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
      </div>
    </DashboardLayout>
  )
}
