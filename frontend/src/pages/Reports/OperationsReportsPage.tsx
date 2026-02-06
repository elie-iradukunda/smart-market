// @ts-nocheck
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchOrders, fetchWorkOrders } from '@/api/apiClient'
import { BarChart3, Package, Wrench, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

export default function OperationsReportsPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [workOrders, setWorkOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setError(null)

        Promise.all([fetchOrders(), fetchWorkOrders()])
            .then(([ordersData, workOrdersData]) => {
                if (!isMounted) return
                setOrders(Array.isArray(ordersData) ? ordersData : [])
                setWorkOrders(Array.isArray(workOrdersData) ? workOrdersData : [])
            })
            .catch((err) => {
                if (!isMounted) return
                setError(err.message || 'Failed to load operations data')
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
        pendingOrders: orders.filter(o => {
            const s = o.status?.toLowerCase() || 'pending';
            return s === 'pending';
        }).length,
        processingOrders: orders.filter(o => {
            const s = o.status?.toLowerCase();
            return ['design', 'print', 'finish', 'finishing', 'prepress'].includes(s);
        }).length,
        completedOrders: orders.filter(o => {
            const s = o.status?.toLowerCase();
            return ['ready', 'delivered', 'complete', 'completed'].includes(s);
        }).length,
        totalWorkOrders: workOrders.length,
        activeWorkOrders: workOrders.filter(wo => {
            const s = (wo.order_status || wo.stage || wo.status)?.toLowerCase();
            return s !== 'delivered' && s !== 'complete' && s !== 'completed';
        }).length,
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-8">

                    {/* Header */}
                    <div className="rounded-3xl border border-gray-200 bg-white ">
                        <h3 className='text-2xl text-slate-800 font-semibold'>Operations Reports</h3>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Total Orders</p>
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Package size={20} className="text-amber-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">All customer orders</p>
                        </div>

                        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Processing</p>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Clock size={20} className="text-blue-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.processingOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Orders in production</p>
                        </div>

                        <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Completed</p>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <CheckCircle2 size={20} className="text-green-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Successfully delivered</p>
                        </div>

                        <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Work Orders</p>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Wrench size={20} className="text-purple-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalWorkOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Production jobs</p>
                        </div>

                        <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Active Jobs</p>
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <TrendingUp size={20} className="text-orange-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.activeWorkOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Currently in progress</p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">Pending</p>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Clock size={20} className="text-gray-500" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                            <p className="mt-1 text-xs text-gray-500">Awaiting processing</p>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                            {loading && <span className="text-xs text-gray-500">Loading…</span>}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Order #</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {orders.slice(0, 10).map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">#{order.id}</td>
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-900 font-medium">{order.customer || 'N/A'}</td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${['ready', 'delivered', 'complete', 'completed'].includes(order.status?.toLowerCase())
                                                    ? 'bg-green-50 text-green-700'
                                                    : ['design', 'print', 'finish', 'finishing', 'prepress'].includes(order.status?.toLowerCase())
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                    {order.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                                                {order.total_amount ? `RF ${Number(order.total_amount).toLocaleString()}` : order.total ? `RF ${Number(order.total).toLocaleString()}` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {!loading && orders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Work Orders Table */}
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Work Orders</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">WO #</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer/Job</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Stage</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Technician</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {workOrders.slice(0, 10).map((wo) => {
                                        const currentStage = (wo.order_status || wo.stage || wo.status || 'Pending').toLowerCase();
                                        return (
                                            <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">#{wo.id}</td>
                                                <td className="px-6 py-3 whitespace-nowrap text-gray-900 font-medium">{wo.customer_name || wo.customer || 'N/A'}</td>
                                                <td className="px-6 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${['ready', 'delivered', 'complete', 'completed'].includes(currentStage)
                                                        ? 'bg-green-50 text-green-700'
                                                        : ['design', 'print', 'finish', 'finishing', 'prepress'].includes(currentStage)
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-purple-50 text-purple-700'
                                                        }`}>
                                                        {currentStage}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 whitespace-nowrap text-gray-600 truncate max-w-[150px]">
                                                    {wo.assigned_user_name || wo.technician || '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {!loading && workOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
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