// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchPayments, recordPayment, fetchInvoices, initiateLanariPayment, checkLanariPaymentStatus } from '../../api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getAuthUser } from '@/utils/apiClient'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [methodFilter, setMethodFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [reference, setReference] = useState('')

  const [lanariInvoiceId, setLanariInvoiceId] = useState('')
  const [lanariAmount, setLanariAmount] = useState('')
  const [lanariPhone, setLanariPhone] = useState('')
  const [lanariStatus, setLanariStatus] = useState<string | null>(null)
  const [lanariPaymentId, setLanariPaymentId] = useState<number | null>(null)
  const [lanariLoading, setLanariLoading] = useState(false)

  const reloadPayments = () => {
    setLoading(true)
    setError(null)

    fetchPayments()
      .then((data) => {
        setPayments(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        setError(err.message || 'Failed to load payments')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([fetchPayments(), fetchInvoices()])
      .then(([paymentsData, invoicesData]) => {
        if (!isMounted) return
        setPayments(Array.isArray(paymentsData) ? paymentsData : [])
        setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load payments')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!invoiceId) {
      setFormError('Please select an invoice to pay.')
      return
    }
    if (!amount) {
      setFormError('Please enter an amount.')
      return
    }
    const amountNumber = Number(amount)
    if (!amountNumber || amountNumber <= 0) {
      setFormError('Amount must be greater than zero.')
      return
    }

    setCreating(true)
    setError(null)
    try {
      await recordPayment({
        invoice_id: Number(invoiceId),
        amount: amountNumber,
        method,
        reference: reference || undefined,
      })
      setInvoiceId('')
      setAmount('')
      setMethod('cash')
      setReference('')
      setFormSuccess('Payment recorded successfully.')
      reloadPayments()
    } catch (err: any) {
      const msg = err.message || 'Failed to record payment'
      setError(msg)
      setFormError(msg)
    } finally {
      setCreating(false)
    }
  }

  const filtered = payments.filter((p: any) => {
    const matchesMethod =
      methodFilter === 'All' ||
      (p.method || '').toLowerCase() === methodFilter.toLowerCase()
    const matchesDate = !dateFilter || (p.created_at || '').startsWith(dateFilter)
    return matchesMethod && matchesDate
  })

  const totalReceived = filtered.reduce((sum: number, p: any) => {
    const amt = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || '0')
    return sum + (isNaN(amt) ? 0 : amt)
  }, 0)

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'RF 0.00'
    return `RF ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatMethod = (m: string | null | undefined) => {
    const code = (m || '').toLowerCase()
    switch (code) {
      case 'cash': return 'Cash'
      case 'momo':
      case 'mobile_money': return 'Mobile money'
      case 'card': return 'Card'
      case 'bank': return 'Bank transfer'
      default: return ''
    }
  }

  const openInvoices = invoices.filter((inv: any) => {
    const status = (inv.status || '').toLowerCase()
    return status !== 'paid'
  })

  const selectedInvoice = invoiceId
    ? openInvoices.find((inv: any) => String(inv.id) === String(invoiceId)) ||
    invoices.find((inv: any) => String(inv.id) === String(invoiceId))
    : null

  const isFormValid = !!invoiceId && !!amount && Number(amount) > 0

  return (
    <DashboardLayout>
      <div className="px-4 py-4">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Payments</h1>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transactions</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{filtered.length}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Received</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(totalReceived)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Methods Used</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>

          {/* Quick Record Form */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">Record Payment</p>
            </div>
            <div className="p-4">
              <form onSubmit={handleRecordPayment} className="flex flex-wrap items-center gap-3">
                <select
                  value={invoiceId}
                  onChange={(e) => {
                    setInvoiceId(e.target.value)
                    setFormError(null)
                    setFormSuccess(null)
                  }}
                  className="flex-1 min-w-[240px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="">Select invoice (customer / amount)</option>
                  {openInvoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      #{inv.id} - {inv.customer_name || 'Customer'} - ${inv.amount || 0}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setFormError(null)
                    setFormSuccess(null)
                  }}
                  placeholder="Amount"
                  className="w-32 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none transition"
                />
                <select
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value)
                    setFormError(null)
                    setFormSuccess(null)
                  }}
                  className="w-36 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="cash">Cash</option>
                  <option value="momo">Mobile Money</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank</option>
                </select>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Reference (optional)"
                  className="flex-1 min-w-[160px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={creating || !isFormValid}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {creating ? 'Saving...' : 'Save Payment'}
                </button>
              </form>

              {formError && <p className="mt-3 text-[11px] font-bold text-red-600">{formError}</p>}
              {formSuccess && !formError && <p className="mt-3 text-[11px] font-bold text-emerald-600">{formSuccess}</p>}
              
              {selectedInvoice && (
                <div className="mt-3 text-[10px] text-gray-500 font-medium">
                  Selected: Invoice #{selectedInvoice.id} | {selectedInvoice.customer_name} | {formatCurrency(Number(selectedInvoice.amount || 0))}
                </div>
              )}
            </div>
          </div>

          {/* Payment List Table */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">Payment History</p>
              <div className="flex gap-2">
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="All">All methods</option>
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank">Bank</option>
                </select>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400 font-bold uppercase italic">Loading payments...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-xs text-gray-400 font-bold uppercase">No payments found.</td></tr>
                  ) : (
                    filtered.map((pmt: any) => (
                      <tr key={pmt.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 text-xs font-bold text-gray-900">{pmt.id}</td>
                        <td className="px-6 py-4 text-xs text-gray-600">{pmt.invoice_number}</td>
                        <td className="px-6 py-4 text-xs text-gray-600">{formatMethod(pmt.method)}</td>
                        <td className="px-6 py-4 text-xs text-right font-medium text-gray-900">
                          {formatCurrency(typeof pmt.amount === 'number' ? pmt.amount : parseFloat(pmt.amount || '0'))}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{(pmt.created_at || '').slice(0, 10)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lanari Panel */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">Lanari Mobile Payment</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight">USSD / MoMo Integration</p>
            </div>
            <div className="p-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setLanariStatus(null)
                  if (!lanariInvoiceId || !lanariAmount || !lanariPhone) {
                    setLanariStatus('Please fill all fields.')
                    return
                  }
                  setLanariLoading(true)
                  try {
                    const resp = await initiateLanariPayment({
                      invoice_id: Number(lanariInvoiceId),
                      amount: Number(lanariAmount),
                      customer_phone: lanariPhone,
                    })
                    setLanariPaymentId(resp.payment_id)
                    setLanariStatus(resp.message || 'Payment initiated. Waiting for customer...')
                    reloadPayments()
                  } catch (err: any) {
                    setLanariStatus(err.message || 'Failed to initiate.')
                  } finally {
                    setLanariLoading(false)
                  }
                }}
                className="flex flex-wrap items-center gap-3"
              >
                <select
                  value={lanariInvoiceId}
                  onChange={(e) => {
                    const val = e.target.value
                    setLanariInvoiceId(val)
                    const inv = openInvoices.find((i: any) => String(i.id) === String(val))
                    if (inv) setLanariAmount(String(inv.amount || ''))
                  }}
                  className="flex-1 min-w-[200px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none transition"
                >
                  <option value="">Select invoice</option>
                  {openInvoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      #{inv.id} - {inv.customer_name} - ${inv.amount}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={lanariAmount}
                  onChange={(e) => setLanariAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-28 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none transition"
                />
                <input
                  type="tel"
                  value={lanariPhone}
                  onChange={(e) => setLanariPhone(e.target.value)}
                  placeholder="Phone (078...)"
                  className="w-40 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={lanariLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 transition"
                >
                  {lanariLoading ? 'Sending...' : 'Initiate Lanari'}
                </button>
              </form>

              {lanariStatus && <p className="mt-3 text-[11px] font-bold text-amber-700">{lanariStatus}</p>}
              
              {lanariPaymentId && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">ID: {lanariPaymentId}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!lanariPaymentId) return
                      try {
                        const status = await checkLanariPaymentStatus(lanariPaymentId)
                        setLanariStatus(`Gateway: ${status.gateway_status} | Payment: ${status.payment_status}`)
                        reloadPayments()
                      } catch (err: any) {
                        setLanariStatus(err.message || 'Failed check.')
                      }
                    }}
                    className="rounded border border-amber-200 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-50 transition"
                  >
                    Check Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}