// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchOrders, fetchUsers, createWorkOrder } from '@/api/apiClient'
import { ArrowLeft, PlusCircle, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'

export default function NewWorkOrderPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        order_id: '',
        stage: 'Design',
        assigned_to: '',
    })

    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setError(null)

        Promise.allSettled([fetchOrders(), fetchUsers()])
            .then(([ordersResult, usersResult]) => {
                if (!isMounted) return

                if (ordersResult.status === 'fulfilled') {
                    setOrders(Array.isArray(ordersResult.value) ? ordersResult.value : [])
                } else {
                    console.error('Failed to load orders:', ordersResult.reason)
                    // Don't show error if it's just a permission issue - form can still work
                }

                if (usersResult.status === 'fulfilled') {
                    setUsers(Array.isArray(usersResult.value) ? usersResult.value : [])
                } else {
                    console.error('Failed to load users:', usersResult.reason)
                    const errorMsg = usersResult.reason?.message || usersResult.reason?.toString() || 'Unknown error'
                    // Check if it's a permission issue
                    if (errorMsg.toLowerCase().includes('permission') || errorMsg.toLowerCase().includes('insufficient') || errorMsg.toLowerCase().includes('forbidden')) {
                        setError('Unable to load users. You may not have permission to view users. Please contact your administrator to assign work orders.')
                    } else {
                        setError(`Failed to load users: ${errorMsg}. Please refresh the page or contact your administrator.`)
                    }
                }
            })
            .catch((err) => {
                if (!isMounted) return
                console.error('Error loading data:', err)
                setError(err.message || 'Failed to load data')
            })
            .finally(() => {
                if (!isMounted) return
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            if (!formData.order_id || !formData.assigned_to) {
                setError('Please select an order and assignee')
                setSaving(false)
                return
            }

            await createWorkOrder({
                order_id: Number(formData.order_id),
                stage: formData.stage,
                assigned_to: Number(formData.assigned_to),
            })

            setSuccess('Work order created successfully!')
            toast.success('Work order created and assigned successfully', {
                position: 'bottom-right',
                autoClose: 3000,
            })

            // Reset form
            setFormData({
                order_id: '',
                stage: 'Design',
                assigned_to: '',
            })

            // Navigate back after a short delay
            setTimeout(() => {
                navigate('/production/work-orders')
            }, 1500)
        } catch (err: any) {
            setError(err.message || 'Failed to create work order')
            toast.error(err.message || 'Failed to create work order', {
                position: 'bottom-right',
                autoClose: 3000,
            })
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="rounded-3xl border border-gray-100 bg-white p-12 shadow-xl flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
                            <span className="text-gray-600">Loading form data...</span>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                        <button
                            onClick={() => navigate('/production/work-orders')}
                            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Work Orders
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <PlusCircle size={20} />
                            </div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Production Management</p>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                            Create New <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Work Order</span>
                        </h1>
                        <p className="mt-4 text-base text-gray-600 max-w-2xl">
                            Create a work order for an existing customer order and assign it to a technician or team member.
                        </p>
                    </div>

                    {/* Error/Warning message */}
                    {error && (
                        <div className={`rounded-xl border p-4 flex items-start gap-3 ${
                            error.toLowerCase().includes('permission') || error.toLowerCase().includes('unable to load')
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <AlertCircle className={`flex-shrink-0 ${error.toLowerCase().includes('permission') || error.toLowerCase().includes('unable to load') ? 'text-amber-600' : 'text-red-600'}`} size={20} />
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                    error.toLowerCase().includes('permission') || error.toLowerCase().includes('unable to load')
                                        ? 'text-amber-700'
                                        : 'text-red-700'
                                }`}>
                                    {error}
                                </p>
                                {error.toLowerCase().includes('permission') && (
                                    <p className="text-xs text-amber-600 mt-2">
                                        Note: You may need to contact an administrator to grant you permission to view users, or they can create work orders on your behalf.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
                            <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-green-700 font-medium">{success}</p>
                        </div>
                    )}

                    {/* Form */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Order Selection */}
                            <div>
                                <label htmlFor="order_id" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Customer Order <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="order_id"
                                    name="order_id"
                                    value={formData.order_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                                >
                                    <option value="">Select an order...</option>
                                    {orders.map((order) => (
                                        <option key={order.id} value={order.id}>
                                            #{order.id} - {order.customer || order.customer_name || 'Unknown Customer'} 
                                            {order.status ? ` (${order.status})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {orders.length === 0 && (
                                    <p className="mt-2 text-xs text-amber-600">
                                        No orders available. You may need to create an order first or check your permissions.
                                    </p>
                                )}
                            </div>

                            {/* Stage Selection */}
                            <div>
                                <label htmlFor="stage" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Production Stage <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="stage"
                                    name="stage"
                                    value={formData.stage}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                                >
                                    <option value="Design">Design</option>
                                    <option value="Print">Print</option>
                                    <option value="Finish">Finish</option>
                                    <option value="QC">Quality Control (QC)</option>
                                    <option value="Complete">Complete</option>
                                </select>
                                <p className="mt-2 text-xs text-gray-500">
                                    Select the production stage for this work order.
                                </p>
                            </div>

                            {/* Assignee Selection */}
                            <div>
                                <label htmlFor="assigned_to" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Assign To <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="assigned_to"
                                    name="assigned_to"
                                    value={formData.assigned_to}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                                >
                                    <option value="">Select a team member...</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name || user.email} {user.role ? `(${user.role})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {users.length === 0 && error && (
                                    <p className="mt-2 text-xs text-amber-600">
                                        Unable to load users. This may be due to insufficient permissions. Please contact your administrator to grant you access to view users, or ask them to create work orders on your behalf.
                                    </p>
                                )}
                                {users.length === 0 && !error && (
                                    <p className="mt-2 text-xs text-gray-500">
                                        No users available. Please contact your administrator.
                                    </p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/production/work-orders')}
                                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !formData.order_id || !formData.assigned_to}
                                    className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="h-4 w-4" />
                                            Create Work Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Info Card */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">About Work Orders</h3>
                        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                            <li>Work orders link customer orders to production stages</li>
                            <li>Each work order can be assigned to a specific team member</li>
                            <li>Stages represent different phases of the production process</li>
                            <li>You can track progress and update work orders from the Work Orders board</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

