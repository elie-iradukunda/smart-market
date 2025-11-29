// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading POS data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <AlertTriangle className="w-6 h-6 mr-2" />
        {error}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">POS Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 bg-blue-100 rounded-full mr-4">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Today's Sales</p>
            <p className="text-2xl font-bold text-gray-900">{stats.todaySalesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 bg-green-100 rounded-full mr-4">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Today's Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 bg-purple-100 rounded-full mr-4">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Available Products</p>
            <p className="text-2xl font-bold text-gray-900">{stats.availableProducts}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          to="/dashboard/sales"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Sales Dashboard
        </Link>
        <Link
          to="/pos/history"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          View Sales History
        </Link>
      </div>
    </div>
  )
}
