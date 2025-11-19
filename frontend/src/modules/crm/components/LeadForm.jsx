import React from 'react';

export default function LeadForm() {
  return (
    <form className="grid max-w-md gap-3">
      <h2 className="text-lg font-medium">New Lead</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Lead name</span>
        <input
          defaultValue="Back to School Banner"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Customer name</span>
        <input
          defaultValue="Acme School"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Channel</span>
        <select
          defaultValue="WhatsApp"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option>Walk-in</option>
          <option>Phone</option>
          <option>WhatsApp</option>
          <option>Instagram</option>
          <option>Facebook</option>
          <option>Email</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Estimated value (USD)</span>
        <input
          type="number"
          defaultValue={450}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Save Lead (demo)
      </button>
    </form>
  );
}

