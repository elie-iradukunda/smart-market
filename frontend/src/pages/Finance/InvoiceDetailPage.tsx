// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchInvoice } from '@/api/apiClient'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isMounted = true
    if (!id) {
      setError('Missing invoice id')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetchInvoice(id)
      .then((data) => {
        if (!isMounted) return
        setInvoice(data)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load invoice')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0.00'
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handlePrint = () => {
    // Simple approach: print whole page; browser can "Save as PDF"
    window.print()
  }

  const totalAmount = (() => {
    if (!invoice) return 0
    const raw = invoice.amount
    const num = typeof raw === 'number' ? raw : parseFloat(raw || '0')
    return isNaN(num) ? 0 : num
  })()

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Invoice</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">Invoice #{invoice?.id || id}</h1>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Download / Print PDF
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-sm text-gray-500">
          Loading invoice details...
        </div>
      ) : (
        <div ref={printRef} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Design Printing</h2>
              <p className="text-xs text-gray-600 mt-1">Official Invoice</p>
              <div className="mt-3 text-xs text-gray-700 space-y-0.5">
                <p><span className="font-semibold">Invoice #:</span> {invoice?.id}</p>
                <p><span className="font-semibold">Order #:</span> {invoice?.order_number}</p>
                <p><span className="font-semibold">Date:</span> {(invoice?.created_at || '').slice(0, 10)}</p>
              </div>
            </div>
            <div className="text-xs text-gray-700 space-y-0.5">
              <p className="font-semibold text-gray-900">Bill To</p>
              <p>{invoice?.customer_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-6">
            <div className="rounded-lg bg-blue-50 px-3 py-2 border border-blue-100">
              <p className="text-gray-600">Status</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{invoice?.status || 'unpaid'}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-100">
              <p className="text-gray-600">Total</p>
              <p className="mt-1 text-sm font-semibold text-emerald-800">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2 text-xs text-gray-600">
            <p>Thank you for your business. Please contact accounts if you need any clarification on this invoice.</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
