// @ts-nocheck
import React from 'react'

export default function QuoteItemsTable({ items }) {
  const rows = items || []

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-xs sm:text-sm">
      <h2 className="text-sm font-medium text-gray-900 mb-2">Quote items</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Description</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Qty</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Unit price</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Line total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(item => {
              const qty = item.qty || item.quantity || 0
              const unit = item.unitPrice || item.unit_price || 0
              const total = qty * unit

              return (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{item.description || item.name}</td>
                  <td className="px-3 py-2 text-right text-gray-800">{qty}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${unit}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
