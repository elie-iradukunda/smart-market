// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PosTopNav from '@/components/layout/PosTopNav'
import RevenueOverview from '../modules/dashboards/components/RevenueOverview'
import {
  createCustomer,
  createPOSSale,
  createInvoice,
  recordPayment,
  fetchCustomers,
  fetchMaterials,
  fetchInvoices,
  fetchDemoOrders,
} from '../api/apiClient'

export default function PosDashboard() {
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
    customer_id: '', // customer selected from dropdown
  })
  const [posItems, setPosItems] = useState(
    Array.from({ length: 5 }).map(() => ({ material_id: '', quantity: '1', price: '' }))
  )
  const [posStatus, setPosStatus] = useState<string | null>(null)
  const [posError, setPosError] = useState<string | null>(null)

  const [invoiceForm, setInvoiceForm] = useState({
    order_id: '',
    amount: '',
  })
  const [invoiceStatus, setInvoiceStatus] = useState<string | null>(null)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)

  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    amount: '',
    method: 'cash',
    reference: '',
  })
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data for selects
  const [customers, setCustomers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loadingLookup, setLoadingLookup] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingLookup(true)
        setLookupError(null)
        const [cust, mats, invs, ords] = await Promise.all([
          fetchCustomers(),
          fetchMaterials(),
          fetchInvoices(),
          fetchDemoOrders(),
        ])
        setCustomers(cust || [])
        setMaterials(mats || [])
        setInvoices(invs || [])
        setOrders(ords || [])
      } catch (err: any) {
        setLookupError(err.message || 'Failed to load dropdown data')
      } finally {
        setLoadingLookup(false)
      }
    }

    load()
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
    } catch (err: any) {
      setCustomerError(err.message || 'Failed to create customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePosSubmit = async (e) => {
    e.preventDefault()
    setPosStatus(null)
    setPosError(null)
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
      setPosError(err.message || 'Failed to record POS sale')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault()
    setInvoiceStatus(null)
    setInvoiceError(null)
    try {
      setIsSubmitting(true)
      const payload = {
        order_id: Number(invoiceForm.order_id),
        amount: Number(invoiceForm.amount || '0'),
      }
      const res = await createInvoice(payload)
      setInvoiceStatus(`Invoice created with ID ${res.id}`)
      setInvoiceForm({ order_id: '', amount: '' })
    } catch (err: any) {
      setInvoiceError(err.message || 'Failed to create invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setPaymentStatus(null)
    setPaymentError(null)
    try {
      setIsSubmitting(true)
      const payload = {
        invoice_id: Number(paymentForm.invoice_id),
        amount: Number(paymentForm.amount || '0'),
        method: paymentForm.method,
        reference: paymentForm.reference,
      }
      const res = await recordPayment(payload)
      setPaymentStatus(res.message || 'Payment recorded')
      setPaymentForm({ invoice_id: '', amount: '', method: 'cash', reference: '' })
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-white to-orange-50/60">
      <PosTopNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header section */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr] items-stretch">
          <div className="rounded-3xl border border-amber-100 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">POS Cashier Workspace</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Close tickets
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600"> fast and accurately</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl">
                See today&apos;s sales, payment mix, and recent POS activity so cashiers always know where they stand.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs sm:text-sm">
              <Link
                to="/pos/terminal"
                className="inline-flex items-center rounded-full bg-amber-600 text-white px-4 py-2 font-semibold shadow-md shadow-amber-500/40 hover:bg-amber-700 transition"
              >
                Open POS terminal
              </Link>
              <Link
                to="/pos/sales-history"
                className="inline-flex items-center rounded-full bg-white px-4 py-2 font-medium text-gray-800 border border-amber-200 hover:bg-amber-50"
              >
                View sales history
              </Link>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-gray-900/10 bg-gray-900 shadow-2xl relative">
            <img
              src="https://images.pexels.com/photos/5718025/pexels-photo-5718025.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Cashier processing a sale"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-amber-200">POS snapshot</p>
              <p className="mt-2 text-sm sm:text-base text-gray-100 max-w-sm">
                Keep an eye on today&apos;s revenue and spot busy hours directly from the POS dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Main widgets area */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md">
              <RevenueOverview />
            </div>
          </div>
        </div>

        {/* Action forms for cashier workflow */}
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          {lookupError && (
            <div className="lg:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
              {lookupError}
            </div>
          )}
          {/* Create customer */}
          <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Customer</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Create customer</h2>
              <p className="mt-1 text-xs text-gray-500">Quickly register a new customer before issuing tickets or invoices.</p>
            </div>
            {customerStatus && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{customerStatus}</p>}
            {customerError && <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">{customerError}</p>}
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

          {/* Create POS sale with up to 5 items */}
          <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">POS</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Quick POS sale</h2>
              <p className="mt-1 text-xs text-gray-500">
                Record a walk-in sale and select customer and materials by name. For very complex tickets, open the full POS
                terminal.
              </p>
            </div>
            {posStatus && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{posStatus}</p>}
            {posError && <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">{posError}</p>}
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
                  <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,2.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
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

          {/* Create invoice */}
          <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Finance</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Generate invoice</h2>
              <p className="mt-1 text-xs text-gray-500">Create an invoice for an existing order. Link this to later payments.</p>
            </div>
            {invoiceStatus && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{invoiceStatus}</p>}
            {invoiceError && <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">{invoiceError}</p>}
            <form onSubmit={handleInvoiceSubmit} className="grid gap-3 text-xs sm:text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                  value={invoiceForm.order_id}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, order_id: e.target.value })}
                  required
                >
                  <option value="">Select customer / order</option>
                  {orders.map((o: any) => (
                    <option key={o.id} value={String(o.id)}>
                      {o.customer || 'Customer'} 
                      {`(Order #${o.id})`}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                  placeholder="Amount"
                  type="number"
                  step="0.01"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">For full details, open the Invoices page from the top navigation.</p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  Create invoice
                </button>
              </div>
            </form>
          </div>

          {/* Record payment */}
          <div className="rounded-2xl border border-gray-100 bg-white/95 shadow-md p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Finance</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">Record payment</h2>
              <p className="mt-1 text-xs text-gray-500">Attach a payment to an invoice and update its status.</p>
            </div>
            {paymentStatus && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{paymentStatus}</p>}
            {paymentError && <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">{paymentError}</p>}
            <form onSubmit={handlePaymentSubmit} className="grid gap-3 text-xs sm:text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                  value={paymentForm.invoice_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })}
                  required
                >
                  <option value="">Select invoice / customer</option>
                  {invoices.map((inv: any) => (
                    <option key={inv.id} value={String(inv.id)}>
                      {inv.customer_name || 'Customer'} {`(INV #${inv.id})`}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                  placeholder="Amount"
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="momo">Mobile Money</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                </select>
                <input
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs sm:text-sm"
                  placeholder="Reference (optional)"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">For detailed reconciliation, open the Payments page from the top navigation.</p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
                >
                  Record payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
