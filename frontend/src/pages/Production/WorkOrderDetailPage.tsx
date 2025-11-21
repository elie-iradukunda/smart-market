// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
// Relying solely on the external imports for API calls:
import { fetchOrder, updateOrderStatus } from '../../api/apiClient'
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
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

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
  const handleMarkComplete = async () => {
    if (!id || saving) return
    setSaving(true)
    setActionMessage('')
    setError(null)

    try {
      // Using the imported function
      await updateOrderStatus(id, 'Complete')
      setOrder({ ...order, status: 'Complete', stage: 'Complete' })
      setActionMessage('Order marked as Complete successfully!')
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
      case 'in progress':
      case 'design':
      case 'print':
      case 'finish':
      case 'qc':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // --- Conditional Rendering: Loading & Error ---

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
            <div className="p-8 text-center text-sm text-gray-500 rounded-xl bg-white shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin inline mr-2 text-blue-500" />
                Loading work order details...
            </div>
        </div>
    )
  }

  if (error || !order) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
            <div className="p-8 text-sm text-red-600 bg-white border border-red-200 rounded-xl shadow-lg">
                <AlertTriangle className="h-5 w-5 inline mr-2" />
                Error: {error || 'Work order not found.'}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8 font-sans">
        <div className="max-w-6xl mx-auto">
            
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
                    Job Name: **{workOrder.jobName}**
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

                    {/* Priority */}
                    <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 shadow-sm">
                        <Clock className={`h-5 w-5 ${workOrder.priority === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Priority</p>
                            <p className="mt-0.5 text-base font-bold text-gray-900">{workOrder.priority}</p>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center space-x-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 shadow-sm">
                        <Calendar className="h-5 w-5 text-red-500" />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Due Date</p>
                            <p className="mt-0.5 text-base font-bold text-gray-900">{workOrder.dueDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Production Details & Actions Section */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3 items-start">

                {/* Left Column: Details and Materials (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Job Details Card */}
                    <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Job Instructions</h2>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {workOrder.details}
                        </p>
                    </div>

                    {/* Materials Card */}
                    <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Material Tracking</h2>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                            {/* Required */}
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                <p className="text-xs font-semibold uppercase text-blue-700">Required Material</p>
                                <p className="mt-1 text-lg font-bold text-gray-900">{workOrder.material}</p>
                            </div>
                            {/* Used */}
                            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                                <p className="text-xs font-semibold uppercase text-purple-700">Material Consumed</p>
                                <p className="mt-1 text-lg font-bold text-gray-900">{workOrder.materialUsed}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 pt-2">
                            Update material usage logs upon completion of each stage.
                        </p>
                    </div>

                </div>
                
                {/* Right Column: Actions (1/3 width) */}
                <div className="lg:col-span-1 rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">Work Order Actions</h2>

                    {/* Action Message/Error */}
                    {actionMessage && (
                        <div className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {actionMessage}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {/* Primary Action Button */}
                    <button
                        className="w-full rounded-lg bg-green-600 px-4 py-3 text-base font-medium text-white shadow-lg shadow-green-500/30 hover:bg-green-700 transition duration-150 disabled:opacity-50 flex items-center justify-center"
                        onClick={handleMarkComplete}
                        disabled={saving || workOrder.status === 'Complete'}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : workOrder.status === 'Complete' ? (
                            <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Completed
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Mark as Complete
                            </>
                        )}
                    </button>

                    {/* Secondary Actions */}
                    <button className="w-full rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition duration-150 shadow-sm">
                        <Save className="h-4 w-4 inline mr-2" />
                        Update Material Log
                    </button>
                    <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150 shadow-sm">
                        Reassign Technician
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}