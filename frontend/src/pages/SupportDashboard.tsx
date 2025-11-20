// @ts-nocheck
import React from 'react'
import { useNavigate,Link } from 'react-router-dom'
import { clearAuth } from '@/utils/apiClient'
import InboxPage from './Communications/InboxPage'

export default function SupportDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/50 via-white to-indigo-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top bar with logout */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500">Support</h2>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 rounded-full px-3 py-1 border border-red-100 bg-red-50/60 hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>

        {/* Header section */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">Customer support</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Reply faster to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-600"> every customer message</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                See the shared inbox and active conversations so support agents never miss an important request.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link
                to="/communications/inbox"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Inbox
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Orders
              </Link>
              <Link
                to="/crm/customers"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Customers
              </Link>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/8867438/pexels-photo-8867438.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Support agent assisting a customer"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-indigo-200">Support snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Work from a single inbox for email, SMS, and WhatsApp and respond with full context.
              </p>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <InboxPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
