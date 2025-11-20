import React from 'react';

export default function OrderForm() {
  return (
    <form className="grid max-w-md gap-3">
      <h2 className="text-lg font-medium">Order Header</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Order number</span>
        <input
          defaultValue="ORD-23001"
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
        <span className="block text-gray-700">Job name</span>
        <input
          defaultValue="Opening Ceremony Banners"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Due date</span>
        <input
          type="date"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Save Order (demo)
      </button>
    </form>
  );
}

