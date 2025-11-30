// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPOSSales, createCustomer, createPOSSale, fetchCustomers, fetchMaterials } from '@/api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CampaignPerformanceWidget from '../modules/dashboards/components/CampaignPerformanceWidget'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import { User, Calendar, CreditCard, Download, AlertTriangle, Loader, Package, PiggyBank } from 'lucide-react'

export default function SalesDashboard() {
  const [posSummary, setPosSummary] = useState({ todayTotal: 0, todayCount: 0, last7Total: 0 })
  const [posSales, setPosSales] = useState<any[]>([])
  const [posLoading, setPosLoading] = useState(true)
  const [posError, setPosError] = useState<string | null>(null)
  const [posFilter, setPosFilter] = useState({
    paymentMethod: 'All',
    date: new Date().toISOString().slice(0, 10),
  })

  // POS quick actions state (same logic as POS dashboard)
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

  // Load customers and materials for quick POS sale
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
      setCustomerStatus(`Customer created with ID ${res.id}`)
      setCustomerForm({ name: '', phone: '', email: '', address: '', source: 'Walk-in' })
      // Refresh customers so the new customer appears in the Quick POS sale dropdown
      try {
        const freshCustomers = await fetchCustomers()
        setCustomers(freshCustomers || [])
      } catch (refreshErr) {
        // Do not block the main success message if refresh fails; optional best-effort reload
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
      setPosStatus(`POS sale recorded with ID ${res.id}`)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Header section */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
            <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Sales</p>
                <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                  Convert more
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600"> leads into orders</span>
                </h1>
                <p className="mt-4 text-base text-gray-600 max-w-2xl">
                  See how sales campaigns and offers are turning into revenue so reps know where to focus.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <Link
                  to="/crm/leads"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Leads
                </Link>
                <Link
                  to="/crm/quotes"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Quotes
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Orders
                </Link>
                <Link
                  to="/communications/inbox"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Inbox
                </Link>
                <Link
                  to="/marketing/campaigns"
                  className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 font-medium text-gray-800 border border-gray-200 hover:bg-gray-100"
                >
                  Campaigns
                </Link>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Sales team collaborating"
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-200">Sales snapshot</p>
                <p className="mt-2 text-base text-gray-100 max-w-sm">
                  Quickly see which initiatives are driving quotes and orders this week.
                </p>
              </div>
            </div>
          </div>

          {/* Key sales actions for accountants */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">1. Capture interest</p>
                <h3 className="mt-1 text-sm font-bold text-gray-900">Create leads</h3>
                <p className="mt-1 text-xs text-gray-600">
                  When a company or person asks for prices, add them as a lead so you don&apos;t lose the opportunity.
                </p>
              </div>
              <div className="mt-3">
                <Link
                  to="/crm/leads"
                  className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  Go to Leads
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-white/95 p-4 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">2. Send prices</p>
                <h3 className="mt-1 text-sm font-bold text-gray-900">Create & manage quotes</h3>
                <p className="mt-1 text-xs text-gray-600">
                  Prepare price offers for leads and customers. Keep them as Draft or Sent until the customer decides.
                </p>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Link
                  to="/crm/quotes"
                  className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Go to Quotes
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white/95 p-4 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">3. Customer says &quot;Yes&quot;</p>
                <h3 className="mt-1 text-sm font-bold text-gray-900">Approve quote → Order</h3>
                <p className="mt-1 text-xs text-gray-600">
                  When a customer accepts a quote, approve it in the quotes screen so the system creates an order.
                </p>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Link
                  to="/crm/quotes"
                  className="inline-flex items-center rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                >
                  Review Quotes
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black"
                >
                  View Orders
                </Link>
              </div>
            </div>
          </div>

          {/* Main widgets area */}
          <div className="grid gap-6 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
                <CampaignPerformanceWidget />
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
                <RevenueOverview />
              </div>

              {/* POS sales summary so Sales sees POS + pipeline in one place */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">POS sales (Sales rep)</p>
                <p className="mt-1 text-sm text-emerald-900">
                  Today: <span className="font-bold">{posSummary.todayTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </p>
                <p className="mt-1 text-xs text-emerald-800">
                  {posSummary.todayCount} transactions today · Last 7 days POS total:{' '}
                  <span className="font-semibold">
                    {posSummary.last7Total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </p>
                <div className="mt-3">
                  <Link
                    to="/pos/sales-history"
                    className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    Open POS Sales report
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick POS actions so Sales can work tickets from same dashboard */}
          <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
            {lookupError && (
              <div className="lg:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                {lookupError}
              </div>
            )}

            {/* Create customer (same as POS dashboard) */}
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Customer</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">Create customer</h2>
                <p className="mt-1 text-xs text-gray-500">Quickly register a new customer before issuing POS tickets or invoices.</p>
              </div>
              {customerStatus && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{customerStatus}</p>
              )}
              {customerError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">{customerError}</p>
              )}
              <form onSubmit={handleCustomerSubmit} className="grid gap-3 text-xs sm:text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                    placeholder="Customer name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    required
                  />
                  <input
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                    placeholder="Phone"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    required
                  />
                </div>
                <input
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                  placeholder="Email (optional)"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                />
                <input
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                  placeholder="Address"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                />
                <div className="flex items-center justify-between gap-3">
                  <input
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                    placeholder="Source (e.g. Walk-in, WhatsApp)"
                    value={customerForm.source}
                    onChange={(e) => setCustomerForm({ ...customerForm, source: e.target.value })}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Save customer
                  </button>
                </div>
              </form>
            </div>

            {/* Quick POS sale (same as POS dashboard) */}
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">POS</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">Quick POS sale</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Record a walk-in sale and select customer and materials by name. For very complex tickets, open the full POS
                  terminal.
                </p>
              </div>
              {posStatus && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{posStatus}</p>
              )}
              {posSubmitError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">{posSubmitError}</p>
              )}
              <form onSubmit={handlePosSubmit} className="grid gap-3 text-xs sm:text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
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
                  <p className="text-[11px] text-gray-500 self-center">Customer is optional for quick cash sales.</p>
                </div>
                <div className="border border-dashed border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/40">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-gray-600">Line items (max 5)</p>
                    {loadingLookup && <p className="text-[11px] text-gray-400">Loading materials…</p>}
                  </div>
                  {posItems.map((row, index) => (
                    <div
                      key={index}
                      className="grid gap-2 sm:grid-cols-[minmax(0,2.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]"
                    >
                      <select
                        className="rounded-md border border-gray-300 px-2 py-2 text-[11px] sm:text-xs"
                        value={row.material_id}
                        onChange={(e) => {
                          const next = [...posItems]
                          next[index] = { ...next[index], material_id: e.target.value }
                          setPosItems(next)
                        }}
                      >
                        <option value="">Select material / item</option>
                        {materials.map((m: any) => (
                          <option key={m.id} value={String(m.id)}>
                            {m.name || m.material_name || m.sku || `Material ${m.id}`}
                          </option>
                        ))}
                      </select>
                      <input
                        className="rounded-md border border-gray-300 px-2 py-2 text-[11px] sm:text-xs"
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
                        className="rounded-md border border-gray-300 px-2 py-2 text-[11px] sm:text-xs"
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
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Total is calculated from all non-empty lines. For complex tickets, open the full POS terminal.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
                  >
                    Record POS sale
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Embedded Daily Sales Transactions report (same data as POS Daily Sales page) */}
          <div className="mt-8 rounded-3xl border border-gray-100 bg-white/95 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    <PiggyBank className="inline h-4 w-4 mr-2" aria-hidden="true" />
                    Retail Operations
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                    Daily Sales <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">Transactions</span>
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-xl">
                    Review and reconcile recent counter transactions for this day. Data is filtered for quick daily closing.
                  </p>
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition duration-300"
                  onClick={handleExportDaily}
                  aria-label="Export full daily POS sales report"
                >
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export Full Report
                </button>
              </div>
            </div>

            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Recent Transactions ({filteredSales.length})</p>
                <p className="text-xs text-gray-600 mt-1">
                  Total for {posFilter.date}:{' '}
                  <span className="font-semibold text-gray-900">
                    {totalForFilterDay.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <select
                  name="paymentMethod"
                  value={posFilter.paymentMethod}
                  onChange={handlePosFilterChange}
                  aria-label="Filter by payment method"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs sm:text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150 shadow-sm"
                >
                  <option value="All">All Payment Methods</option>
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
                  aria-label="Filter by date"
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150 shadow-sm"
                />
              </div>
            </div>

            {/* KPI strip for the selected day inside Sales dashboard */}
            <div className="px-6 pb-4 pt-2 grid gap-3 sm:grid-cols-3 text-xs sm:text-sm">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Transactions</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{transactionCountForDay}</p>
              </div>
              <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700">Total sales</p>
                <p className="mt-1 text-xl font-bold text-green-800">
                  {totalForFilterDay.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Average ticket</p>
                <p className="mt-1 text-xl font-bold text-indigo-800">
                  {averageTicketForDay.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
              </div>
            </div>

            {posError && !posLoading && (
              <div className="p-6">
                <div className="p-4 text-red-700 bg-red-50 border border-red-300 rounded-xl flex items-center justify-center text-xs sm:text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2" aria-hidden="true" />
                  <p>Error loading data: {posError}</p>
                </div>
              </div>
            )}

            {posLoading ? (
              <div className="p-6 flex items-center justify-center">
                <Loader className="h-5 w-5 mr-2 text-indigo-500 animate-spin" aria-hidden="true" />
                <p className="text-xs sm:text-sm text-gray-500">Loading POS sales history...</p>
              </div>
            ) : filteredSales.length === 0 && !posError ? (
              <div className="p-8 flex flex-col items-center justify-center text-gray-500">
                <Package className="h-10 w-10 mb-3 text-gray-400" aria-hidden="true" />
                <p className="text-sm font-semibold">No sales transactions found.</p>
                <p className="text-xs mt-1">Check your date filters or confirm recent POS activity.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs sm:text-sm" role="table">
                  <thead className="bg-blue-50/80 border-t border-b border-blue-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col">
                        ID
                      </th>
                      <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col">
                        <User className="inline h-4 w-4 mr-1" aria-hidden="true" /> Customer
                      </th>
                      <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col">
                        Cashier
                      </th>
                      <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col">
                        <CreditCard className="inline h-4 w-4 mr-1" aria-hidden="true" /> Method
                      </th>
                      <th
                        className="px-6 py-3 text-right font-semibold text-blue-700 uppercase tracking-wider"
                        scope="col"
                      >
                        Total
                      </th>
                      <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col">
                        <Calendar className="inline h-4 w-4 mr-1" aria-hidden="true" /> Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-blue-50/50 transition duration-150">
                        <td className="px-6 py-3 text-gray-500 font-mono text-[11px]">{sale.id}</td>
                        <td className="px-6 py-3 text-gray-800 font-medium">{sale.customer}</td>
                        <td className="px-6 py-3 text-gray-700">{sale.cashier}</td>
                        <td className="px-6 py-3">
                          <span className="inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium ring-1 ring-inset bg-gray-100 text-gray-700">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-gray-900 font-bold font-mono text-sm">
                          {sale.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </td>
                        <td className="px-6 py-3 text-gray-600 font-medium">
                          {sale.date}{' '}
                          <span className="text-[11px] text-gray-400">({sale.time})</span>
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
    </DashboardLayout>
  )
}
