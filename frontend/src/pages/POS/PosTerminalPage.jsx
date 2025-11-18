import React from 'react';
import PosCart from '../../modules/pos/components/PosCart';
import PosProductPicker from '../../modules/pos/components/PosProductPicker';

export default function PosTerminalPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">POS</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Walk-in sales</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Quick picking and checkout for counter sales. This screen is designed for speed and clarity at reception.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr,2fr] items-start">
        <PosProductPicker />
        <PosCart />
      </div>
    </div>
  );
}

