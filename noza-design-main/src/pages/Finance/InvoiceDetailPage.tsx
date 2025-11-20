// @ts-nocheck
import React from 'react'

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
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Invoice</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{invoice.id}</h1>
          <p className="mt-2 text-sm text-gray-600">{invoice.customer}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{invoice.status}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Due date</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{invoice.dueDate}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Total</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${total}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-sm space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Lines</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Description</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Qty</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Unit price</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Line total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => (
                <tr key={line.id} className="border-t border-gray-100 hover:bg-gray-50">
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
  )
}
