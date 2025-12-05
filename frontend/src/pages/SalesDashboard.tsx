// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPOSSales, createCustomer, createPOSSale, fetchCustomers, fetchMaterials } from '@/api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import {
  User, Calendar, CreditCard, Download, AlertTriangle, Loader, Package,
  TrendingUp, Users, FileText, MessageSquare, Target, ArrowRight,
  DollarSign, ShoppingCart, Zap, BarChart3
} from 'lucide-react'

export default function SalesDashboard() {
  const [posSummary, setPosSummary] = useState({ todayTotal: 0, todayCount: 0, last7Total: 0 })
  const [posSales, setPosSales] = useState<any[]>([])
  const [posLoading, setPosLoading] = useState(true)
  const [posError, setPosError] = useState<string | null>(null)
  const [posFilter, setPosFilter] = useState({
    paymentMethod: 'All',
    date: new Date().toISOString().slice(0, 10),
  })

  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    source: 'Walk-in',
  })
  const [customerStatus, setCustomerStatus] = useState<string | null>(null)
  const [customerError, setCustomerError] = useState<string | null>(null)

  const [posForm, setPosForm] = useState({
    customer_id: '',
  })
  const [posItems, setPosItems] = useState(
    Array.from({ length: 5 }).map(() => ({ material_id: '', quantity: '1', price: '' }))
  )
  const [posStatus, setPosStatus] = useState<string | null>(null)
  const [posSubmitError, setPosSubmitError] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [customers, setCustomers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loadingLookup, setLoadingLookup] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    setPosLoading(true)
    setPosError(null)
    fetchPOSSales()
      .then((data) => {
        if (!isMounted) return
        const mapped = (data || []).map((s) => {
          const dt = new Date(s.created_at)
          return {
            id: `POS-${s.id}`,
            customer: s.customer_name || 'Walk-in',
            cashier: s.cashier_name || 'Unknown',
            total: Number(s.total) || 0,
            paymentMethod: s.payment_method || 'Cash',
            date: dt.toISOString().slice(0, 10),
            time: dt.toTimeString().slice(0, 5),
          }
        })

        setPosSales(mapped)
        const now = new Date()
        const todayStr = now.toISOString().slice(0, 10)

        let todayTotal = 0
        let todayCount = 0
        let last7Total = 0

        mapped.forEach((s) => {
          const created = new Date(`${s.date}T${s.time}:00`)
          if (Number.isNaN(created.getTime())) return

          const total = typeof s.total === 'number' ? s.total : 0
          if (!Number.isFinite(total)) return

          const dateStr = created.toISOString().slice(0, 10)
          const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)

          if (dateStr === todayStr) {
            todayTotal += total
            todayCount += 1
          }
          if (diffDays >= 0 && diffDays <= 7) {
            last7Total += total
          }
        })

        setPosSummary({ todayTotal, todayCount, last7Total })
      })
      .catch(() => {
        if (!isMounted) return
        setPosError('Failed to load POS sales history')
      })
      .finally(() => {
        if (!isMounted) return
        setPosLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoadingLookup(true)
        setLookupError(null)
        const [cust, mats] = await Promise.all([fetchCustomers(), fetchMaterials()])
        if (!mounted) return
        setCustomers(cust || [])
        setMaterials(mats || [])
      } catch (err: any) {
        if (!mounted) return
        setLookupError(err.message || 'Failed to load POS dropdown data')
      } finally {
        if (!mounted) return
        setLoadingLookup(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleCustomerSubmit = async (e) => {
    e.preventDefault()
    setCustomerStatus(null)
    setCustomerError(null)
    try {
      setIsSubmitting(true)
      const payload = { ...customerForm }
      const res = await createCustomer(payload)
      setCustomerStatus(`Customer created successfully!`)
      setCustomerForm({ name: '', phone: '', email: '', address: '', source: 'Walk-in' })
      try {
        const freshCustomers = await fetchCustomers()
        setCustomers(freshCustomers || [])
      } catch (refreshErr) {
        // Best-effort reload
      }
    } catch (err: any) {
      setCustomerError(err.message || 'Failed to create customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePosFilterChange = (e) => {
    const { name, value } = e.target
    setPosFilter((prev) => ({ ...prev, [name]: value }))
  }

  const filteredSales = posSales.filter((sale) => {
    if (posFilter.paymentMethod !== 'All' && sale.paymentMethod !== posFilter.paymentMethod) {
      return false
    }
    if (posFilter.date && sale.date !== posFilter.date) {
      return false
    }
    return true
  })

  const totalForFilterDay = filteredSales.reduce(
    (sum, sale) => sum + (typeof sale.total === 'number' ? sale.total : 0),
    0
  )
  const transactionCountForDay = filteredSales.length
  const averageTicketForDay = transactionCountForDay
    ? totalForFilterDay / transactionCountForDay
    : 0

  const handleExportDaily = () => {
    if (!filteredSales.length) return
    const header = ['ID', 'Customer', 'Cashier', 'Payment Method', 'Total', 'Date', 'Time']
    const rows = filteredSales.map((s) => [
      s.id,
      s.customer,
      s.cashier,
      s.paymentMethod,
      s.total,
      s.date,
      s.time,
    ])
    const csvContent = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const dateLabel = posFilter.date || 'all'
    link.download = `pos-sales-${dateLabel}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePosSubmit = async (e) => {
    e.preventDefault()
    setPosStatus(null)
    setPosSubmitError(null)
    try {
      setIsSubmitting(true)
      const activeItems = posItems
        .map((row) => ({
          material_id: row.material_id,
          quantity: Number(row.quantity || '0'),
          price: Number(row.price || '0'),
        }))
        .filter((row) => row.material_id && row.quantity > 0 && row.price >= 0)

      if (activeItems.length === 0) {
        throw new Error('Please add at least one line item')
      }

      const total = activeItems.reduce((acc, row) => acc + row.quantity * row.price, 0)
      const payload = {
        customer_id: posForm.customer_id ? Number(posForm.customer_id) : undefined,
        total,
        items: activeItems.map((row) => ({
          item_id: Number(row.material_id),
          quantity: row.quantity,
          price: row.price,
        })),
      }
      const res = await createPOSSale(payload)
      setPosStatus(`Sale recorded successfully!`)
      setPosForm({ customer_id: '' })
      setPosItems(Array.from({ length: 5 }).map(() => ({ material_id: '', quantity: '1', price: '' })))
    } catch (err: any) {
      setPosSubmitError(err.message || 'Failed to record POS sale')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/90">Sales Dashboard</p>
                    <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Drive Revenue Growth</h1>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-base text-white/90 leading-relaxed">
                  Track leads, manage quotes, close deals, and monitor POS sales—all from one powerful dashboard.
                </p>

                {/* Quick Action Pills */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/crm/leads"
                    className="group inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-white/30 hover:bg-white/30 transition-all duration-200"
                  >
                    <Target className="h-4 w-4" />
                    Leads
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/crm/quotes"
                    className="group inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-white/30 hover:bg-white/30 transition-all duration-200"
                  >
                    <FileText className="h-4 w-4" />
                    Quotes
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/orders"
                    className="group inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-white/30 hover:bg-white/30 transition-all duration-200"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Orders
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                  <Link
                    to="/communications/inbox"
                    className="group inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white border border-white/30 hover:bg-white/30 transition-all duration-200"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Inbox
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Sales Process Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-50 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">1. Capture Leads</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add every inquiry as a lead to track opportunities and never miss a potential sale.
                  </p>
                  <Link
                    to="/crm/leads"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Manage Leads
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-indigo-50 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">2. Send Quotes</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create professional price quotes and track their status from draft to accepted.
                  </p>
                  <Link
                    to="/crm/quotes"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Create Quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-50 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">3. Close Deals</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Approve quotes to convert them into orders and start the fulfillment process.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to="/crm/quotes"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
                    >
                      Review Quotes
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Widgets */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Sales Pipeline Overview */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Sales Pipeline</h3>
                    <p className="text-sm text-blue-100">Track your leads through the sales funnel</p>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Active Leads</p>
                            <p className="text-2xl font-bold text-blue-900">-</p>
                          </div>
                        </div>
                        <Link to="/crm/leads" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          View all leads →
                        </Link>
                      </div>

                      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Pending Quotes</p>
                            <p className="text-2xl font-bold text-indigo-900">-</p>
                          </div>
                        </div>
                        <Link to="/crm/quotes" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                          Review quotes →
                        </Link>
                      </div>

                      <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white">
                            <ShoppingCart className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">Active Orders</p>
                            <p className="text-2xl font-bold text-purple-900">-</p>
                          </div>
                        </div>
                        <Link to="/orders" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                          View orders →
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Quick Tips for Sales Success</p>
                      <ul className="space-y-2 text-xs text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Follow up with leads within 24 hours to increase conversion rates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Keep quotes updated and send reminders for pending approvals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>Use the inbox to maintain customer relationships and close deals faster</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                  <RevenueOverview />
                </div>

                {/* POS Summary Card */}
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">POS Sales</p>
                      <p className="text-sm font-bold text-emerald-900">Today's Performance</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-800">Today's Total</span>
                      <span className="text-lg font-bold text-emerald-900">
                        RF {posSummary.todayTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-800">Transactions</span>
                      <span className="text-lg font-bold text-emerald-900">{posSummary.todayCount}</span>
                    </div>
                    <div className="pt-3 border-t border-emerald-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-emerald-700">Last 7 Days</span>
                        <span className="text-sm font-semibold text-emerald-800">
                          RF {posSummary.last7Total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/pos/sales-history"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View Full Report
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Create Customer */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Quick Add Customer</h2>
                    <p className="text-sm text-gray-600">Register new customers instantly</p>
                  </div>
                </div>

                {customerStatus && (
                  <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    {customerStatus}
                  </div>
                )}
                {customerError && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {customerError}
                  </div>
                )}

                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="Customer name *"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      required
                    />
                    <input
                      className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="Phone *"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Email (optional)"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  />
                  <input
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Address"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <input
                      className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="Source (e.g. Walk-in, WhatsApp)"
                      value={customerForm.source}
                      onChange={(e) => setCustomerForm({ ...customerForm, source: e.target.value })}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30"
                    >
                      {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                      Save
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick POS Sale */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Quick POS Sale</h2>
                    <p className="text-sm text-gray-600">Record walk-in sales quickly</p>
                  </div>
                </div>

                {posStatus && (
                  <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    {posStatus}
                  </div>
                )}
                {posSubmitError && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {posSubmitError}
                  </div>
                )}

                <form onSubmit={handlePosSubmit} className="space-y-4">
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    value={posForm.customer_id}
                    onChange={(e) => setPosForm({ ...posForm, customer_id: e.target.value })}
                  >
                    <option value="">Walk-in customer (no name)</option>
                    {customers.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name || c.customer_name || `Customer ${c.id}`}
                      </option>
                    ))}
                  </select>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">Line Items</p>
                    {posItems.map((row, index) => (
                      <div key={index} className="grid gap-2 sm:grid-cols-[2fr,1fr,1fr]">
                        <select
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                          value={row.material_id}
                          onChange={(e) => {
                            const next = [...posItems]
                            next[index] = { ...next[index], material_id: e.target.value }
                            setPosItems(next)
                          }}
                        >
                          <option value="">Select item</option>
                          {materials.map((m: any) => (
                            <option key={m.id} value={String(m.id)}>
                              {m.name || m.material_name || m.sku || `Material ${m.id}`}
                            </option>
                          ))}
                        </select>
                        <input
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                          placeholder="Qty"
                          type="number"
                          min="0"
                          value={row.quantity}
                          onChange={(e) => {
                            const next = [...posItems]
                            next[index] = { ...next[index], quantity: e.target.value }
                            setPosItems(next)
                          }}
                        />
                        <input
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
                          placeholder="Price"
                          type="number"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => {
                            const next = [...posItems]
                            next[index] = { ...next[index], price: e.target.value }
                            setPosItems(next)
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30"
                  >
                    {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                    Record Sale
                  </button>
                </form>
              </div>
            </div>

            {/* Daily Sales Report */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white mb-2">Daily Sales Transactions</h2>
                    <p className="text-sm text-blue-100">
                      Review and reconcile today's counter transactions
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all shadow-lg"
                    onClick={handleExportDaily}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {filteredSales.length} Transactions
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Total: <span className="font-semibold text-gray-900">RF {totalForFilterDay.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <select
                      name="paymentMethod"
                      value={posFilter.paymentMethod}
                      onChange={handlePosFilterChange}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    >
                      <option value="All">All Methods</option>
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Bank Card">Bank Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                    <input
                      name="date"
                      type="date"
                      value={posFilter.date}
                      onChange={handlePosFilterChange}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 grid gap-4 sm:grid-cols-3 border-b border-gray-100">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Transactions</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{transactionCountForDay}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Sales</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-900">RF {totalForFilterDay.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Avg Ticket</p>
                  <p className="mt-2 text-2xl font-bold text-blue-900">RF {Math.round(averageTicketForDay).toLocaleString()}</p>
                </div>
              </div>

              {posError && !posLoading && (
                <div className="p-6">
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <p>Error: {posError}</p>
                  </div>
                </div>
              )}

              {posLoading ? (
                <div className="p-12 flex flex-col items-center justify-center">
                  <Loader className="h-8 w-8 text-blue-500 animate-spin mb-3" />
                  <p className="text-sm text-gray-500">Loading sales data...</p>
                </div>
              ) : filteredSales.length === 0 && !posError ? (
                <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                  <Package className="h-12 w-12 mb-4 text-gray-400" />
                  <p className="text-sm font-semibold">No transactions found</p>
                  <p className="text-xs mt-1">Adjust your filters or check back later</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                          <User className="inline h-4 w-4 mr-1" />
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">Cashier</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                          <CreditCard className="inline h-4 w-4 mr-1" />
                          Method
                        </th>
                        <th className="px-6 py-3 text-right font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Date & Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-600 font-mono text-xs">{sale.id}</td>
                          <td className="px-6 py-4 text-gray-900 font-medium">{sale.customer}</td>
                          <td className="px-6 py-4 text-gray-700">{sale.cashier}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 font-bold font-mono">
                            RF {sale.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {sale.date} <span className="text-xs text-gray-500">({sale.time})</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
