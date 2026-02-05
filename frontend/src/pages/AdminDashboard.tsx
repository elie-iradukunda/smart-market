// @ts-nocheck
import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  ArrowRight,
  ShieldCheck,
  Settings,
  Users,
  Activity,
  DollarSign,
  Package,
  LayoutDashboard,
  Lock,
  History,
  TrendingUp,
  Briefcase
} from 'lucide-react'

import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import JobPipelineOverview from '../modules/dashboards/components/JobPipelineOverview'
import StockAlerts from '../modules/dashboards/components/StockAlerts'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'

export default function AdminDashboard() {
  const adminLinks = [
    { label: 'Security & Access', path: '/dashboard/admin/users', icon: ShieldCheck, desc: 'Manage users, roles and strict permissions.' },
    { label: 'Configuration', path: '/dashboard/admin/system-settings', icon: Settings, desc: 'Modify global variables and business rules.' },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="relative rounded-3xl bg-slate-900 p-8 shadow-sm mb-8">
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Executive Command Center</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Platform <span className="text-blue-400">Overseer</span>
          </h1>
          <p className="max-w-md text-slate-400 text-sm">
            Complete administrative control over revenue streams, production flows, and system-wide security.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/dashboard/admin/users" className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors">
              <Users size={16} /> Manage Personnel
            </Link>
            <Link to="/dashboard/admin/system-settings" className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
              <Settings size={16} /> Global Config
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4 min-w-[140px]">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Activity size={16} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">System Load</span>
            </div>
            <p className="text-2xl font-bold text-white">99.9%</p>
            <p className="text-[10px] font-bold text-emerald-400 mt-1 uppercase">Operational</p>
          </div>
          <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4 min-w-[140px]">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Lock size={16} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Access Control</span>
            </div>
            <p className="text-2xl font-bold text-white">54</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Defined Rules</p>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      <div className="lg:col-span-8 space-y-6">
        {/* Financial Performance */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Revenue Performance</h3>
                <p className="text-xs text-slate-500">Consolidated financial data.</p>
              </div>
            </div>
            <Link to="/dashboard/admin/finance/invoices" className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors">Full Report →</Link>
          </div>
          <div className="p-4">
            <RevenueOverview />
          </div>
        </div>

        {/* Pipeline & Strategy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-indigo-600" size={20} />
              <h4 className="font-bold text-slate-900">Production Velocity</h4>
            </div>
            <JobPipelineOverview />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="text-emerald-600" size={20} />
              <h4 className="font-bold text-slate-900">Campaign Impact</h4>
            </div>
            <CampaignPerformanceWidget />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        {/* Inventory Risk */}
        <div className="rounded-3xl border border-amber-100 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-amber-50 bg-amber-50/50 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Inventory Risk</h3>
              <p className="text-[10px] text-amber-600 font-bold uppercase">Stock Out Prediction</p>
            </div>
          </div>
          <div className="p-2">
            <StockAlerts />
          </div>
        </div>

        {/* Admin Toolset */}
        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="text-blue-400" size={20} /> Administrative Tools
          </h3>
          <div className="space-y-3">
            {adminLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-slate-700 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <link.icon size={14} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xs text-white">{link.label}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="mt-1 text-slate-600 group-hover:text-blue-400 transition-colors" size={12} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    </DashboardLayout>
  )
}