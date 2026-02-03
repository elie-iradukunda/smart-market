// @ts-nocheck
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { currentUserHasPermission } from '@/utils/apiClient';
import { ArrowRight, MessageSquare, ClipboardList, ShoppingCart, CreditCard, Users, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ReceptionDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reception Desk</h1>
          <p className="text-sm text-slate-500">Manage walk-ins, customer inquiries, and point of sale.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/communications/inbox" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <MessageSquare size={16} /> Inbox
          </Link>
          <Link to="/pos/terminal" className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
            <CreditCard size={16} /> POS Terminal <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Efficient Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Jobs in Progress', value: '--', icon: ClipboardList, color: 'text-blue-600' },
          { label: 'Customers Waiting', value: '--', icon: Users, color: 'text-indigo-600' },
          { label: "Today's Sales", value: '--', icon: ShoppingCart, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentUserHasPermission('lead.manage') && (
          <NavButton 
            onClick={() => navigate('/crm/leads')}
            title="Leads"
            desc="Capture new walk-in & phone leads"
            icon={<Users className="w-4 h-4 text-emerald-600" />}
            color="bg-emerald-50"
          />
        )}

        {currentUserHasPermission('customer.view') && (
          <NavButton 
            onClick={() => navigate('/crm/customers')}
            title="Customers"
            desc="Look up contact history"
            icon={<Users className="w-4 h-4 text-blue-600" />}
            color="bg-blue-50"
          />
        )}

        {currentUserHasPermission('quote.manage') && (
          <NavButton 
            onClick={() => navigate('/crm/quotes')}
            title="Quotes"
            desc="Prepare front-desk pricing"
            icon={<FileText className="w-4 h-4 text-purple-600" />}
            color="bg-purple-50"
          />
        )}

        {currentUserHasPermission('order.view') && (
          <NavButton 
            onClick={() => navigate('/orders')}
            title="Orders"
            desc="Check status for walk-ins"
            icon={<ShoppingCart className="w-4 h-4 text-indigo-600" />}
            color="bg-indigo-50"
          />
        )}
      </div>

      {/* Simplified Production Link Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Production Overview</h3>
            <p className="text-sm text-slate-500 mt-1">confidence in answering customer status questions.</p>
          </div>
          <Link to="/production/work-orders" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            View Live Pipeline <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
    </DashboardLayout>

  );
}

function NavButton({ onClick, title, desc, icon, color }: any) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      </div>
      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-blue-600">
        Open Module <ArrowRight size={12} />
      </div>
    </button>
  );
}