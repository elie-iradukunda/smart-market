// @ts-nocheck
import React from 'react'
import OwnerTopNav from '@/components/layout/OwnerTopNav'

export default function InvoiceDetailPage() {
  const invoice = {
    id: 'INV-2025-001',
    customer: 'Acme School',
    status: 'Partially Paid',
    dueDate: '2025-11-30',
  }

  const lines = [
    { id: 1, description: 'PVC Banner 3m x 1m', qty: 4, unitPrice: 45 },
    { id: 2, description: 'Design fee', qty: 1, unitPrice: 30 },
  ]

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0)
  const vat = Math.round(subtotal * 0.18 * 100) / 100
  const total = subtotal + vat

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerTopNav />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Invoice</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">{invoice.id}</h1>
            <p className="mt-2 text-sm text-gray-600">{invoice.customer}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="rounded-lg bg-blue-50 px-3 py-2 border border-blue-100">
              <p className="text-gray-600">Status</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{invoice.status}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
              <p className="text-gray-600">Due date</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{invoice.dueDate}</p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-100 col-span-2 sm:col-span-1">
              <p className="text-gray-600">Total</p>
              <p className="mt-1 text-sm font-semibold text-emerald-800">${total}</p>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl text-sm space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Lines</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-indigo-50/80 border-b border-indigo-200">
                <tr>
                  <th className="px-3 py-2 font-semibold text-indigo-700 uppercase tracking-wider">Description</th>
                  <th className="px-3 py-2 text-right font-semibold text-indigo-700 uppercase tracking-wider">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold text-indigo-700 uppercase tracking-wider">Unit price</th>
                  <th className="px-3 py-2 text-right font-semibold text-indigo-700 uppercase tracking-wider">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map(line => (
                  <tr key={line.id} className="bg-white hover:bg-blue-50/50">
                    <td className="px-3 py-2 text-gray-800">{line.description}</td>
                    <td className="px-3 py-2 text-right text-gray-800">{line.qty}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${line.unitPrice}</td>
                    <td className="px-3 py-2 text-right text-gray-800">${line.qty * line.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 space-y-1 text-right text-sm">
            <p className="text-gray-700">Subtotal: ${subtotal}</p>
            <p className="text-gray-700">VAT 18%: ${vat}</p>
            <p className="text-gray-900 font-medium">Total: ${total}</p>
          </div>
        </section>
      </div>
    </div>
  )
}
