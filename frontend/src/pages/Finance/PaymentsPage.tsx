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
      setFormError('Please select an invoice to pay. If you do not see it, create an invoice first.')
      return
    }
    if (!amount) {
      setFormError('Please enter an amount to record.')
      return
    }
    const amountNumber = Number(amount)
    if (!amountNumber || amountNumber <= 0) {
      setFormError('Payment amount must be greater than zero.')
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
    if (typeof value !== 'number' || isNaN(value)) return '$0.00'
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatMethod = (m: string | null | undefined) => {
    const code = (m || '').toLowerCase()
    switch (code) {
      case 'cash':
        return 'Cash'
      case 'momo':
      case 'mobile_money':
        return 'Mobile money'
      case 'card':
        return 'Card'
      case 'bank':
        return 'Bank transfer'
      default:
        return ''
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

  const user = getAuthUser()
  const isController = user?.role_id === 4
  const isPosRole = user?.role_id === 5 || user?.role_id === 11

  return (
    <DashboardLayout>

      {/* Header card with blue accent, similar to other finance pages */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Finance</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">Payments</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Recorded payments from cash, mobile money, and bank. Use this view to reconcile invoices with money received.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-blue-50 px-3 py-2 border border-blue-100">
            <p className="text-gray-600">Transactions</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{filtered.length}</p>
          </div>
          <div className="rounded-lg bg-indigo-50 px-3 py-2 border border-indigo-100">
            <p className="text-gray-600">Total received</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{formatCurrency(totalReceived)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-200">
            <p className="text-gray-600">Payment methods</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">3</p>
          </div>
        </div>

        {selectedInvoice && (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 px-4 py-3 text-xs flex flex-wrap items-center gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">
                Paying invoice #{selectedInvoice.id}
              </span>
              <span className="text-[11px] text-gray-600">
                Customer: {selectedInvoice.customer_name || 'Customer'} · Amount: {formatCurrency(Number(selectedInvoice.amount || 0))} · Status: {(selectedInvoice.status || '').toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Quick Record Payment form */}
        <form
          onSubmit={handleRecordPayment}
          className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/40 px-3 py-2 text-xs"
        >
          <span className="font-semibold text-gray-800 mr-1">Record payment:</span>
          <select
            value={invoiceId}
            onChange={(e) => {
              setInvoiceId(e.target.value)
              setFormError(null)
              setFormSuccess(null)
            }}
            className="w-56 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value)
              setFormError(null)
              setFormSuccess(null)
            }}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="w-40 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={creating || !isFormValid}
            className="ml-auto rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creating ? 'Saving…' : 'Save payment'}
          </button>
        </form>

        {formError && (
          <p className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-[11px] text-red-700">
            {formError}
          </p>
        )}
        {formSuccess && !formError && (
          <p className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[11px] text-emerald-700">
            {formSuccess}
          </p>
        )}
      </div>

      {/* Table card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
          <p className="text-sm font-medium text-gray-900">Payment list</p>
          <div className="flex flex-wrap gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
          )}
          {loading ? (
            <p className="text-xs text-gray-500 py-4">Loading payments...</p>
          ) : (
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-medium text-gray-700">Payment</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Invoice</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Method</th>
                  <th className="px-3 py-2 text-right font-medium text-gray-700">Amount</th>
                  <th className="px-3 py-2 font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pmt: any) => (
                  <tr key={pmt.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{pmt.id}</td>
                    <td className="px-3 py-2 text-gray-800">{pmt.invoice_number}</td>
                    <td className="px-3 py-2 text-gray-800">{formatMethod(pmt.method)}</td>
                    <td className="px-3 py-2 text-right text-gray-800">{formatCurrency(typeof pmt.amount === 'number' ? pmt.amount : parseFloat(pmt.amount || '0'))}</td>
                    <td className="px-3 py-2 text-gray-800">{(pmt.created_at || '').slice(0, 10)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-xs text-gray-500">No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Lanari mobile money payment panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Lanari mobile money payment</p>
            <p className="text-xs text-gray-500">Initiate a customer payment via Lanari (USSD / MoMo) and track its status.</p>
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setLanariStatus(null)

            if (!lanariInvoiceId) {
              setLanariStatus('Select an invoice first.')
              return
            }
            const amt = Number(lanariAmount || 0)
            if (!amt || amt <= 0) {
              setLanariStatus('Enter a valid amount to charge.')
              return
            }
            if (!lanariPhone) {
              setLanariStatus('Enter the customer phone number for mobile money/USSD.')
              return
            }

            setLanariLoading(true)
            try {
              const resp = await initiateLanariPayment({
                invoice_id: Number(lanariInvoiceId),
                amount: amt,
                customer_phone: lanariPhone,
              })
              setLanariPaymentId(resp.payment_id)
              setLanariStatus(resp.message || 'Lanari payment initiated. Waiting for customer confirmation...')
              reloadPayments()
            } catch (err: any) {
              setLanariStatus(err.message || 'Failed to initiate Lanari payment')
            } finally {
              setLanariLoading(false)
            }
          }}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50/40 px-3 py-2 text-xs"
        >
          <span className="font-semibold text-gray-800 mr-1">Lanari payment:</span>
          <select
            value={lanariInvoiceId}
            onChange={(e) => {
              const val = e.target.value
              setLanariInvoiceId(val)
              const inv = openInvoices.find((i: any) => String(i.id) === String(val))
              if (inv) {
                setLanariAmount(String(inv.amount || ''))
              }
            }}
            className="w-56 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">Select invoice</option>
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
            value={lanariAmount}
            onChange={(e) => setLanariAmount(e.target.value)}
            placeholder="Amount"
            className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <input
            type="tel"
            value={lanariPhone}
            onChange={(e) => setLanariPhone(e.target.value)}
            placeholder="Customer phone (e.g. 078...)"
            className="w-40 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={lanariLoading}
            className="ml-auto rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {lanariLoading ? 'Sending…' : 'Initiate Lanari payment'}
          </button>
        </form>

        {lanariPaymentId && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-gray-700">Payment ID: {lanariPaymentId}</span>
            <button
              type="button"
              onClick={async () => {
                if (!lanariPaymentId) return
                try {
                  const status = await checkLanariPaymentStatus(lanariPaymentId)
                  setLanariStatus(
                    `Gateway status: ${status.gateway_status || 'unknown'} · Payment status: ${status.payment_status || 'unknown'}`
                  )
                  reloadPayments()
                } catch (err: any) {
                  setLanariStatus(err.message || 'Failed to check payment status')
                }
              }}
              className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-amber-200 text-amber-800 hover:bg-amber-50"
            >
              Check status
            </button>
          </div>
        )}

        {lanariStatus && (
          <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-[11px] text-amber-800">
            {lanariStatus}
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
