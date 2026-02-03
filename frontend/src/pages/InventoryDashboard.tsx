// @ts-nocheck
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StockAlerts from '../modules/dashboards/components/StockAlerts';
import { createMaterial } from '@/api/apiClient';
import { currentUserHasPermission } from '@/utils/apiClient';
import { Plus, ArrowRight, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
export default function InventoryDashboard() {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreateMaterial = currentUserHasPermission('material.create');

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateMaterial) return;
    setSaving(true);
    setError(null);
    try {
      await createMaterial({
        name,
        unit,
        category,
        reorder_level: reorderLevel === '' ? null : Number(reorderLevel),
      });
      setName('');
      setUnit('');
      setCategory('');
      setReorderLevel('');
    } catch (err: any) {
      setError(err.message || 'Failed to create material');
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Low Stock Items', value: '12', icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Stock Value', value: 'RF 45.2k', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Pending POs', value: '5', icon: DollarSign, color: 'text-blue-600' },
  ];

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Overview</h1>
          <p className="text-sm text-slate-500">Track material availability and procurement.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/inventory/materials" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            Materials
          </Link>
          <Link to="/inventory/purchase-orders" className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
            Purchase Orders <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stock Alerts Widget */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Stock Alerts</h3>
            <Link to="/inventory/reports" className="text-xs font-bold text-emerald-600 hover:underline">View Reports</Link>
          </div>
          <div className="p-4">
            <StockAlerts />
          </div>
        </div>

        {/* Quick Add Form */}
        {canCreateMaterial && (
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-fit">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-700">Quick Add Material</h3>
            </div>
            <div className="p-5">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
              <form onSubmit={handleCreateMaterial} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Unit</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="kg"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Level</label>
                    <input
                      type="number"
                      value={reorderLevel}
                      onChange={(e) => setReorderLevel(e.target.value)}
                      placeholder="Min"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Create Material'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}