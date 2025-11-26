// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
// Relying solely on the external imports for API calls:
import { fetchOrder, updateOrderStatus, fetchQuote } from '../../api/apiClient'
import TechnicianTopNav from '@/components/layout/TechnicianTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import { getAuthUser } from '@/utils/apiClient'

// Import necessary Lucide icons for visual enhancement
import { Tag, User, Calendar, CheckCircle, Loader2, AlertTriangle, Save, Clock } from 'lucide-react'

// =========================================================================
// REACT COMPONENT START
// The API client functions (fetchOrder, updateOrderStatus) are now assumed
// to be defined externally in '../../api/apiClient'.
// =========================================================================

export default function WorkOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  // Materials from the linked quote (if any) so technician can see what was quoted
  const [quoteItems, setQuoteItems] = useState<any[]>([])

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (!id) return
    let isMounted = true
    setLoading(true)
    setError(null)

    // Using the imported function
    fetchOrder(id)
      .then((data) => {
        if (!isMounted) return
        setOrder(data)
        // If this order was created from a quote, load the quote items so technician sees required materials
        if (data.quote_id) {
          fetchQuote(data.quote_id)
            .then((q: any) => {
              if (!isMounted) return
              const items = Array.isArray(q.items)
                ? q.items.map((it: any) => ({
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
              // ignore quote load error here; technician can still mark status
            })
        }
      })
      .catch((err) => {
        if (!isMounted) return
        // Check for specific error object structure if available, otherwise fallback to message
        const errorMessage = typeof err === 'object' && err !== null && err.message ? err.message : 'Failed to load work order details from API.';
        setError(errorMessage);
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  // --- Mark Complete Handler ---
  // In backend, valid order.status values are: 'design','prepress','print','finishing','qa','ready','delivered'.
  // When production finishes, we move the order to 'ready' so Reception can see it in the
  // Communications Inbox (the API filters orders with status IN ('ready','delivered')).
  const handleMarkComplete = async () => {
    if (!id || saving) return
    setSaving(true)
    setActionMessage('')
    setError(null)

    try {
      // Update backend status to 'ready' (production completed, waiting for delivery/payment)
      await updateOrderStatus(id, 'ready')
      setOrder({ ...order, status: 'ready', stage: 'ready' })
      setActionMessage('Order marked as Ready for delivery/communication!')
    } catch (err) {
      const errorMessage = typeof err === 'object' && err !== null && err.message ? err.message : 'Failed to update status via API.';
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Helper function to color the status tag
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

  // --- Conditional Rendering: Loading & Error ---
  const currentUser = getAuthUser()
  const isOwner = currentUser?.role_id === 7

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-0 pb-10 font-sans">
        {isOwner ? <OwnerTopNav /> : <TechnicianTopNav />}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-8">
          <div className="flex gap-6">
            {isOwner && <OwnerSideNav />}
            <main className="flex-1 max-w-6xl mx-auto flex items-center justify-center">
              <div className="p-8 text-center text-sm text-gray-500 rounded-xl bg-white shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin inline mr-2 text-blue-500" />
                Loading work order details...
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-0 pb-10 font-sans">
        {isOwner ? <OwnerTopNav /> : <TechnicianTopNav />}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-8">
          <div className="flex gap-6">
            {isOwner && <OwnerSideNav />}
            <main className="flex-1 max-w-6xl mx-auto flex items-center justify-center">
              <div className="p-8 text-sm text-red-600 bg-white border border-red-200 rounded-xl shadow-lg">
                <AlertTriangle className="h-5 w-5 inline mr-2" />
                Error: {error || 'Work order not found.'}
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  // Mapping the fetched 'order' data to the 'workOrder' structure used in the UI
  // Ensure that all accessed properties have fallbacks in case the real API response
  // structure is slightly different from the previous mock data.
  const workOrder = {
    id: order.id,
    orderId: order.id,
    jobName: order.customer_name || `Order for ${order.id}`,
    stage: order.stage || order.status || 'Unknown Stage',
    technician: order.technician || 'Production Team',
    priority: order.priority || 'N/A',
    status: order.status || 'Pending',
    material: order.material || 'To be determined',
    materialUsed: order.materialUsed || '0m',
    dueDate: order.eta || 'N/A',
    details: order.details || 'No detailed instructions provided.',
  }

  // --- Main Component Render ---
  return (
    // Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-0 pb-10 font-sans">
      {isOwner ? <OwnerTopNav /> : <TechnicianTopNav />}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-8">
        <div className="flex gap-6">
          {isOwner && <OwnerSideNav />}
          <main className="flex-1 space-y-8 max-w-6xl mx-auto">

            {/* Header Card - Using the new, cleaner card style */}
            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-gray-200/50">
              <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">Production Detail</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900 flex flex-wrap items-center gap-2">
                Work Order 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{workOrder.id}</span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold border ml-3 ${getStatusColor(workOrder.status)}`}>
                  {workOrder.status}
                </span>
              </h1>
              <p className="mt-3 text-lg font-medium text-gray-800 max-w-xl">
                Job Name: {workOrder.jobName}
              </p>

              {/* Key Status Indicators Grid */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {/* Stage */}
                <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 shadow-sm">
                  <Tag className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Current Stage</p>
                    <p className="mt-0.5 text-base font-bold text-gray-900">{workOrder.stage}</p>
                  </div>
                </div>

                {/* Technician */}
                <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 shadow-sm">
                  <User className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned To</p>
                    <p className="mt-0.5 text-base font-bold text-gray-900">{workOrder.technician}</p>
                  </div>
                </div>
              </div>

              {/* Materials section for technician (read-only, stock already reserved at quote approval) */}
              {quoteItems.length > 0 && (
                <div className="mt-6 rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">Materials for this job</p>
                  <p className="text-sm text-gray-700 mb-3">
                    These lines come from the approved quote. Stock for these materials was already reserved when the quote was approved.
                  </p>
                  <div className="overflow-x-auto -mx-2 mb-3">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700">Description</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-700">Planned qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {quoteItems.map((row, index) => (
                          <tr key={row.id || index}>
                            <td className="px-3 py-2 text-gray-900">{row.description}</td>
                            <td className="px-3 py-2 text-right text-gray-800">{row.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}