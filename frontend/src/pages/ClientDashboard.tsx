// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Package,
    FileText,
    Files,
    MessageSquare,
    ArrowRight,
    Clock,
    CheckCircle2,
    CircleEllipsis,
    LayoutDashboard,
    ShoppingCart,
    Bell
} from 'lucide-react'
import { getAuthUser } from '@/utils/apiClient'
import { fetchOrders, fetchQuotes } from '@/api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function ClientDashboard() {
    const user = getAuthUser()
    const [stats, setStats] = useState({
        activeOrders: 0,
        pendingQuotes: 0,
        recentOrders: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadClientData() {
            try {
                const [orders, quotes] = await Promise.allSettled([
                    fetchOrders(),
                    fetchQuotes()
                ])

                const ordersData = orders.status === 'fulfilled' ? (orders.value || []) : []
                const quotesData = quotes.status === 'fulfilled' ? (quotes.value || []) : []

                setStats({
                    activeOrders: ordersData.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
                    pendingQuotes: quotesData.filter(q => q.status === 'pending' || q.status === 'draft').length,
                    recentOrders: ordersData.slice(0, 5)
                })
            } catch (err) {
                console.error('Failed to load client dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        loadClientData()
    }, [])

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#FDFDFF]">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Welcome Header */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-10 shadow-2xl mb-10">
                        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-[100px] opacity-30">
                            <div className="h-64 w-64 rounded-full bg-indigo-400"></div>
                        </div>
                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 border border-white/20">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Customer Portal</span>
                                </div>
                                <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight">
                                    Welcome back, <span className="text-indigo-200">{user?.name?.split(' ')[0] || 'Friend'}</span>!
                                </h1>
                                <p className="max-w-xl text-lg text-indigo-100 leading-relaxed font-medium">
                                    Track your active orders and manage your purchases all in one place.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <Link to="/client/orders" className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-xl shadow-indigo-900/20">
                                        My Orders
                                    </Link>
                                    {/* Contact Support removed */}
                                </div>
                            </div>

                            {/* Loyalty / Status Card */}
                            <div className="rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 p-8 min-w-[300px]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                        <ShoppingCart size={20} />
                                    </div>
                                    <Bell size={20} className="text-white/60" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">Active Requests</p>
                                    <p className="text-4xl font-black text-white">{stats.activeOrders + (![4, 13].includes(Number(user?.role_id)) ? stats.pendingQuotes : 0)}</p>
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <div className="flex-1 rounded-xl bg-white/10 p-3">
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase">Orders</p>
                                        <p className="text-xl font-black text-white">{stats.activeOrders}</p>
                                    </div>
                                    {![4, 13].includes(Number(user?.role_id)) && (
                                        <div className="flex-1 rounded-xl bg-white/10 p-3">
                                            <p className="text-[10px] font-bold text-indigo-200 uppercase">Quotes</p>
                                            <p className="text-xl font-black text-white">{stats.pendingQuotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Recent Activity */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
                                        <p className="text-sm text-slate-500">The latest status of your purchase history.</p>
                                    </div>
                                    <Link to="/client/orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All →</Link>
                                </div>

                                <div className="divide-y divide-slate-50">
                                    {loading ? (
                                        <div className="p-12 text-center text-slate-400 animate-pulse">Loading your history...</div>
                                    ) : stats.recentOrders.length > 0 ? (
                                        stats.recentOrders.map((order) => (
                                            <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Order #{order.id}</p>
                                                        <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="hidden sm:block text-right">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Total</p>
                                                        <p className="font-black text-slate-900 font-mono">RF {Number(order.total || order.total_amount).toLocaleString()}</p>
                                                    </div>
                                                    <span className={`rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'processing' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <Link to={`/client/orders/${order.id}`} className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                                        <ArrowRight size={16} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-20 text-center flex flex-col items-center">
                                            <CircleEllipsis size={48} className="text-slate-200 mb-4" />
                                            <p className="text-slate-500 font-medium">No orders found.</p>
                                            <Link to="/products" className="text-indigo-600 font-bold text-sm mt-2">Browse the shop →</Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Action Widget: Quote or Shop */}
                            {![4, 13].includes(Number(user?.role_id)) ? (
                                <div className="rounded-[2.5rem] bg-indigo-950 p-8 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 transition-transform group-hover:scale-125">
                                        <div className="h-64 w-64 rounded-full bg-white"></div>
                                    </div>
                                    <div className="relative">
                                        <h3 className="text-2xl font-black mb-2">Need a Custom Quote?</h3>
                                        <p className="text-indigo-200 max-w-md mb-6">Tell us about your next project and our design team will get back to you with a professional estimate within 24 hours.</p>
                                        <Link to="/communications/inbox" className="inline-flex items-center gap-2 bg-white text-indigo-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
                                            <MessageSquare size={16} /> Start a Conversation
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 transition-transform group-hover:scale-125">
                                        <div className="h-64 w-64 rounded-full bg-white"></div>
                                    </div>
                                    <div className="relative">
                                        <h3 className="text-2xl font-black mb-2">Ready to Shop?</h3>
                                        <p className="text-blue-100 max-w-md mb-6">Explore our catalog of premium products and design services.</p>
                                        <Link to="/products" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all">
                                            <ShoppingCart size={16} /> Shop Now
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar Actions */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* Client Quick Links */}
                            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8">
                                <h4 className="text-lg font-black text-slate-900 mb-6">Quick Actions</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: 'My Invoices', path: '/client/orders', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Project Files', path: '/client/files', icon: Files, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                        { label: 'Active Quotes', path: '/client/quotes', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { label: 'Support Inbox', path: '/communications/inbox', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    ].filter(item => {
                                        // Hide 'Active Quotes', 'Project Files', and 'Support Inbox' for Customer (13) and Client (4)
                                        if ([4, 13].includes(Number(user?.role_id))) {
                                            if (item.label === 'Active Quotes') return false;
                                            if (item.label === 'Project Files') return false;
                                            if (item.label === 'Support Inbox') return false;
                                        }
                                        return true;
                                    })
                                        .map((item, i) => (
                                            <Link key={i} to={item.path} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-white hover:border-indigo-100 hover:shadow-md transition-all group">
                                                <div className={`h-10 w-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <item.icon size={18} />
                                                </div>
                                                <span className="font-bold text-slate-700">{item.label}</span>
                                                <ArrowRight className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={14} />
                                            </Link>
                                        ))}
                                </div>
                            </div>

                            {/* Status Tracking Alert */}
                            <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-indigo-900 p-8 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="text-indigo-400" />
                                    <h4 className="font-bold">Next Milestone</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="border-l-2 border-indigo-500 pl-4 py-1">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">ORDER #8821</p>
                                        <p className="text-sm font-bold">Graphic Design Finalization</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Expected completion: Tomorrow, 2:00 PM</p>
                                    </div>
                                    <div className="h-px bg-white/10 w-full"></div>
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <CheckCircle2 size={16} />
                                        <span className="text-xs font-bold uppercase">PAYMENT VERIFIED</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </DashboardLayout>
    )
}
