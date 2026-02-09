// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { fetchOrder, createInvoice, recordPayment, updateOrderStatus } from '../../api/apiClient'
import { getAuthToken } from '@/utils/apiClient'

import { CheckCircle, Clock, DollarSign, Package, Truck, User, MessageCircle, Phone, Mail, MapPin, FileText, Wrench, ArrowLeft } from 'lucide-react'
import { getAuthUser } from '@/utils/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/utils/formatters'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [workOrders, setWorkOrders] = useState([])
  const [quoteItems, setQuoteItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invoiceId, setInvoiceId] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentReference, setPaymentReference] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)

  const stages = ['Design', 'Print', 'Finish', 'Ready', 'Delivered']
  const stageStatusCodes = ['design', 'print', 'finish', 'ready', 'delivered']

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setLoading(true)
    setError(null)

    const token = getAuthToken()

    // Fetch order details
    fetchOrder(id)
      .then(async (data) => {
        if (!isMounted) return
        setOrder(data)

        // Fetch work orders for this order (Only for Staff - Exclude Clients/Customers)
        const currentUser = getAuthUser();
        const isClient = [4, 13].includes(Number(currentUser?.role_id));

        if (token && !isClient) {
          try {
            const woRes = await fetch(`${API_BASE}/work-orders?order_id=${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (woRes.ok) {
              const woData = await woRes.json()
              setWorkOrders(Array.isArray(woData) ? woData : [])
            }
          } catch (err) {
            console.warn('Failed to load work orders:', err)
          }
        }

        // Fetch quote items if quote_id exists
        if (data.quote_id && token) {
          try {
            const quoteRes = await fetch(`${API_BASE}/quotes/${data.quote_id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (quoteRes.ok) {
              const quoteData = await quoteRes.json()
              setQuoteItems(quoteData.items || [])
            }
          } catch (err) {
            console.warn('Failed to load quote items:', err)
          }
        }
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

  const user = getAuthUser()
  const isAdmin = user?.role_id === 1 || user?.role_id === 2 // Admin or Owner
  const canMarkDelivered = isAdmin
  const canProcessPayments = isAdmin

  const handleProcessPayment = async () => {
    if (!order) return
    const amountNumber = Number(paymentAmount || 0)
    if (!amountNumber || amountNumber <= 0) {
      setError('Please enter a valid payment amount')
      return
    }

    setProcessingPayment(true)
    setError(null)
    setPaymentSuccess(null)

    try {
      let currentInvoiceId = invoiceId
      if (!currentInvoiceId) {
        const invoice = await createInvoice({ order_id: order.id, amount: amountNumber })
        currentInvoiceId = invoice.id
        setInvoiceId(invoice.id)
      }

      await recordPayment({
        invoice_id: currentInvoiceId,
        method: paymentMethod,
        amount: amountNumber,
        reference: paymentReference || `ORDER-${order.id}`,
      })

      setPaymentSuccess('Payment recorded successfully!')
      setPaymentReference('')
      setPaymentAmount('')

    } catch (err: any) {
      setError(err.message || 'Failed to process payment')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleAdvanceStage = async () => {
    if (!order) return
    if (currentStageIndex >= stageStatusCodes.length - 1) return

    const nextStatus = stageStatusCodes[currentStageIndex + 1]
    try {
      await updateOrderStatus(order.id, nextStatus)
      setOrder({ ...order, status: nextStatus })
    } catch (err: any) {
      setError(err.message || 'Failed to update order status')
    }
  }

  const handleWhatsAppContact = () => {
    if (!order) return
    const phone = order.customer_phone || order.phone || ''
    const message = `Hello ${order.customer_name || 'valued customer'}! Your order #${order.id} is ready for pickup. Please visit us at your earliest convenience. Thank you!`
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'design':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'print':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'finish':
      case 'finishing':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'ready':
        return 'bg-teal-100 text-teal-800 border-teal-300'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin mr-3 text-blue-600">🌀</div>
          <p className="text-lg text-gray-600">Loading Order Details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
            <Package className="h-8 w-8 mx-auto mb-3 text-red-600" />
            <p className="text-xl font-semibold text-red-700">Error Loading Order</p>
            <p className="text-sm mt-1 text-red-600">{error || `Order with ID ${id} not found.`}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const total = order.total_amount || order.balance || 0
  const statusCode = (order.status || '').toLowerCase()
  const currentStageIndex = Math.max(stageStatusCodes.indexOf(statusCode), 0)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                  <Package className="inline h-4 w-4 mr-2" />
                  Order Details
                </p>
                <h1 className="mt-2 text-4xl font-extrabold text-gray-900">
                  Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">#{id}</span>
                </h1>
                <div className="mt-4 space-y-2">
                  <p className="text-lg text-gray-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-semibold">{order.customer_name || 'N/A'}</span>
                  </p>
                  {order.customer_email && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {order.customer_email}
                    </p>
                  )}
                  {order.customer_phone && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {order.customer_phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className={`rounded-xl px-6 py-3 border ${getStatusClasses(order.status)}`}>
                  <p className="text-xs font-medium">Status</p>
                  <p className="mt-1 text-lg font-bold capitalize">{order.status}</p>
                </div>
                {order.due_date && (
                  <div className="rounded-xl px-6 py-3 bg-white border border-gray-300 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Due Date
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900">{order.due_date ? new Date(order.due_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Production Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeline Card */}
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-lg font-bold text-gray-900 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-blue-600" />
                    Production Timeline
                  </p>
                  {(() => {
                    const isAtReady = order.status?.toLowerCase() === 'ready'
                    const isCompleted = currentStageIndex >= stages.length - 1

                    // Permission check: Admin or Assigned Staff
                    const isAssigned = order.assigned_to && Number(order.assigned_to) === Number(user?.id)
                    const hasPermission = isAdmin || isAssigned

                    const canAdvance = isCompleted ? false : (isAtReady ? canMarkDelivered : hasPermission)

                    return (
                      <button
                        type="button"
                        onClick={handleAdvanceStage}
                        disabled={!canAdvance}
                        className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${canAdvance ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
                        title={!hasPermission ? 'Only assigned staff or admin can update status' : (isAtReady && !canMarkDelivered ? 'Only Reception or Owner can mark as Delivered' : '')}
                      >
                        {isCompleted ? 'Completed' : isAtReady ? 'Mark as Delivered' : 'Mark Next Step Done'}
                      </button>
                    )
                  })()}
                </div>
                <ol className="relative border-l border-blue-200 space-y-8 ml-3">
                  {stages.map((stage, index) => {
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


              {/* Custom Design Details Card */}
              {order.is_custom_design && (
                <div className="bg-white rounded-3xl shadow-lg p-6 border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
                  <div className="flex items-center gap-2 mb-6 text-indigo-700">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-bold">Custom Design Specifications</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Product Type</p>
                      <p className="font-bold text-slate-900 text-lg capitalize">{order.product_type}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dimensions</p>
                      <p className="font-bold text-slate-900 text-lg">{order.width}m × {order.height}m</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Quantity</p>
                      <p className="font-bold text-slate-900 text-lg">{order.quantity || 1}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Materials</p>
                      <p className="font-bold text-slate-900 text-sm">
                        {order.paper_type || 'Standard'} Paper<br />
                        {order.finish_type || 'No'} Finish
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-white/60 border border-indigo-100 rounded-2xl">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase mb-2">Requirements / Instructions</p>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{order.requirements || 'No specific requirements provided.'}</p>
                  </div>
                </div>
              )}

              {/* Quote Items Card */}
              {quoteItems.length > 0 && !order.is_custom_design && (
                <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                  <p className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    Order Items
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-purple-50 border-b border-purple-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-purple-700">Description</th>
                          <th className="px-4 py-3 text-right font-semibold text-purple-700">Quantity</th>
                          <th className="px-4 py-3 text-right font-semibold text-purple-700">Unit Price</th>
                          <th className="px-4 py-3 text-right font-semibold text-purple-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {quoteItems.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-purple-50/30">
                            <td className="px-4 py-3 text-gray-900">{item.description}</td>
                            <td className="px-4 py-3 text-right text-gray-800">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-700 font-mono">{formatCurrency(item.unit_price)}</td>
                            <td className="px-4 py-3 text-right text-gray-900 font-semibold font-mono">{formatCurrency(item.quantity * item.unit_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 sticky top-6 space-y-6">
                {/* Order Info */}
                <div>
                  <p className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Order Summary
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Order ID</span>
                      <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    {order.created_at && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Created</span>
                        <span className="text-sm font-medium text-gray-900">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    )}
                    {order.due_date && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Due Date</span>
                        <span className="text-sm font-medium text-gray-900">
                          {order.due_date ? new Date(order.due_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <p className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Customer Details
                  </p>
                  <div className="space-y-3">
                    <div className="py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="text-sm font-semibold text-gray-900">{order.customer_name || 'N/A'}</p>
                    </div>
                    {order.customer_email && (
                      <div className="py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm text-gray-700 flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {order.customer_email}
                        </p>
                      </div>
                    )}
                    {order.customer_phone && (
                      <div className="py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-sm text-gray-700 flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {order.customer_phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Info */}
                <div>
                  <p className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    Financial Info
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Order Total</span>
                      <span className="text-lg font-extrabold text-blue-700">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50 border border-amber-200">
                      <span className="text-sm text-amber-700 font-bold">Balance Due</span>
                      <span className="text-sm font-extrabold text-amber-700">{formatCurrency(order.balance || total)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {order.status === 'ready' && order.customer_phone && (
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Contact via WhatsApp
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
