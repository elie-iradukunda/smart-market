// @ts-nocheck
import React from 'react'

export default function CampaignForm() {
  return (
    <form className="grid max-w-md gap-3">
      <h2 className="text-lg font-medium">Campaign</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Name</span>
        <input
          defaultValue="Back to School Banners"
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Channel</span>
        <select className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none">
          <option>Facebook/Instagram</option>
          <option>WhatsApp</option>
          <option>X (Twitter)</option>
          <option>Google</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Daily budget (USD)</span>
        <input
          type="number"
          defaultValue={25}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Objective</span>
        <select className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none">
          <option>Lead Generation</option>
          <option>Traffic</option>
          <option>Conversions</option>
        </select>
      </label>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Save Campaign (demo)
      </button>
    </form>
  )
}
