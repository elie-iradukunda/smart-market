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
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Executive Header */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-10 shadow-2xl mb-10">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-[100px] opacity-30">
              <div className="h-80 w-80 rounded-full bg-blue-500"></div>
            </div>
            <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-24 blur-[100px] opacity-20">
              <div className="h-64 w-64 rounded-full bg-indigo-500"></div>
            </div>

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 backdrop-blur-md">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-100">Executive Command Center</span>
                </div>
                <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight">
                  Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Overseer</span>
                </h1>
                <p className="max-w-xl text-lg text-slate-400 leading-relaxed font-medium">
                  Complete administrative control over revenue streams, production flows, and system-wide security.
                </p>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link to="/dashboard/admin/users" className="group flex items-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-all shadow-xl shadow-white/5">
                    <Users size={18} /> Manage Personnel
                  </Link>
                  <Link to="/dashboard/admin/system-settings" className="group flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-all">
                    <Settings size={18} /> Global Config
                  </Link>
                </div>
              </div>

              {/* High-Level Overview Cards */}
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="rounded-[1.5rem] bg-white/5 border border-white/10 p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3 text-blue-400 mb-2">
                    <Activity size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">System Load</span>
                  </div>
                  <p className="text-2xl font-black text-white">99.9%</p>
                  <p className="text-[10px] font-semibold text-emerald-400 mt-1">OPERATIONAL</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/5 border border-white/10 p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3 text-indigo-400 mb-2">
                    <Lock size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Access Control</span>
                  </div>
                  <p className="text-2xl font-black text-white">54</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">DEFINED RULES</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-8 space-y-8">

              {/* Financial Performance Section */}
              <div className="rounded-[2.5rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Revenue Performance</h3>
                      <p className="text-sm text-slate-500">Consolidated financial data across all sales channels.</p>
                    </div>
                  </div>
                  <Link to="/dashboard/admin/finance/invoices" className="rounded-xl px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all">Full Report →</Link>
                </div>
                <div className="p-4">
                  <RevenueOverview />
                </div>
              </div>

              {/* Pipeline & Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="text-indigo-600" size={24} />
                    <h4 className="font-bold text-slate-900">Production Velocity</h4>
                  </div>
                  <JobPipelineOverview />
                </div>
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <Briefcase className="text-emerald-600" size={24} />
                    <h4 className="font-bold text-slate-900">Campaign Impact</h4>
                  </div>
                  <CampaignPerformanceWidget />
                </div>
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-8">

              {/* Stock Security Widget */}
              <div className="rounded-[2.5rem] border border-amber-100 bg-white shadow-sm overflow-hidden">
                <div className="p-8 border-b border-amber-50 bg-amber-50/20 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 font-mono">Inventory Risk</h3>
                    <p className="text-sm text-amber-600 font-semibold tracking-tighter">STOCK OUT PREDICTION</p>
                  </div>
                </div>
                <div className="p-2">
                  <StockAlerts />
                </div>
              </div>

              {/* Admin Toolset */}
              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white relative overflow-hidden group">
                <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-blue-500/20 rounded-full blur-3xl transition-transform group-hover:scale-125"></div>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-blue-400" /> Administrative Tools
                </h3>
                <div className="space-y-4">
                  {adminLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.path}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group/item"
                    >
                      <div className="mt-1 h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                        <link.icon size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{link.label}</p>
                        <p className="text-[10px] text-slate-500 leading-tight mt-1">{link.desc}</p>
                      </div>
                      <ArrowRight className="ml-auto mt-1 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-blue-400" size={14} />
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