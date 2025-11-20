// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchOrder } from '../../api/apiClient'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const stages = ['Design', 'Pre-Press', 'Print', 'Finishing', 'QA', 'Ready', 'Delivered']

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchOrder(id)
      .then((data) => {
        if (!isMounted) return
        setOrder(data)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load order')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return <div className="px-4 py-6 sm:px-6 lg:px-8"><p className="text-sm text-gray-600">Loading order...</p></div>
  }

  if (error || !order) {
    return <div className="px-4 py-6 sm:px-6 lg:px-8"><p className="text-sm text-red-600">{error || 'Order not found'}</p></div>
  }

  const total = order.total_amount || order.balance || 0
  const depositPaid = total / 2
  const balanceDue = total - depositPaid

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Order</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{order.id}</h1>
          <p className="mt-2 text-sm text-gray-600">{order.customer_name} • Order #{order.id}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{order.status}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">ETA</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{order.eta}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 text-sm">
        <div className="grid gap-3 md:grid-cols-[2fr,1.2fr] items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Production stages</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {stages.map(stage => (
                <span
                  key={stage}
                  className={
                    'rounded-full px-3 py-1 text-xs border ' +
                    (stage === (order.currentStage || order.status)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200')
                  }
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Billing</p>
            <p className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Deposit paid (approx.)</span>
              <span className="font-semibold text-gray-900">${depositPaid.toFixed(2)}</span>
            </p>
            <p className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Balance due</span>
              <span className="font-semibold text-gray-900">${balanceDue.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
