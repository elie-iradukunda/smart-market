import React from 'react';

export default function CustomerForm() {
  return (
    <form className="grid max-w-md gap-3">
      <h2 className="text-lg font-medium">Customer Profile</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Customer name</span>
        <input
          defaultValue="Acme School"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Contact person</span>
        <input
          defaultValue="Mr. Daniel"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Phone</span>
        <input
          defaultValue="+256 700 000111"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Email</span>
        <input
          defaultValue="bursar@acmeschool.ug"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Segment</span>
        <select
          defaultValue="Institution"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option>Individual</option>
          <option>SME</option>
          <option>Corporate</option>
          <option>Institution</option>
        </select>
      </label>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Save Customer (demo)
      </button>
    </form>
  );
}

