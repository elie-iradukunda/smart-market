// @ts-nocheck
import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { clearAuth } from '@/utils/apiClient'
import StockAlerts from '../modules/dashboards/components/StockAlerts'

export default function InventoryDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-lime-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top bar with logout */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500">Inventory</h2>
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
              <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Inventory management</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Keep materials
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-lime-600"> available, not expensive</span>
              </h1>
              <p className="mt-4 text-base text-gray-600 max-w-2xl">
                Watch low stock, critical SKUs, and purchase needs so the production team never waits for
                materials.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <Link
                to="/inventory/materials"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Materials
              </Link>
              <Link
                to="/inventory/purchase-orders"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Purchase orders
              </Link>
              <Link
                to="/finance/reports"
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
              >
                Inventory report
              </Link>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/4484072/pexels-photo-4484072.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Inventory manager checking stock"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-200">Inventory snapshot</p>
              <p className="mt-2 text-base text-gray-100 max-w-sm">
                Instantly see which materials are at risk so you can create purchase orders before jobs stop.
              </p>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <StockAlerts />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
