// @ts-nocheck
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchUsers, fetchWorkLogs, fetchPOSSales, fetchOrders } from '@/api/apiClient'
import { Users, Clock, DollarSign, ShoppingCart, TrendingUp, Calendar, Filter, Eye, X } from 'lucide-react'

interface EmployeeActivity {
  userId: number
  userName: string
  userEmail: string
  roleName: string
  workLogsCount: number
  totalHours: number
  salesCount: number
  salesTotal: number
  ordersCreated: number
  lastActivity: string | null
}

export default function EmployeeActivityPage() {
  const [employees, setEmployees] = useState<EmployeeActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeActivity | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [rawWorkLogs, setRawWorkLogs] = useState<any[]>([])
  const [rawPosSales, setRawPosSales] = useState<any[]>([])
  const [rawOrders, setRawOrders] = useState<any[]>([])

  useEffect(() => {
    loadEmployeeActivity()
  }, [filterRole, dateRange])

  const loadEmployeeActivity = async () => {
    try {
      setLoading(true)
      setError(null)

      const [usersData, workLogsData, posSalesData, ordersData] = await Promise.all([
        fetchUsers().catch(() => []),
        fetchWorkLogs().catch(() => []),
        fetchPOSSales().catch(() => []),
        fetchOrders().catch(() => [])
      ])

      const users = Array.isArray(usersData) ? usersData : []
      const workLogs = Array.isArray(workLogsData) ? workLogsData : []
      const posSales = Array.isArray(posSalesData) ? posSalesData : []
      const orders = Array.isArray(ordersData) ? ordersData : []

      // Store raw data for detail view
      setRawWorkLogs(workLogs)
      setRawPosSales(posSales)
      setRawOrders(orders)

      // Filter by date range if provided
      const filterDate = (dateStr: string) => {
        if (!dateRange.start && !dateRange.end) return true
        const date = new Date(dateStr).toISOString().slice(0, 10)
        if (dateRange.start && date < dateRange.start) return false
        if (dateRange.end && date > dateRange.end) return false
        return true
      }

      // Build employee activity map
      const activityMap = new Map<number, EmployeeActivity>()

      // Initialize with users
      users.forEach((user: any) => {
        if (filterRole !== 'all' && user.role_id?.toString() !== filterRole) return
        
        activityMap.set(user.id, {
          userId: user.id,
          userName: user.name || user.email,
          userEmail: user.email,
          roleName: user.role || 'Unknown',
          workLogsCount: 0,
          totalHours: 0,
          salesCount: 0,
          salesTotal: 0,
          ordersCreated: 0,
          lastActivity: null
        })
      })

      // Process work logs
      workLogs.forEach((log: any) => {
        if (!filterDate(log.created_at)) return
        
        const userId = log.technician_id || log.user_id
        if (!userId) return
        
        const activity = activityMap.get(userId)
        if (activity) {
          activity.workLogsCount++
          activity.totalHours += (log.time_spent_minutes || 0) / 60
          const logDate = new Date(log.created_at)
          if (!activity.lastActivity || logDate > new Date(activity.lastActivity)) {
            activity.lastActivity = log.created_at
          }
        }
      })

      // Process POS sales
      posSales.forEach((sale: any) => {
        if (!filterDate(sale.created_at || sale.date)) return
        
        const userId = sale.cashier_id || sale.user_id
        if (!userId) return
        
        const activity = activityMap.get(userId)
        if (activity) {
          activity.salesCount++
          activity.salesTotal += Number(sale.total) || 0
          const saleDate = new Date(sale.created_at || sale.date)
          if (!activity.lastActivity || saleDate > new Date(activity.lastActivity)) {
            activity.lastActivity = sale.created_at || sale.date
          }
        }
      })

      // Process orders
      orders.forEach((order: any) => {
        if (!filterDate(order.created_at || order.date)) return
        
        const userId = order.created_by || order.user_id
        if (!userId) return
        
        const activity = activityMap.get(userId)
        if (activity) {
          activity.ordersCreated++
          const orderDate = new Date(order.created_at || order.date)
          if (!activity.lastActivity || orderDate > new Date(activity.lastActivity)) {
            activity.lastActivity = order.created_at || order.date
          }
        }
      })

      // Convert to array and sort by last activity
      const activities = Array.from(activityMap.values())
        .sort((a, b) => {
          if (!a.lastActivity) return 1
          if (!b.lastActivity) return -1
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        })

      setEmployees(activities)
    } catch (err: any) {
      setError(err.message || 'Failed to load employee activity')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `RF ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUniqueRoles = () => {
    const roles = new Set(employees.map(e => e.roleName))
    return Array.from(roles).sort()
  }

  const handleViewDetails = (employee: EmployeeActivity) => {
    setSelectedEmployee(employee)
    setShowDetailsModal(true)
  }

  const getEmployeeWorkLogs = (userId: number) => {
    return rawWorkLogs.filter((log: any) => {
      const logUserId = log.technician_id || log.user_id
      return logUserId === userId && (!dateRange.start && !dateRange.end || 
        (dateRange.start && new Date(log.created_at).toISOString().slice(0, 10) >= dateRange.start) &&
        (!dateRange.end || new Date(log.created_at).toISOString().slice(0, 10) <= dateRange.end))
    })
  }

  const getEmployeeSales = (userId: number) => {
    return rawPosSales.filter((sale: any) => {
      const saleUserId = sale.cashier_id || sale.user_id
      return saleUserId === userId && (!dateRange.start && !dateRange.end ||
        (dateRange.start && new Date(sale.created_at || sale.date).toISOString().slice(0, 10) >= dateRange.start) &&
        (!dateRange.end || new Date(sale.created_at || sale.date).toISOString().slice(0, 10) <= dateRange.end))
    })
  }

  const getEmployeeOrders = (userId: number) => {
    return rawOrders.filter((order: any) => {
      const orderUserId = order.created_by || order.user_id
      return orderUserId === userId && (!dateRange.start && !dateRange.end ||
        (dateRange.start && new Date(order.created_at || order.date).toISOString().slice(0, 10) >= dateRange.start) &&
        (!dateRange.end || new Date(order.created_at || order.date).toISOString().slice(0, 10) <= dateRange.end))
    })
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Employee Activity Tracking</h1>
                <p className="mt-1 text-sm text-gray-600">Monitor what each employee did and their performance</p>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  {getUniqueRoles().map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Dates
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{employees.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {formatCurrency(employees.reduce((sum, e) => sum + e.salesTotal, 0))}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {employees.reduce((sum, e) => sum + e.totalHours, 0).toFixed(1)}h
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales Count</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {employees.reduce((sum, e) => sum + e.salesCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">Loading employee activity...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">No employee activity found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Count</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Work Logs</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.userName}</div>
                            <div className="text-sm text-gray-500">{employee.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {employee.roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                          {formatCurrency(employee.salesTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {employee.salesCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {employee.totalHours.toFixed(1)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {employee.workLogsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {employee.ordersCreated}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(employee.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewDetails(employee)}
                            className="inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Details Modal */}
          {showDetailsModal && selectedEmployee && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                  className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                  onClick={() => setShowDetailsModal(false)}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Activity Details - {selectedEmployee.userName}
                      </h3>
                      <p className="text-sm text-blue-100 mt-1">{selectedEmployee.userEmail}</p>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                    {/* Work Logs Section */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-purple-600" />
                        Work Logs ({getEmployeeWorkLogs(selectedEmployee.userId).length})
                      </h4>
                      {getEmployeeWorkLogs(selectedEmployee.userId).length > 0 ? (
                        <div className="space-y-2">
                          {getEmployeeWorkLogs(selectedEmployee.userId).map((log: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {log.description || log.notes || 'Work log entry'}
                                  </p>
                                  {log.work_order_id && (
                                    <p className="text-xs text-gray-600 mt-1">Work Order ID: {log.work_order_id}</p>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-sm font-medium text-purple-600">
                                    {(log.time_spent_minutes || 0) / 60}h
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(log.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No work logs found</p>
                      )}
                    </div>

                    {/* POS Sales Section */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                        POS Sales ({getEmployeeSales(selectedEmployee.userId).length})
                      </h4>
                      {getEmployeeSales(selectedEmployee.userId).length > 0 ? (
                        <div className="space-y-2">
                          {getEmployeeSales(selectedEmployee.userId).map((sale: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Sale #{sale.id || idx + 1}
                                  </p>
                                  {sale.items && sale.items.length > 0 && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      {sale.items.length} item(s)
                                    </p>
                                  )}
                                  {sale.customer_name && (
                                    <p className="text-xs text-gray-600 mt-1">Customer: {sale.customer_name}</p>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-sm font-medium text-green-600">
                                    {formatCurrency(Number(sale.total) || 0)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(sale.created_at || sale.date)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No sales found</p>
                      )}
                    </div>

                    {/* Orders Section */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                        Orders Created ({getEmployeeOrders(selectedEmployee.userId).length})
                      </h4>
                      {getEmployeeOrders(selectedEmployee.userId).length > 0 ? (
                        <div className="space-y-2">
                          {getEmployeeOrders(selectedEmployee.userId).map((order: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    Order #{order.id || order.order_number || idx + 1}
                                  </p>
                                  {order.customer_name && (
                                    <p className="text-xs text-gray-600 mt-1">Customer: {order.customer_name}</p>
                                  )}
                                  {order.status && (
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                      {order.status}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  {order.total && (
                                    <p className="text-sm font-medium text-blue-600">
                                      {formatCurrency(Number(order.total) || 0)}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(order.created_at || order.date)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No orders found</p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-3 flex justify-end">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

