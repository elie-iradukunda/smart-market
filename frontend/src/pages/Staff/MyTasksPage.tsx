// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    Upload,
    Calendar,
    User,
    ArrowRight,
    Filter,
    Search
} from 'lucide-react'
import { getAuthUser } from '@/utils/apiClient'
import { fetchOrders, fetchWorkOrders } from '@/api/apiClient'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function MyTasksPage() {
    const user = getAuthUser()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, today, overdue, completed

    useEffect(() => {
        loadMyTasks()
    }, [])

    async function loadMyTasks() {
        try {
            setLoading(true)
            const workOrders = await fetchWorkOrders()

            // Filter work orders assigned to current user
            // Map them to match expected task structure
            const myTasks = workOrders
                .filter(wo => wo.assigned_to === user?.id)
                .map(wo => ({
                    ...wo,
                    id: wo.order_number || wo.order_id, // Use Order ID for display/links
                    work_order_id: wo.id, // Keep real WO ID reference
                    status: wo.order_status || wo.stage || 'pending',
                    total: wo.total_amount,
                    description: wo.notes
                }))

            setTasks(myTasks)
        } catch (err) {
            console.error('Failed to load tasks:', err)
            toast.error('Failed to load your tasks')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'in_progress':
            case 'processing':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200'
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200'
        }
    }

    const getPriorityBadge = (dueDate) => {
        if (!dueDate) return null
        const due = new Date(dueDate)
        const now = new Date()
        const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

        if (daysUntilDue < 0) {
            return <span className="text-xs font-bold text-red-600">OVERDUE</span>
        } else if (daysUntilDue === 0) {
            return <span className="text-xs font-bold text-orange-600">DUE TODAY</span>
        } else if (daysUntilDue <= 2) {
            return <span className="text-xs font-bold text-amber-600">URGENT</span>
        }
        return null
    }

    const filteredTasks = tasks.filter(task => {
        const now = new Date()
        const dueDate = task.due_date ? new Date(task.due_date) : null

        switch (filter) {
            case 'today':
                return dueDate && dueDate.toDateString() === now.toDateString()
            case 'overdue':
                return dueDate && dueDate < now && task.status !== 'completed'
            case 'completed':
                return task.status === 'completed' || task.status === 'delivered'
            default: // 'all'
                return true
        }
    })

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">My Tasks</h1>
                                <p className="text-slate-600 mt-1">Your assigned design projects and orders</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500">
                                    {filteredTasks.length} {filter === 'all' ? 'total' : filter} task{filteredTasks.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 border-b border-slate-200">
                            {[
                                { key: 'all', label: 'All', count: tasks.length },
                                {
                                    key: 'today', label: 'Due Today', count: tasks.filter(t => {
                                        const due = t.due_date ? new Date(t.due_date) : null
                                        return due && due.toDateString() === new Date().toDateString()
                                    }).length
                                },
                                {
                                    key: 'overdue', label: 'Overdue', count: tasks.filter(t => {
                                        const due = t.due_date ? new Date(t.due_date) : null
                                        return due && due < new Date() && t.status !== 'completed'
                                    }).length
                                },
                                { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-4 py-3 text-sm font-bold transition-all relative ${filter === tab.key
                                        ? 'text-indigo-600'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.key
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                    {filter === tab.key && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tasks List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                                <p className="mt-4 text-slate-600">Loading your tasks...</p>
                            </div>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-20 text-center">
                            <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {filter === 'completed' ? 'No completed tasks yet' : 'All caught up!'}
                            </h3>
                            <p className="text-slate-600">
                                {filter === 'completed'
                                    ? 'Completed tasks will appear here'
                                    : 'You have no pending tasks at the moment'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        {/* Left: Task Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    Order #{task.id}
                                                </h3>
                                                {getPriorityBadge(task.due_date)}
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                                                    {task.status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>

                                            <p className="text-slate-600 mb-4">
                                                {task.description || task.notes || 'No description provided'}
                                            </p>

                                            <div className="flex items-center gap-6 text-sm text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} />
                                                    <span>Client: {task.customer_name || task.customer || 'N/A'}</span>
                                                </div>
                                                {task.due_date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} />
                                                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} />
                                                    <span>Total: RF {Number(task.total || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex flex-col gap-2">
                                            <Link
                                                to={`/dashboard/staff/orders/${task.id}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
                                            >
                                                View Details
                                                <ArrowRight size={16} />
                                            </Link>
                                            {task.status !== 'completed' && (
                                                <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                                                    <Upload size={16} />
                                                    Upload Work
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
