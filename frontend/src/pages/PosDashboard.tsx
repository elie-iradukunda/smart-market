// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchPOSSales, fetchMaterials } from '@/api/apiClient'
import { ShoppingCart, DollarSign, Package, Loader, AlertTriangle } from 'lucide-react'

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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">POS Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Point of Sale overview and quick actions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100 hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Today's Sales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todaySalesCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-green-100 hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Today's Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-pink-100 hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-full mr-4">
              <Package className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats.availableProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/pos/terminal"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Open POS Terminal
          </Link>
          <Link
            to="/pos/history"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 hover:border-purple-300 transition"
          >
            View Sales History
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
