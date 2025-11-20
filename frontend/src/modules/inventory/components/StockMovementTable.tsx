// @ts-nocheck
import React from 'react'

export default function StockMovementTable() {
  const movements = [
    { id: 1, date: '2025-11-18', type: 'Issue', qty: -10, ref: 'WO-501' },
    { id: 2, date: '2025-11-17', type: 'Receipt', qty: 50, ref: 'PO-1001' },
  ]

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-xs sm:text-sm">
      <h2 className="text-sm font-medium text-gray-900 mb-2">Stock movements (demo)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Date</th>
              <th className="px-3 py-2 font-medium text-gray-700">Type</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Qty</th>
              <th className="px-3 py-2 font-medium text-gray-700">Ref</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{m.date}</td>
                <td className="px-3 py-2 text-gray-800">{m.type}</td>
                <td className="px-3 py-2 text-right text-gray-800">{m.qty}</td>
                <td className="px-3 py-2 text-gray-800">{m.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
