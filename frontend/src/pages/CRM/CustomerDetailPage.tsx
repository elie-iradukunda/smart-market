// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCustomer } from '../../api/apiClient'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchCustomer(id)
      .then((data) => {
        if (!isMounted) return
        setCustomer(data)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load customer')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Customer</p>
          {loading ? (
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-500">Loading...</h1>
          ) : error ? (
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-red-600">{error}</h1>
          ) : customer ? (
            <>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{customer.name}</h1>
              <p className="mt-2 text-sm text-gray-600">{customer.segment || 'Customer'}{customer.source ? ` • ${customer.source}` : ''}</p>
            </>
          ) : (
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-500">Customer not found</h1>
          )}
        </div>
        {!loading && customer && (
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <p className="text-gray-500">Phone</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{customer.phone || '-'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <p className="text-gray-500">Email</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{customer.email || '-'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <p className="text-gray-500">Address</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{customer.address || '-'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
              <p className="text-gray-500">Source</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{customer.source || '-'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
