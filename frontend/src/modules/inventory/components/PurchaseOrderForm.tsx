// @ts-nocheck
import React from 'react'

export default function PurchaseOrderForm() {
  return (
    <form className="grid max-w-md gap-3">
      <h2 className="text-lg font-medium">Purchase Order</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Supplier</span>
        <input
          defaultValue="Media Supplies Ltd"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Expected delivery</span>
        <input
          type="date"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Save Purchase Order (demo)
      </button>
    </form>
  )
}
