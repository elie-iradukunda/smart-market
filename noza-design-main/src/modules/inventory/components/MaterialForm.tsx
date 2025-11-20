// @ts-nocheck
import React from 'react'

export default function MaterialForm() {
  return (
    <form className="grid max-w-md gap-3">
      <h2 className="text-lg font-medium">Material</h2>
      <label className="text-sm">
        <span className="block text-gray-700">SKU</span>
        <input
          defaultValue="VINYL-3M-GLOSS"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Name</span>
        <input
          defaultValue="3m Glossy Vinyl"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Category</span>
        <input
          defaultValue="Vinyl"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Unit of Measure</span>
        <input
          defaultValue="m"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Save Material (demo)
      </button>
    </form>
  )
}
