// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchOrders, fetchCustomers, fetchConversations } from '@/api/apiClient';
import { MessageSquare, Users, Package, Clock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function SupportDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadConversations: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    recentOrders: [],
    recentCustomers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSupportData() {
      try {
        setLoading(true);
        setError(null);

        const [conversations, orders, customers] = await Promise.all([
          fetchConversations().catch(() => []),
          fetchOrders().catch(() => []),
          fetchCustomers().catch(() => []),
        ]);

        const conversationList = Array.isArray(conversations) ? conversations : [];
        const ordersList = Array.isArray(orders) ? orders : [];
        const customersList = Array.isArray(customers) ? customers : [];

        const unread = conversationList.filter(c => c.unread || c.status === 'unread').length;
        const pending = ordersList.filter(o =>
          ['pending', 'processing', 'in_production'].includes(o.status)
        ).length;

        const recent = ordersList
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        const recentCust = customersList
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        setStats({
          totalConversations: conversationList.length,
          unreadConversations: unread,
          pendingOrders: pending,
          totalCustomers: customersList.length,
          recentOrders: recent,
          recentCustomers: recentCust,
        });
      } catch (err: any) {
        console.error('Failed to load support dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadSupportData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Support</h1>
          <p className="text-sm text-slate-500">Respond to messages and track active orders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/communications/inbox" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm">
            <MessageSquare size={16} /> Open Inbox <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Efficient Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Unread Messages', value: stats.unreadConversations, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-white' },
          { label: 'Pending Orders', value: stats.pendingOrders, icon: Package, color: 'text-amber-600', bg: 'bg-white' },
          { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'text-emerald-600', bg: 'bg-white' },
        ].map((stat, i) => (
          <div key={i} className={`flex items-center justify-between rounded-xl border border-slate-200 ${stat.bg} p-5 shadow-sm`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{loading ? <Loader2 className="animate-spin h-5 w-5 text-slate-300" /> : stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders List */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Package size={16} className="text-slate-400" /> Recent Orders
            </h3>
            <Link to="/orders" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="p-4 space-y-2">
            {!loading && stats.recentOrders.length === 0 && <p className="text-center py-6 text-sm text-slate-400">No recent orders</p>}
            {stats.recentOrders.map((order: any) => (
              <button key={order.id} onClick={() => navigate(`/orders/${order.id}`)} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left group">
                <div>
                  <p className="text-sm font-bold text-slate-900">Order #{order.id}</p>
                  <p className="text-xs text-slate-500">{order.customer_name || 'Unknown Customer'}</p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  {order.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Customers List */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-slate-400" /> Recent Customers
            </h3>
            <Link to="/crm/customers" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="p-4 space-y-2">
            {!loading && stats.recentCustomers.length === 0 && <p className="text-center py-6 text-sm text-slate-400">No recent customers</p>}
            {stats.recentCustomers.map((customer: any) => (
              <button key={customer.id} onClick={() => navigate(`/crm/customers/${customer.id}`)} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-left group">
                <div>
                  <p className="text-sm font-bold text-slate-900">{customer.name || customer.customer_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{customer.email || customer.phone || 'No contact info'}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(customer.created_at).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

     
    </div>
  );
}
