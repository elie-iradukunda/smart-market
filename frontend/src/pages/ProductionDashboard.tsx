// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchWorkOrders, fetchOrders } from '@/api/apiClient';
import { currentUserHasPermission } from '@/utils/apiClient';
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview';
import StockAlerts from '../modules/dashboards/components/StockAlerts';
import { ClipboardList, Package, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function ProductionDashboard() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [woData, ordersData] = await Promise.allSettled([
          fetchWorkOrders(),
          fetchOrders(),
        ]);
        setWorkOrders(woData.status === 'fulfilled' ? (woData.value || []) : []);
        setOrders(ordersData.status === 'fulfilled' ? (ordersData.value || []) : []);
      } catch (err) {
        console.error('Failed to load production data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeWorkOrders = workOrders.filter((wo) => wo.status !== 'completed' && wo.status !== 'cancelled').length;
  const ordersInProduction = orders.filter((o) => o.status === 'in_production' || o.status === 'processing').length;
  const today = new Date().toISOString().split('T')[0];
  const completedToday = workOrders.filter((wo) => {
    if (wo.status !== 'completed') return false;
    const completedDate = wo.completed_at || wo.updated_at;
    return completedDate?.startsWith(today);
  }).length;

  const stats = [
    { label: 'Active Work Orders', value: activeWorkOrders, icon: ClipboardList, color: 'text-blue-600' },
    { label: 'Orders in Production', value: ordersInProduction, icon: Package, color: 'text-indigo-600' },
    { label: 'Completed Today', value: completedToday, icon: CheckCircle2, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Control</h1>
          <p className="text-sm text-slate-500">Real-time floor overview and inventory status.</p>
        </div>
        <div className="flex items-center gap-2">
          {currentUserHasPermission('workorder.view') && (
            <Link to="/production/work-orders" className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
              Work Orders <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                ) : (
                  <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                )}
              </div>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-700">Job Pipeline Overview</h3>
          </div>
          <div className="p-4">
            <JobPipelineOverview />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-700">Inventory Stock Alerts</h3>
          </div>
          <div className="p-4">
            <StockAlerts />
          </div>
        </div>
      </div>
    </div>
  );
}