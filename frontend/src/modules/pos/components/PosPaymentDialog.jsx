import React from 'react';

export default function PosPaymentDialog({ total }) {
  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
      <h3 className="text-md font-medium">Payment</h3>
      <p className="mt-1 text-gray-700">Amount due: ${total}</p>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <button
          type="button"
          className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Cash
        </button>
        <button
          type="button"
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Mobile Money
        </button>
        <button
          type="button"
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Card
        </button>
      </div>
    </div>
  );
}

