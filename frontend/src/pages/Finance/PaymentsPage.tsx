// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchPayments, recordPayment, fetchInvoices } from '../../api/apiClient'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ControllerTopNav from '@/components/layout/ControllerTopNav'
import PosTopNav from '@/components/layout/PosTopNav'
import { getAuthUser } from '@/utils/apiClient'

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [methodFilter, setMethodFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [reference, setReference] = useState('')

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
    if (!invoiceId || !amount) return
    const amountNumber = Number(amount)
    if (!amountNumber || amountNumber <= 0) return

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
      reloadPayments()
    } catch (err: any) {
      setError(err.message || 'Failed to record payment')
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

  const user = getAuthUser()
  const isController = user?.role_id === 4
  const isPosRole = user?.role_id === 5 || user?.role_id === 11

  return (
    <div className="min-h-screen bg-slate-50">
      {isController ? <ControllerTopNav /> : isPosRole ? <PosTopNav /> : <OwnerTopNav />}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">

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
        {/* Quick Record Payment form */}
        <form
          onSubmit={handleRecordPayment}
          className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/40 px-3 py-2 text-xs"
        >
          <span className="font-semibold text-gray-800 mr-1">Record payment:</span>
          <select
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
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
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
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
            disabled={creating}
            className="ml-auto rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
          >
            {creating ? 'Saving…' : 'Save payment'}
          </button>
        </form>
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
      </div>
    </div>
  )
}
