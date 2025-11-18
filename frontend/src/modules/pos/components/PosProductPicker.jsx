import React from 'react';

export default function PosProductPicker() {
  const products = [
    { id: 1, name: 'PVC Banner 3m x 1m', price: 45 },
    { id: 2, name: 'T-Shirt Vinyl Print', price: 7 },
    { id: 3, name: 'Sticker Sheet A4', price: 3 },
  ];

  return (
    <div>
      <h2 className="text-lg font-medium">Quick Products</h2>
      <div className="mt-3 grid gap-2 text-sm">
        {products.map(p => (
          <button
            key={p.id}
            type="button"
            className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-left hover:bg-gray-50"
          >
            <span className="text-gray-800">{p.name}</span>
            <span className="text-gray-700">${p.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

