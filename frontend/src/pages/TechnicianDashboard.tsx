// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWorkOrders, fetchMaterials } from '@/api/apiClient';
import { ArrowRight, ClipboardList, Clock, AlertTriangle, Loader2 } from 'lucide-react';

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [wo, mats] = await Promise.all([fetchWorkOrders(), fetchMaterials()]);
        setWorkOrders(wo || []);
        setMaterials(mats || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const activeJobs = workOrders.filter((wo) => wo.status !== 'completed').length;
  const dueToday = workOrders.filter((wo) => wo.due_date?.split('T')[0] === today).length;
  const lowStock = materials.filter((m) => m.current_stock <= (m.reorder_level || 0)).length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Floor</h1>
          <p className="text-sm text-slate-500">Real-time job tracking and resource monitoring.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/production/work-orders"
            className="group inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-all"
          >
            Work Orders
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Orders
          </Link>
          <Link
            to="/inventory/materials"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Materials
          </Link>
        </div>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Jobs</span>
            <ClipboardList className="text-blue-500 opacity-20" size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{loading ? <Loader2 className="animate-spin h-5 w-5" /> : activeJobs}</span>
            <Link to="/production/work-orders" className="text-[11px] font-bold text-blue-600 hover:underline">View work orders</Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Due Today</span>
            <Clock className="text-orange-500 opacity-20" size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{loading ? <Loader2 className="animate-spin h-5 w-5" /> : dueToday}</span>
            <Link to="/production/work-orders" className="text-[11px] font-bold text-orange-600 hover:underline">See today's jobs</Link>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-5 shadow-sm ring-1 ring-blue-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Materials at Risk</span>
            <AlertTriangle className="text-blue-500 opacity-20" size={20} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-900">{loading ? <Loader2 className="animate-spin h-5 w-5" /> : lowStock}</span>
            <Link to="/inventory/materials" className="text-[11px] font-bold text-blue-700 hover:underline">Check materials</Link>
          </div>
        </div>
      </div>

     
    </div>
  );
}