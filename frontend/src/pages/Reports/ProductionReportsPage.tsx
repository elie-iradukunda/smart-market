// @ts-nocheck
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchOrders, fetchWorkOrders } from '@/api/apiClient'
import { BarChart3, Package, Wrench, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProductionReportsPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<any[]>([])
    const [workOrders, setWorkOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [ordersError, setOrdersError] = useState<string | null>(null)
    const [workOrdersError, setWorkOrdersError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setOrdersError(null)
        setWorkOrdersError(null)

        Promise.allSettled([fetchOrders(), fetchWorkOrders()])
            .then(([ordersResult, workOrdersResult]) => {
                if (!isMounted) return
                
                if (ordersResult.status === 'fulfilled') {
                    setOrders(Array.isArray(ordersResult.value) ? ordersResult.value : [])
                } else {
                    console.error('Failed to load orders:', ordersResult.reason)
                    const errorMsg = ordersResult.reason?.message || ordersResult.reason?.toString() || 'Unknown error'
                    // Only show error if it's a permission issue, otherwise just log it
                    if (errorMsg.toLowerCase().includes('permission') || errorMsg.toLowerCase().includes('insufficient')) {
                        setOrdersError('Unable to load orders data. You may not have permission to view orders.')
                    }
                }
                
                if (workOrdersResult.status === 'fulfilled') {
                    setWorkOrders(Array.isArray(workOrdersResult.value) ? workOrdersResult.value : [])
                } else {
                    console.error('Failed to load work orders:', workOrdersResult.reason)
                    const errorMsg = workOrdersResult.reason?.message || workOrdersResult.reason?.toString() || 'Unknown error'
                    setWorkOrdersError(errorMsg)
                }
            })
            .catch((err) => {
                if (!isMounted) return
                console.error('Error loading production reports:', err)
                setWorkOrdersError(err.message || 'Failed to load production data')
            })
            .finally(() => {
                if (!isMounted) return
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

    // Calculate statistics
    const stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
        processingOrders: orders.filter(o => o.status?.toLowerCase() === 'processing' || o.status?.toLowerCase() === 'in_production').length,
        completedOrders: orders.filter(o => ['delivered', 'completed'].includes(o.status?.toLowerCase())).length,
        totalWorkOrders: workOrders.length,
        activeWorkOrders: workOrders.filter(wo => wo.status?.toLowerCase() !== 'complete' && wo.status?.toLowerCase() !== 'completed' && wo.status?.toLowerCase() !== 'cancelled').length,
        completedWorkOrders: workOrders.filter(wo => wo.status?.toLowerCase() === 'complete' || wo.status?.toLowerCase() === 'completed').length,
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">

                    {/* Header */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <BarChart3 size={20} />
                            </div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Production Analytics</p>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                            Production <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Reports</span>
                        </h1>
                        <p className="mt-4 text-base text-gray-600 max-w-2xl">
                            Monitor production performance, work orders, and order fulfillment metrics.
                        </p>
                    </div>

                    {/* Error/Warning messages */}
                    {ordersError && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
                            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                            <div className="flex-1">
                                <p className="text-sm text-amber-700 font-medium">{ordersError}</p>
                                <p className="text-xs text-amber-600 mt-1">Work orders data is still available below.</p>
                            </div>
                        </div>
                    )}
                    {workOrdersError && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-red-700 font-medium">Failed to load work orders: {workOrdersError}</p>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Total Orders</p>
                                <Package size={20} className="text-indigo-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">All customer orders</p>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">In Production</p>
                                <Clock size={20} className="text-blue-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.processingOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Orders being processed</p>
                        </div>

                        <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Completed</p>
                                <CheckCircle2 size={20} className="text-green-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.completedOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Successfully delivered</p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Work Orders</p>
                                <Wrench size={20} className="text-purple-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalWorkOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Total production jobs</p>
                        </div>

                        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Active Jobs</p>
                                <TrendingUp size={20} className="text-orange-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.activeWorkOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Currently in progress</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Completed Jobs</p>
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.completedWorkOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Finished work orders</p>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                            {loading && <span className="text-xs text-gray-500">Loading…</span>}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Order #</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {orders.slice(0, 10).map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">#{order.id}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-900 font-medium">{order.customer || order.customer_name || 'N/A'}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${order.status?.toLowerCase() === 'completed' || order.status?.toLowerCase() === 'delivered'
                                                        ? 'bg-green-50 text-green-700'
                                                        : order.status?.toLowerCase() === 'processing' || order.status?.toLowerCase() === 'in_production'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                    {order.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                                                {order.total || order.total_amount ? `RF ${Number(order.total || order.total_amount).toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/orders/${order.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && orders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Work Orders Table */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Work Orders</h2>
                            <button
                                onClick={() => navigate('/production/work-orders')}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                View All →
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">WO #</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer/Job</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Stage</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Technician</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {workOrders.slice(0, 10).map((wo) => (
                                        <tr key={wo.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">#{wo.id}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-900 font-medium">{wo.customer || wo.customer_name || wo.job_name || 'N/A'}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${wo.status?.toLowerCase() === 'complete' || wo.status?.toLowerCase() === 'completed'
                                                        ? 'bg-green-50 text-green-700'
                                                        : wo.status?.toLowerCase() === 'print' || wo.status?.toLowerCase() === 'printing'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-purple-50 text-purple-700'
                                                    }`}>
                                                    {wo.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-600">{wo.technician || wo.assigned_to || '—'}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/production/work-orders/${wo.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && workOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No work orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    )
}

