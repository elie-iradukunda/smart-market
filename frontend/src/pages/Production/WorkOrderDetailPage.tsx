// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tag, User, Calendar, CheckCircle, Loader2, AlertTriangle, Save, Clock, Package, ArrowLeft, FileText, Mail, Phone, MapPin } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/utils/formatters'
import { getAuthUser } from '@/utils/apiClient'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const getAuthToken = () => {
  return localStorage.getItem('auth_token')
}

export default function WorkOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = getAuthUser()
  const isAdmin = currentUser?.role_id === 1 || currentUser?.role_id === 2
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
    fetch(`${API_BASE}/work-orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then((data) => {
        if (!isMounted) return
        console.log('Work Order Fetched:', data)
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

  const stages = ['Design', 'Print', 'Finish', 'Ready', 'Delivered']
  const stageStatusCodes = ['design', 'print', 'finish', 'ready', 'delivered']

  const handleAdvanceStage = async () => {
    if (!workOrder) return
    const statusCode = (workOrder.order_status || '').toLowerCase()
    const currentStageIndex = Math.max(stageStatusCodes.indexOf(statusCode), 0)

    if (currentStageIndex >= stageStatusCodes.length - 1) return

    const nextStatus = stageStatusCodes[currentStageIndex + 1]
    setSaving(true)
    setError(null)

    const token = getAuthToken()
    try {
      // Use order_number (e.g. CD-1) to ensure backend identifies Custom Design orders correctly
      const orderIdToUpdate = workOrder.order_number || workOrder.order_id || workOrder.custom_design_order_id
      if (!orderIdToUpdate) {
        throw new Error('No order ID found')
      }

      const res = await fetch(`${API_BASE}/orders/${orderIdToUpdate}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('Backend error response:', data)
        if (data.debug) {
          console.error('Debug info:', data.debug)
        }
        throw new Error(data.error || data.message || 'Failed to update status')
      }

      setWorkOrder({ ...workOrder, order_status: nextStatus, stage: nextStatus })
      setActionMessage(`Status updated to ${nextStatus}`)
    } catch (err: any) {
      console.error('Update status error:', err)
      setError(err.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!id || saving) return
    setSaving(true)
    setActionMessage('')
    setError(null)

    const token = getAuthToken()
    try {
      // If it's a custom design, use order_number (e.g. CD-1)
      // If it's a standard order, use order_id from database
      const orderIdToUpdate = workOrder.is_custom_design
        ? workOrder.order_number
        : (workOrder.order_id || workOrder.id);

      const res = await fetch(`${API_BASE}/orders/${orderIdToUpdate}/status`, {
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
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-500" />
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
        <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-xl">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Work Orders
          </button>

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            <FileText className="inline h-4 w-4 mr-2" />
            Production Detail
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 flex flex-wrap items-center gap-2">
            {workOrder.product_type || workOrder.product_name || 'Work Order'}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">#{workOrder.id}</span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold border ml-3 ${getStatusColor(workOrder.order_status)}`}>
              {workOrder.order_status || 'Pending'}
            </span>
          </h1>
          <div className="mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Customer</p>
                <p className="text-lg font-bold text-gray-900">{workOrder.customer_name || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {workOrder.customer_email && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <Mail className="w-4 h-4 text-blue-400" />
                  {workOrder.customer_email}
                </div>
              )}
              {workOrder.customer_phone && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <Phone className="w-4 h-4 text-blue-400" />
                  {workOrder.customer_phone}
                </div>
              )}
              {workOrder.customer_address && (
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {workOrder.customer_address}
                </div>
              )}
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stage */}
            <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
              <Tag className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Stage</p>
                <p className="mt-0.5 text-base font-bold text-gray-900">{workOrder.stage || 'N/A'}</p>
              </div>
            </div>

            {/* Assigned To */}
            <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
              <User className="h-5 w-5 text-cyan-600" />
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

            {/* Main Status */}
            <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 shadow-sm">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Business Status</p>
                <p className="mt-0.5 text-base font-bold text-gray-900 capitalize">{workOrder.main_status || 'Pending'}</p>
              </div>
            </div>
          </div>

          {/* Production Timeline */}
          <div className="mt-6 bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <p className="text-lg font-bold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Production Timeline
              </p>
              {(() => {
                const statusCode = (workOrder.stage || workOrder.order_status || '').toLowerCase()
                const currentStageIndex = Math.max(stageStatusCodes.indexOf(statusCode), 0)
                const isAtReady = statusCode === 'ready'
                const isCompleted = currentStageIndex >= stages.length - 1

                // Permission check: Admin or Assigned Staff
                const isAssigned = workOrder.assigned_to && Number(workOrder.assigned_to) === Number(currentUser?.id)
                const hasPermission = isAdmin || isAssigned

                const canAdvance = isCompleted ? false : (isAtReady ? isAdmin : hasPermission)

                return (
                  <button
                    type="button"
                    onClick={handleAdvanceStage}
                    disabled={!canAdvance || saving}
                    className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${canAdvance ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
                    title={!hasPermission ? 'Only assigned staff or admin can update status' : (isAtReady && !isAdmin ? 'Only admin can mark as Delivered' : '')}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      isCompleted ? 'Completed' : isAtReady ? 'Mark as Delivered' : 'Mark Next Step Done'
                    )}
                  </button>
                )
              })()}
            </div>

            {actionMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {actionMessage}
              </div>
            )}

            <ol className="relative border-l border-blue-200 space-y-8 ml-3">
              {stages.map((stage, index) => {
                const statusCode = (workOrder.order_status || '').toLowerCase()
                const currentStageIndex = Math.max(stageStatusCodes.indexOf(statusCode), 0)
                const isCompleted = index < currentStageIndex
                const isActive = index === currentStageIndex

                return (
                  <li key={stage} className={`ml-6 ${isCompleted ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-60'}`}>
                    <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}>
                      {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                    </span>
                    <h3 className={`font-semibold ${isCompleted ? 'text-gray-700' : isActive ? 'text-blue-600 text-lg' : 'text-gray-400'}`}>
                      {stage}
                      {isActive && <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">CURRENT</span>}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{isCompleted ? 'Completed' : isActive ? 'In progress' : 'Upcoming'}</p>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Job Instructions / Custom Design Details */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Job Instructions
              </h3>
            </div>
            <div className="p-6">
              {workOrder.is_custom_design ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
                      <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Product</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">{workOrder.product_type}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
                      <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Dimensions</p>
                      <p className="text-sm font-bold text-gray-900">{workOrder.width}m × {workOrder.height}m</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center">
                      <p className="text-[10px] text-amber-600 font-bold uppercase mb-1">Quantity</p>
                      <p className="text-sm font-bold text-gray-900">{workOrder.custom_quantity || 1}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 text-center">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase mb-1">Spec</p>
                      <p className="text-[10px] font-bold text-gray-900">
                        {workOrder.paper_type || 'Std'}<br />
                        {workOrder.finish_type || 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Design Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Typography & Content */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Typography & Content</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Text Content</span>
                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{workOrder.text_content || 'No specific text content provided'}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Font Style</span>
                            <p className="text-sm font-bold text-gray-900">{workOrder.font_style || 'Standard'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Size</span>
                            <p className="text-sm font-bold text-gray-900">{workOrder.font_size ? `${workOrder.font_size}px` : 'Standard'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Colors & Usage */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Colors & Usage</h4>
                      <div className="space-y-4">
                        <div className="flex gap-6">
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Background</span>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg shadow-sm border border-gray-200" style={{ backgroundColor: workOrder.bg_color || '#ffffff' }}></div>
                              <span className="text-xs font-mono font-medium">{workOrder.bg_color || 'N/A'}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Text Color</span>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg shadow-sm border border-gray-200" style={{ backgroundColor: workOrder.text_color || '#000000' }}></div>
                              <span className="text-xs font-mono font-medium">{workOrder.text_color || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        {workOrder.usage_description && (
                          <div>
                            <span className="text-xs text-gray-500 block mb-1">Usage Context</span>
                            <p className="text-sm font-medium text-gray-900 italic">"{workOrder.usage_description}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Requirements</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {workOrder.requirements || 'No specific instructions provided.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {workOrder.instructions ? (
                    <p className="text-sm text-gray-600 italic">"{workOrder.instructions}"</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No specific instructions provided.</p>
                  )}

                  {workOrder.items && workOrder.items.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Ordered Items</p>
                      <div className="space-y-2">
                        {workOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                            <span className="text-sm font-medium text-gray-700">{item.description}</span>
                            <span className="text-xs font-bold px-2 py-1 bg-white rounded-md border border-gray-200">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Action Message */}
          {actionMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
              <CheckCircle className="h-5 w-5 inline mr-2" />
              {actionMessage}
            </div>
          )}

          {/* Mark Complete Button (Admin or Assigned Staff) */}
          {(isAdmin || (workOrder.assigned_to && Number(workOrder.assigned_to) === Number(currentUser?.id))) &&
            workOrder.order_status !== 'ready' && workOrder.order_status !== 'delivered' && (
              <div className="mt-6">
                <button
                  onClick={handleMarkComplete}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
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
              <Package className="inline h-5 w-5 mr-2 text-blue-600" />
              Materials for this Job
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              These materials were specified in the approved quote. Stock was reserved when the quote was approved.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-50 border-b border-blue-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-blue-700">Description</th>
                    <th className="px-4 py-3 text-right font-semibold text-blue-700">Planned Qty</th>
                    <th className="px-4 py-3 text-right font-semibold text-blue-700">Unit Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-blue-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quoteItems.map((row, index) => (
                    <tr key={row.id || index} className="hover:bg-blue-50/30">
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
              <FileText className="inline h-5 w-5 mr-2 text-blue-600" />
              Notes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{workOrder.notes}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}