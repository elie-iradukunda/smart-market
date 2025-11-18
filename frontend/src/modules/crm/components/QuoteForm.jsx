import React from 'react';

export default function QuoteForm() {
  return (
    <form className="grid max-w-md gap-3">
      <h2 className="text-lg font-medium">Quote Header</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Quote number</span>
        <input
          defaultValue="Q-9001"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Customer</span>
        <input
          defaultValue="Acme School"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Job title</span>
        <input
          defaultValue="Opening Ceremony Banners"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Valid until</span>
        <input
          type="date"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Deposit required (%)</span>
        <input
          type="number"
          defaultValue={50}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Save Quote (demo)
      </button>
    </form>
  );
}

