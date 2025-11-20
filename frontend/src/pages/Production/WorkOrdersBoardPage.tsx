// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchDemoOrders } from '../../api/apiClient'

export default function WorkOrdersBoardPage() {
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchDemoOrders()
      .then((data) => {
        if (!isMounted) return
        setWorkOrders(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load work orders')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Helper function to color the stage tag
  const getStageColor = (stage) => {
    switch (stage) {
      case 'Design':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Print':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Finish':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'QC': // Quality Control
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Complete':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Production Management</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Work Orders</span>
        </h1>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <p className="text-gray-600">Total Active Jobs: <span className="font-bold text-gray-800">12</span></p>
          <button className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-md hover:bg-blue-700 transition duration-150">
            + New Work Order
          </button>
        </div>
      </div>

      {/* Work Orders Table Card - Applying the clean aesthetic */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <p className="text-lg font-semibold text-gray-900">Active Production Schedule</p>

          {/* Search Input - Cleaned up and uses primary focus color */}
          <input
            type="text"
            placeholder="Search by job name or technician"
            // Professional input styling
            className="w-full sm:max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
          />
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                {/* Table Headers - Increased padding and clearer typography */}
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Job Name / Order ID</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            {error && (
              <tbody>
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-red-600">{error}</td>
                </tr>
              </tbody>
            )}
            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-gray-500">Loading work orders...</td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-100">
                {workOrders.map((wo: any) => (
                  <tr
                    key={wo.id}
                    onClick={() => navigate(`/production/work-orders/${wo.id}`)}
                    className="hover:bg-blue-50/50 transition duration-150 cursor-pointer"
                  >
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{wo.id}</td>
                    <td className="px-6 py-3 text-gray-800 font-medium">
                      {wo.customer || wo.customer_name || `Order #${wo.id}`}
                    </td>
                    <td className="px-6 py-3">
                      {/* Stage Tag - Dynamically colored tag */}
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${getStageColor(wo.status)}`}>
                        {wo.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{'—'}</td>
                    <td className="px-6 py-3 text-right">
                      <button className="text-sm font-medium text-teal-600 hover:text-teal-800">
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
                {workOrders.length === 0 && !loading && !error && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-xs text-gray-500">No work orders found.</td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}