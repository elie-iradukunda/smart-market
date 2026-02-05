// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Factory,
    Package,
    ClipboardList,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Loader2,
    Settings,
    MessagesSquare,
    BarChart3,
    Users
} from 'lucide-react'
import { fetchWorkOrders, fetchOrders } from '@/api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'

export default function StaffDashboard() {
    const [stats, setStats] = useState({
        activeWorkOrders: 0,
        ordersInProduction: 0,
        completedToday: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            try {
                const [wo, ord] = await Promise.allSettled([
                    fetchWorkOrders(),
                    fetchOrders()
                ])

                const woData = wo.status === 'fulfilled' ? (wo.value || []) : []
                const ordData = ord.status === 'fulfilled' ? (ord.value || []) : []

                const activeWO = woData.filter(w => w.status !== 'completed' && w.status !== 'cancelled').length
                const inProd = ordData.filter(o => o.status === 'in_production' || o.status === 'processing').length

                const today = new Date().toISOString().split('T')[0]
                const doneToday = woData.filter(w => w.status === 'completed' && (w.completed_at || w.updated_at)?.startsWith(today)).length

                setStats({
                    activeWorkOrders: activeWO,
                    ordersInProduction: inProd,
                    completedToday: doneToday
                })
            } catch (err) {
                console.error('Failed to load staff stats:', err)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    const cards = [
        { label: 'Active Tasks', value: stats.activeWorkOrders, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'In Production', value: stats.ordersInProduction, icon: Factory, color: 'text-sky-600', bg: 'bg-sky-50' },
        { label: 'Completed Today', value: stats.completedToday, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ]

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Hero / Header Section */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 shadow-2xl mb-8">
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20">
                            <div className="h-64 w-64 rounded-full bg-indigo-500"></div>
                        </div>
                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Live Operation Monitor</span>
                                </div>
                                <h1 className="text-3xl font-black text-white sm:text-4xl">Staff Operational Hub</h1>
                                <p className="mt-2 max-w-xl text-sm text-slate-400">
                                    Track real-time production status, manage active tasks, and monitor raw materials.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link to="/dashboard/staff/tasks" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                                    <ClipboardList size={16} /> My Tasks
                                </Link>
                                <Link to="/dashboard/staff/production/work-orders" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                                    <Factory size={16} /> Production Management
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                        {cards.map((card, i) => (
                            <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{card.label}</p>
                                        {loading ? (
                                            <div className="h-8 w-16 animate-pulse bg-slate-100 rounded-lg"></div>
                                        ) : (
                                            <p className="text-3xl font-black text-slate-900">{card.value}</p>
                                        )}
                                    </div>
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                                        <card.icon size={24} />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                                    VIEW DETAILS <ArrowRight size={10} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left: Pipeline */}
                        <div className="lg:col-span-12 space-y-8">
                            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 size={18} className="text-indigo-600" />
                                        <h3 className="font-bold text-slate-900">Job Pipeline Status</h3>
                                    </div>
                                </div>
                                <div className="p-2 bg-white">
                                    {/* Note: Components have their own cards, so we need to be careful with double borders */}
                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                        .dashboard-embed > div { border: none !important; box-shadow: none !important; background: transparent !important; }
                      `}} />
                                    <div className="dashboard-embed">
                                        <JobPipelineOverview />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Access Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link to="/dashboard/staff/inventory/materials" className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Production Materials</h4>
                                        <p className="text-xs text-slate-500">Track and manage raw material stock</p>
                                    </div>
                                </Link>
                                <Link to="/dashboard/staff/reports/operations" className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                                    <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <BarChart3 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Operations Reports</h4>
                                        <p className="text-xs text-slate-500">Analyze performance and efficiency</p>
                                    </div>
                                </Link>
                            </div>
                        </div>


                    </div>

                </div>
            </div>
        </DashboardLayout>
    )
}
