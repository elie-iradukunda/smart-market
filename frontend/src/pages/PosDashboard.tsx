// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchPOSSales, fetchMaterials } from '@/api/apiClient'
import { ShoppingCart, DollarSign, Package, Loader, AlertTriangle, ArrowRight } from 'lucide-react'

export default function PosDashboard() {
  const [sales, setSales] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState({
    todaySalesCount: 0,
    todayRevenue: 0,
    availableProducts: 0,
  })

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([fetchPOSSales(), fetchMaterials()])
      .then(([salesData, materialsData]) => {
        if (!isMounted) return

        const salesList = salesData || []
        const materialsList = materialsData || []

        setSales(salesList)
        setMaterials(materialsList)

        const todayStr = new Date().toISOString().slice(0, 10)
        let todaySalesCount = 0
        let todayRevenue = 0

        salesList.forEach((s: any) => {
          const created = new Date(s.created_at)
          if (Number.isNaN(created.getTime())) return

          const dateStr = created.toISOString().slice(0, 10)
          const total = Number(s.total) || 0

          if (dateStr === todayStr) {
            todaySalesCount += 1
            todayRevenue += total
          }
        })

        const availableProducts = materialsList.filter(
          (m: any) => m.current_stock > 0
        ).length

        setStats({ todaySalesCount, todayRevenue, availableProducts })
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load POS data')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mr-3" />
          <span className="text-gray-600 font-medium">Loading POS data...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-red-600">
          <AlertTriangle className="w-6 h-6 mr-2" />
          {error}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 lg:space-y-8">
            {/* Header section */}
            <div className="rounded-2xl lg:rounded-3xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200/50 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">Point of Sale</p>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 leading-tight">
                POS{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600">
                  Dashboard
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                Point of Sale overview and quick actions for managing retail transactions.
              </p>
            </div>

            {/* Stats Cards - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="group relative rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600"></div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Today's Sales</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 transition-transform duration-300 group-hover:scale-105">
                      {stats.todaySalesCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="group relative rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Today's Revenue</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 transition-transform duration-300 group-hover:scale-105">
                      ${stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="group relative rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-600"></div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Available Products</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 transition-transform duration-300 group-hover:scale-105">
                      {stats.availableProducts}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-50 group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl lg:rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/pos/terminal"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Open POS Terminal
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link
                  to="/pos/sales-history"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg sm:rounded-xl font-semibold border-2 border-gray-300 hover:bg-gray-50 hover:border-purple-300 transition-all duration-200"
                >
                  View Sales History
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
