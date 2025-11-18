import React from 'react';

export default function StockMovementTable() {
  const movements = [
    { id: 1, type: 'GRN', sku: 'VINYL-3M-GLOSS', qty: 50, uom: 'm', ref: 'PO-1001' },
    { id: 2, type: 'Issue to Job', sku: 'VINYL-3M-GLOSS', qty: -12, uom: 'm', ref: 'WO-501' },
  ];

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium">Stock Movements</h3>
      <div className="mt-2 overflow-x-auto rounded border border-gray-200 bg-white text-sm">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Type</th>
              <th className="px-3 py-2 font-medium text-gray-700">SKU</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Qty</th>
              <th className="px-3 py-2 font-medium text-gray-700">UoM</th>
              <th className="px-3 py-2 font-medium text-gray-700">Reference</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(mv => (
              <tr key={mv.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{mv.type}</td>
                <td className="px-3 py-2 text-gray-800">{mv.sku}</td>
                <td className="px-3 py-2 text-right text-gray-800">{mv.qty}</td>
                <td className="px-3 py-2 text-gray-800">{mv.uom}</td>
                <td className="px-3 py-2 text-gray-800">{mv.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

