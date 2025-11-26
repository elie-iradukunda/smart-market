// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { fetchOrder, createInvoice, recordPayment, updateOrderStatus } from '../../api/apiClient'

import { CheckCircle, Clock, DollarSign, Package, Truck, User } from 'lucide-react'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ControllerTopNav from '@/components/layout/ControllerTopNav'
import ReceptionTopNav from '@/components/layout/ReceptionTopNav'
import SalesTopNav from '@/components/layout/SalesTopNav'
import { getAuthUser } from '@/utils/apiClient'

// --- Utility Functions for Design ---

// Helper to format currency
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'N/A'
  return `RF ${amount.toLocaleString('en-RW')}`
}

// Helper to style the Status pill/card
const getStatusClasses = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'shipped':
    case 'ready':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300'
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300'
  }
}

// --- OrderDetailPage Component ---

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invoiceId, setInvoiceId] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentReference, setPaymentReference] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)

  // Production stages (visual labels) and matching backend status codes
  const stages = ['Design', 'Pre-Press', 'Print', 'Finishing', 'QA', 'Ready', 'Delivered']
  const stageStatusCodes = ['design', 'prepress', 'print', 'finishing', 'qa', 'ready', 'delivered']

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setLoading(true)
    setError(null)

    // Using the original fetchOrder
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

  const user = getAuthUser()
  const isController = user?.role_id === 4
  const isReception = user?.role_id === 2
  const isTechnician = user?.role_id === 7

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

      setPaymentSuccess('Payment recorded successfully and invoice updated.')
      setPaymentReference('')

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

  // --- Render Functions for Feedback ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {isController ? <ControllerTopNav /> : isReception ? <ReceptionTopNav /> : <OwnerTopNav />}
        {!isReception && <SalesTopNav />}
        <div className="max-w-6xl mx-auto flex items-center justify-center p-8">
          <span className="animate-spin mr-3 text-indigo-600">🌀</span>
          <p className="text-lg text-gray-600">Loading Order Details for ID: {id}...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50">
        {isController ? <ControllerTopNav /> : isReception ? <ReceptionTopNav /> : <OwnerTopNav />}
        {!isReception && <SalesTopNav />}
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center p-8 text-red-700 bg-red-50 border border-red-200 rounded-3xl shadow-md mt-8">
          <Package className="h-8 w-8 mb-3" />
          <p className="text-xl font-semibold">Error Loading Order</p>
          <p className="text-sm mt-1">{error || `Order with ID ${id} not found.`}</p>
        </div>
      </div>
    )
  }
  // --- End Render Functions for Feedback ---

  // Calculations for Billing section
  const total = order.total_amount || order.balance || 0
  const depositPaid = total / 2 // Mock calculation
  const balanceDue = total - depositPaid

  // Map backend status (e.g. 'design', 'prepress') to stage index for the timeline
  const statusCode = (order.status || '').toLowerCase()
  const currentStageIndex = Math.max(stageStatusCodes.indexOf(statusCode), 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {isController ? <ControllerTopNav /> : isReception ? <ReceptionTopNav /> : <OwnerTopNav />}
      {!isReception && <SalesTopNav />}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section 1: Header and Key Metrics Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 border-t-4 border-t-indigo-600 transition duration-500 hover:shadow-indigo-300/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            
            {/* Main Title Block */}
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                <Package className="inline h-4 w-4 mr-2" />
                Order Details
              </p>
              <h1 className="mt-1 text-4xl font-extrabold text-gray-900 leading-tight">
                Order **#{id}**
              </h1>
              <p className="mt-2 text-base text-gray-600 flex items-center">
                <User className="h-4 w-4 mr-1 text-gray-400" />
                Customer: **{order.customer_name || 'N/A'}**
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm min-w-[200px]">
              {/* Status */}
              <div className={`rounded-xl px-4 py-3 border ${getStatusClasses(order.status)} transition duration-300 hover:scale-[1.03]`}>
                <p className="font-medium text-gray-800">Status</p>
                <p className="mt-1 text-lg font-bold">{order.status}</p>
              </div>
              {/* ETA */}
              <div className="rounded-xl px-4 py-3 bg-white border border-gray-300 shadow-sm transition duration-300 hover:shadow-md">
                <p className="font-medium text-gray-800 flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-500" />
                    Estimated Delivery
                </p>
                <p className="mt-1 text-lg font-bold text-blue-700">{order.eta || 'N/A'}</p>
              </div>

              {/* Technician quick access to production materials view */}
              {isTechnician && (
                <button
                  type="button"
                  onClick={() => navigate(`/production/work-orders/${id}`)}
                  className="col-span-2 mt-2 inline-flex items-center justify-center rounded-full border border-indigo-500 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
                >
                  Open technician materials view
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Section 2: Production Stages and Billing */}
        <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Production Stages (Timeline/Stepper View) */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6 space-y-4 border border-slate-200">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-700 border-b pb-2 mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      <Truck className="inline h-4 w-4 mr-2" />
                      Production Timeline
                    </span>
                    <button
                      type="button"
                      onClick={handleAdvanceStage}
                      disabled={currentStageIndex >= stages.length - 1}
                      className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentStageIndex >= stages.length - 1 ? 'All steps completed' : 'Mark next step done'}
                    </button>
                </p>
                <ol className="relative border-l border-indigo-200 space-y-8 ml-3">
                    {stages.map((stage, index) => {
                        const isCompleted = index < currentStageIndex
                        const isActive = index === currentStageIndex
                        
                        return (
                            <li key={stage} className={`ml-6 transition duration-500 ${isCompleted ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-60'}`}>
                                <span className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white ${isCompleted ? 'bg-green-500' : isActive ? 'bg-indigo-600 animate-pulse' : 'bg-gray-300'}`}>
                                    {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                                    {!isCompleted && !isActive && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                </span>
                                <h3 className={`font-semibold ${isCompleted ? 'text-gray-700' : isActive ? 'text-indigo-600 text-lg' : 'text-gray-400'}`}>
                                    {stage}
                                    {isActive && <span className="ml-2 text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">CURRENT</span>}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">{isCompleted ? 'Completed' : isActive ? 'In progress' : 'Upcoming'}</p>
                            </li>
                        )
                    })}
                </ol>
            </div>
            
            {/* Billing Summary */}
            <div className="lg:col-span-1 bg-white rounded-3xl shadow-lg p-6 space-y-5 border border-slate-200">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-700 border-b pb-2">
                    <DollarSign className="inline h-4 w-4 mr-2" />
                    Financial Summary
                </p>

                <div className="space-y-3">
                    {/* Total */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-base text-gray-700 font-semibold">Order Total</span>
                        <span className="text-xl font-extrabold text-blue-700">{formatCurrency(total)}</span>
                    </div>

                    {/* Deposit Paid */}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Deposit Paid (50%)</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(depositPaid)}</span>
                    </div>

                    {/* Balance Due */}
                    <div className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-red-50 border border-red-200 transition duration-300 hover:bg-red-100">
                        <span className="text-red-700 font-bold">Balance Due</span>
                        <span className="font-extrabold text-red-700">{formatCurrency(balanceDue)}</span>
                    </div>
                </div>

                {/* Simple payment form */}
                <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm">
                  {paymentSuccess && !error && (
                    <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-emerald-800 text-xs">
                      {paymentSuccess}
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-600">Payment amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter amount the customer is paying now"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-600">Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="mobile_money">Mobile money</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank transfer</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-600">Reference (optional)</label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Receipt no, transaction ID, etc."
                    />
                  </div>
                </div>
                 
                {/* Action Button */}
                <button
                    onClick={handleProcessPayment}
                    disabled={processingPayment}
                    className="w-full mt-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {processingPayment ? 'Processing…' : 'Process Payment'}
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}