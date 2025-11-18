import React from 'react';

export default function QuoteItemsTable() {
  const items = [
    { id: 1, description: 'Full color PVC banner 3m x 1m', qty: 4, unitPrice: 45 },
    { id: 2, description: 'Design fee', qty: 1, unitPrice: 30 },
  ];

  const total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium">Quote Items</h3>
      <div className="mt-2 overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Item</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Qty</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Unit Price</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{item.description}</td>
                <td className="px-3 py-2 text-right text-gray-800">{item.qty}</td>
                <td className="px-3 py-2 text-right text-gray-800">${item.unitPrice}</td>
                <td className="px-3 py-2 text-right text-gray-800">${item.qty * item.unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-right text-sm font-medium text-gray-800">Total: ${total}</p>
    </div>
  );
}

