// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchOrder, updateOrderStatus } from '../../api/apiClient'

export default function WorkOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

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
        setError(err.message || 'Failed to load work order')
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
    return <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"><p className="text-sm text-gray-600">Loading work order...</p></div>
  }

  if (error || !order) {
    return <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"><p className="text-sm text-red-600">{error || 'Work order not found'}</p></div>
  }

  const workOrder = {
    id: order.id,
    orderId: order.id,
    jobName: `Order for ${order.customer_name}`,
    stage: order.status,
    technician: 'Production team',
    sla: '—',
    status: order.status,
    material: '—',
    materialUsed: '—',
    dueDate: order.eta || order.created_at,
  }

  const handleMarkComplete = async () => {
    if (!id || saving) return
    setSaving(true)
    setActionMessage('')
    setError(null)

    try {
      await updateOrderStatus(id, 'complete')
      setOrder({ ...order, status: 'complete' })
      setActionMessage('Order marked as complete.')
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  // Helper function to color the status tag
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">Production</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
          Work Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{workOrder.id}</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          **{workOrder.jobName}** linked to **{workOrder.orderId}**
        </p>

        {/* Key Status Indicators */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {/* Status */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
            <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${getStatusColor(workOrder.status)}`}>
              {workOrder.status}
            </span>
          </div>

          {/* Stage */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Stage</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{workOrder.stage}</p>
          </div>

          {/* Technician */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned To</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{workOrder.technician}</p>
          </div>

          {/* SLA/Due Date */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Due In</p>
            <p className="mt-1 text-lg font-bold text-red-600">{workOrder.sla}</p>
          </div>
        </div>
      </div>

      {/* Production Details Section */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">

        {/* Materials Card */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Material Requirements</h2>
          <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-blue-50/50">
            <p className="text-sm font-medium text-gray-700">Required Material:</p>
            <p className="text-lg font-bold text-gray-900">{workOrder.material}</p>
            <p className="mt-2 text-sm text-gray-600">Material Used: <span className="font-semibold text-blue-700">{workOrder.materialUsed}</span></p>
          </div>

          <p className="text-sm text-gray-500 pt-2">
            **Note:** This work order requires 25m of matte vinyl. Verify stock before beginning the print run.
          </p>
        </div>

        {/* Actions Card */}
        <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Work Order Actions</h2>
          {actionMessage && <p className="text-xs text-emerald-700">{actionMessage}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-green-700 transition duration-150 disabled:opacity-60"
            onClick={handleMarkComplete}
            disabled={saving}
          >
            Mark as Complete
          </button>

          <button className="w-full rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition duration-150">
            Pause Production
          </button>
          <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150">
            Reassign Technician
          </button>
        </div>
      </div>
    </div>
  )
}