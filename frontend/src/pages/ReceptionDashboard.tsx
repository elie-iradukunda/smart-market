// @ts-nocheck
import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { currentUserHasPermission } from '@/utils/apiClient'
import ReceptionDashboardLayout from '@/components/layout/ReceptionDashboardLayout'
import { ArrowRight, MessageSquare, ClipboardList, ShoppingCart, CreditCard, Users, FileText } from 'lucide-react'

export default function ReceptionDashboard() {
  const navigate = useNavigate()

  return (
    <ReceptionDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header section - Responsive grid */}
            <div className="grid gap-6 lg:grid-cols-[1.8fr,1fr] items-stretch">
              {/* Main Welcome Card */}
              <div className="rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/50 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Reception Desk</p>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                    Welcome guests &amp;{' '}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                      keep jobs flowing
                    </span>
                  </h1>
                  <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                    See today's production pipeline and sales at a glance so reception can answer customer questions confidently and keep work moving.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    to="/communications/inbox"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-700 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Inbox
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/production/work-orders"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-blue-50 hover:bg-blue-100 px-4 py-2 text-xs sm:text-sm font-medium text-blue-700 border border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Work Orders
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/orders"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-indigo-50 hover:bg-indigo-100 px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 border border-indigo-200/50 hover:border-indigo-300 transition-all duration-200 hover:shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Orders
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/pos/terminal"
                    className="group inline-flex items-center gap-2 rounded-lg sm:rounded-full bg-purple-50 hover:bg-purple-100 px-4 py-2 text-xs sm:text-sm font-medium text-purple-700 border border-purple-200/50 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
                  >
                    <CreditCard className="w-4 h-4" />
                    POS Terminal
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>

                {/* Key Metrics */}
                <dl className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-3 text-sm">
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Jobs in Progress</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">--</dd>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 sm:px-4 py-3 border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow">
                    <dt className="text-xs font-medium text-gray-500">Customers Waiting</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">--</dd>
                  </div>
                  <div className="rounded-xl bg-emerald-50/90 px-3 sm:px-4 py-3 border border-emerald-200/80 shadow-md hover:shadow-lg transition-shadow ring-1 ring-emerald-500/10">
                    <dt className="text-xs font-medium text-emerald-700">Today's Sales</dt>
                    <dd className="mt-1 text-xl sm:text-2xl font-bold text-emerald-800">--</dd>
                  </div>
                </dl>
              </div>

              {/* Image Card - Hidden on mobile */}
              <div className="hidden md:block rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-200/80 bg-gradient-to-br from-emerald-900 to-teal-900 shadow-2xl relative group">
                <img
                  src="https://images.pexels.com/photos/8867435/pexels-photo-8867435.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Reception helping a customer"
                  className="h-full w-full object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 w-fit">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/90">Front Desk</p>
                  </div>
                  <p className="text-sm lg:text-base font-medium text-white/95 max-w-sm leading-relaxed">
                    Quickly check job status and today's revenue so you can respond to walk-ins, calls, and WhatsApp messages in seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick access row - Responsive grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {currentUserHasPermission('lead.manage') && (
                <button
                  type="button"
                  onClick={() => navigate('/crm/leads')}
                  className="group rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 text-left shadow-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                        <Users className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Leads</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Capture new walk-in & phone leads</p>
                  </div>
                  <span className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Go to leads <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}

              {currentUserHasPermission('customer.view') && (
                <button
                  type="button"
                  onClick={() => navigate('/crm/customers')}
                  className="group rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 text-left shadow-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Customers</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Look up customer contacts & history</p>
                  </div>
                  <span className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Go to customers <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}

              {currentUserHasPermission('quote.manage') && (
                <button
                  type="button"
                  onClick={() => navigate('/crm/quotes')}
                  className="group rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 text-left shadow-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Quotes</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Prepare front-desk price quotes</p>
                  </div>
                  <span className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Go to quotes <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}

              {currentUserHasPermission('order.view') && (
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="group rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm px-5 py-4 text-left shadow-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                        <ShoppingCart className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Orders</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Check order status while customer waits</p>
                  </div>
                  <span className="mt-3 text-xs text-emerald-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Go to orders <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ReceptionDashboardLayout>
  )
}
