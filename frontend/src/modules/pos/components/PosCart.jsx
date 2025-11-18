import React from 'react';
import PosPaymentDialog from './PosPaymentDialog';

export default function PosCart() {
  const items = [
    { id: 1, name: 'PVC Banner 3m x 1m', qty: 1, price: 45 },
    { id: 2, name: 'T-Shirt Vinyl Print', qty: 5, price: 7 },
  ];

  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + tax;

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-lg font-medium">Cart</h2>
      <div className="mt-2 space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <div>
              <p className="text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-500">
                Qty {item.qty} × ${item.price}
              </p>
            </div>
            <p className="text-gray-800">${item.qty * item.price}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-1 border-t border-gray-200 pt-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-800">${subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">VAT 18%</span>
          <span className="text-gray-800">${tax}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span className="text-gray-800">Total</span>
          <span className="text-gray-900">${total}</span>
        </div>
      </div>
      <div className="mt-4">
        <PosPaymentDialog total={total} />
      </div>
    </div>
  );
}

