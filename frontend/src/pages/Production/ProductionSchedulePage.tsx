// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWorkOrders } from '@/api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Calendar, Clock, User, AlertCircle, ChevronLeft, ChevronRight, Loader2, Wrench } from 'lucide-react'

export default function ProductionSchedulePage() {
    const navigate = useNavigate()
    const [workOrders, setWorkOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setError(null)

        fetchWorkOrders()
            .then((data) => {
                if (!isMounted) return
                setWorkOrders(Array.isArray(data) ? data : [])
            })
            .catch((err) => {
                if (!isMounted) return
                setError(err.message || 'Failed to load work orders')
            })
            .finally(() => {
                if (!isMounted) return
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

    // Get start and end dates for current view
    const getViewDates = () => {
        const start = new Date(currentDate)
        if (viewMode === 'week') {
            // Start of week (Monday)
            const day = start.getDay()
            const diff = start.getDate() - day + (day === 0 ? -6 : 1)
            start.setDate(diff)
            start.setHours(0, 0, 0, 0)
            const end = new Date(start)
            end.setDate(end.getDate() + 6)
            end.setHours(23, 59, 59, 999)
            return { start, end }
        } else {
            // Start of month
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
            end.setHours(23, 59, 59, 999)
            return { start, end }
        }
    }

    // Group work orders by date
    const groupedWorkOrders = useMemo(() => {
        const { start, end } = getViewDates()
        const grouped: Record<string, any[]> = {}
        
        workOrders.forEach((wo) => {
            // Try to get date from various fields
            let dateStr = wo.due_date || wo.expected_completion || wo.created_at || wo.updated_at
            if (!dateStr) return
            
            // Parse date
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return
            
            // Check if date is within view range
            if (date >= start && date <= end) {
                const key = date.toISOString().split('T')[0]
                if (!grouped[key]) {
                    grouped[key] = []
                }
                grouped[key].push(wo)
            }
        })
        
        return grouped
    }, [workOrders, currentDate, viewMode])

    // Get all dates in current view
    const getViewDatesList = () => {
        const { start, end } = getViewDates()
        const dates: Date[] = []
        const current = new Date(start)
        
        while (current <= end) {
            dates.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
        
        return dates
    }

    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        }
        setCurrentDate(newDate)
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || ''
        if (statusLower === 'complete' || statusLower === 'completed') {
            return 'bg-green-100 text-green-700 border-green-300'
        }
        if (statusLower === 'print' || statusLower === 'printing') {
            return 'bg-blue-100 text-blue-700 border-blue-300'
        }
        if (statusLower === 'pending') {
            return 'bg-amber-100 text-amber-700 border-amber-300'
        }
        return 'bg-purple-100 text-purple-700 border-purple-300'
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        })
    }

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    const datesList = getViewDatesList()

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Production Schedule</p>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                                    Work Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Timeline</span>
                                </h1>
                                <p className="mt-2 text-base text-gray-600 max-w-2xl">
                                    View and manage work orders scheduled for production.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigateDate('prev')}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Previous"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={goToToday}
                                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => navigateDate('next')}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Next"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="ml-4 text-lg font-semibold text-gray-900">
                                    {viewMode === 'week' 
                                        ? `Week of ${formatDate(datesList[0])}`
                                        : formatMonthYear(currentDate)
                                    }
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        viewMode === 'week'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        viewMode === 'month'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Month
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Schedule View */}
                    {loading ? (
                        <div className="rounded-3xl border border-gray-100 bg-white p-12 shadow-xl flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
                            <span className="text-gray-600">Loading schedule...</span>
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-gray-100 bg-white shadow-xl overflow-hidden">
                            {viewMode === 'week' ? (
                                <div className="grid grid-cols-7 divide-x divide-gray-200">
                                    {datesList.map((date, idx) => {
                                        const dateKey = date.toISOString().split('T')[0]
                                        const dayWorkOrders = groupedWorkOrders[dateKey] || []
                                        const isToday = dateKey === new Date().toISOString().split('T')[0]
                                        
                                        return (
                                            <div
                                                key={idx}
                                                className={`min-h-[400px] p-3 ${isToday ? 'bg-indigo-50/50' : 'bg-white'}`}
                                            >
                                                <div className={`text-center mb-3 pb-2 ${isToday ? 'border-b-2 border-indigo-500' : 'border-b border-gray-200'}`}>
                                                    <div className="text-xs font-semibold text-gray-500 uppercase">
                                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                    </div>
                                                    <div className={`text-lg font-bold mt-1 ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                                                        {date.getDate()}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {dayWorkOrders.map((wo) => (
                                                        <div
                                                            key={wo.id}
                                                            onClick={() => navigate(`/production/work-orders/${wo.id}`)}
                                                            className="p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all bg-white hover:border-indigo-300"
                                                        >
                                                            <div className="flex items-start justify-between mb-1">
                                                                <span className="text-xs font-mono text-gray-500">#{wo.id}</span>
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(wo.status)}`}>
                                                                    {wo.status || 'Pending'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs font-medium text-gray-900 truncate">
                                                                {wo.customer || wo.customer_name || wo.job_name || 'N/A'}
                                                            </div>
                                                            {wo.technician && (
                                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                                                    <User className="w-3 h-3" />
                                                                    {wo.technician}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {dayWorkOrders.length === 0 && (
                                                        <div className="text-xs text-gray-400 text-center py-4">
                                                            No work orders
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-6">
                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                                            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {datesList.map((date, idx) => {
                                            const dateKey = date.toISOString().split('T')[0]
                                            const dayWorkOrders = groupedWorkOrders[dateKey] || []
                                            const isToday = dateKey === new Date().toISOString().split('T')[0]
                                            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                                            
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`min-h-[100px] p-2 rounded-lg border ${
                                                        isToday
                                                            ? 'bg-indigo-100 border-indigo-300'
                                                            : isCurrentMonth
                                                            ? 'bg-white border-gray-200'
                                                            : 'bg-gray-50 border-gray-100'
                                                    }`}
                                                >
                                                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-indigo-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {date.getDate()}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {dayWorkOrders.slice(0, 3).map((wo) => (
                                                            <div
                                                                key={wo.id}
                                                                onClick={() => navigate(`/production/work-orders/${wo.id}`)}
                                                                className="text-[10px] p-1 rounded bg-white border border-gray-200 cursor-pointer hover:border-indigo-300 hover:shadow-sm truncate"
                                                                title={`#${wo.id} - ${wo.customer || wo.customer_name || 'N/A'}`}
                                                            >
                                                                <span className="font-mono text-gray-500">#{wo.id}</span>
                                                                <span className="ml-1 text-gray-700 truncate">
                                                                    {wo.customer || wo.customer_name || 'N/A'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {dayWorkOrders.length > 3 && (
                                                            <div className="text-[10px] text-indigo-600 font-medium text-center">
                                                                +{dayWorkOrders.length - 3} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary Stats */}
                    {!loading && !error && (
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Total Scheduled</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {Object.values(groupedWorkOrders).reduce((sum, orders) => sum + orders.length, 0)}
                                        </p>
                                    </div>
                                    <Calendar className="w-8 h-8 text-indigo-500" />
                                </div>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Active Work Orders</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {workOrders.filter(wo => {
                                                const status = wo.status?.toLowerCase() || ''
                                                return status !== 'complete' && status !== 'completed' && status !== 'cancelled'
                                            }).length}
                                        </p>
                                    </div>
                                    <Wrench className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">This {viewMode === 'week' ? 'Week' : 'Month'}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {Object.values(groupedWorkOrders).reduce((sum, orders) => sum + orders.length, 0)}
                                        </p>
                                    </div>
                                    <Clock className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>
                            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Completed</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">
                                            {workOrders.filter(wo => {
                                                const status = wo.status?.toLowerCase() || ''
                                                return status === 'complete' || status === 'completed'
                                            }).length}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-green-600 text-xs font-bold">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

