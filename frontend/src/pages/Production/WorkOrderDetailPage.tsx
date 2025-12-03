// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tag, User, Calendar, CheckCircle, Loader2, AlertTriangle, Save, Clock, Package, ArrowLeft, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/utils/formatters'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  return localStorage.getItem('token')
}

export default function WorkOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workOrder, setWorkOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [quoteItems, setQuoteItems] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setLoading(true)
    setError(null)

    const token = getAuthToken()
    if (!token) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Fetch work order details
    fetch(`${API_BASE}/production/work-orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then((data) => {
        if (!isMounted) return
        setWorkOrder(data)

        // If this order has a quote, load the quote items
        if (data.quote_id) {
          fetch(`${API_BASE}/quotes/${data.quote_id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
            .then(res => res.json())
            .then((quoteData) => {
              if (!isMounted) return
              const items = Array.isArray(quoteData.items)
                ? quoteData.items.map((it: any) => ({
                  id: it.id,
                  material_id: it.material_id,
                  description: it.description,
                  quantity: Number(it.quantity || 0) || 0,
                  unit_price: Number(it.unit_price || 0) || 0,
                }))
                : []
              setQuoteItems(items)
            })
            .catch(() => {
              // ignore quote load error
            })
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load work order details')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const handleMarkComplete = async () => {
    if (!id || saving) return
    setSaving(true)
    setActionMessage('')
    setError(null)

    const token = getAuthToken()
    try {
      const res = await fetch(`${API_BASE}/production/orders/${workOrder.order_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'ready' }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      setWorkOrder({ ...workOrder, order_status: 'ready' })
      setActionMessage('Order marked as Ready for delivery!')
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : '';
    switch (s) {
      case 'design':
      case 'prepress':
      case 'print':
      case 'finishing':
      case 'qa':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-purple-500" />
          <p className="text-base text-gray-500">Loading work order details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !workOrder) {
    return (
      <DashboardLayout>
        <div className="p-8 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 inline mr-2" />
          Error: {error || 'Work order not found.'}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Card */}
        <div className="rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">
          <button
            onClick={() => navigate('/production/work-orders')}
            className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Work Orders
          </button>

          <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">
            <FileText className="inline h-4 w-4 mr-2" />
            Production Detail
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 flex flex-wrap items-center gap-2">
            Work Order
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">#{workOrder.id}</span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold border ml-3 ${getStatusColor(workOrder.order_status)}`}>
              {workOrder.order_status || 'Pending'}
            </span>
          </h1>
          <p className="mt-3 text-lg font-medium text-gray-800">
            Customer: {workOrder.customer_name || 'Unknown'}
          </p>

          {/* Key Info Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stage */}
            <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
              <Tag className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Stage</p>
                <p className="mt-0.5 text-base font-bold text-gray-900">{workOrder.stage || 'N/A'}</p>
              </div>
            </div>

            {/* Assigned To */}
            <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
              <User className="h-5 w-5 text-teal-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned To</p>
                <p className="mt-0.5 text-base font-bold text-gray-900">{workOrder.assigned_user_name || 'Production Team'}</p>
              </div>
            </div>

            {/* Order Number */}
            <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order Number</p>
                <p className="mt-0.5 text-base font-bold text-gray-900">#{workOrder.order_number}</p>
              </div>
            </div>
          </div>

          {/* Action Message */}
          {actionMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
              <CheckCircle className="h-5 w-5 inline mr-2" />
              {actionMessage}
            </div>
          )}

          {/* Mark Complete Button */}
          {workOrder.order_status !== 'ready' && workOrder.order_status !== 'delivered' && (
            <div className="mt-6">
              <button
                onClick={handleMarkComplete}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Mark as Ready for Delivery
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Materials Section */}
        {quoteItems.length > 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <Package className="inline h-5 w-5 mr-2 text-purple-600" />
              Materials for this Job
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              These materials were specified in the approved quote. Stock was reserved when the quote was approved.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-purple-50 border-b border-purple-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-purple-700">Description</th>
                    <th className="px-4 py-3 text-right font-semibold text-purple-700">Planned Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-purple-700">Unit Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-purple-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quoteItems.map((row, index) => (
                    <tr key={row.id || index} className="hover:bg-purple-50/30">
                      <td className="px-4 py-3 text-gray-900">{row.description}</td>
                      <td className="px-4 py-3 text-right text-gray-800">{row.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-700 font-mono">{formatCurrency(row.unit_price)}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold font-mono">{formatCurrency(row.quantity * row.unit_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Work Order Notes */}
        {workOrder.notes && (
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              <FileText className="inline h-5 w-5 mr-2 text-purple-600" />
              Notes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{workOrder.notes}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}