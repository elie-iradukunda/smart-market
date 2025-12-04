// @ts-nocheck
import React, { useState } from 'react'
import { createCampaign } from '@/api/apiClient'

export default function CampaignForm({ onCreated, onClose }) {
  const [name, setName] = useState('Back to School Banners')
  const [channel, setChannel] = useState('Facebook/Instagram')
  const [budget, setBudget] = useState(25)
  const [objective, setObjective] = useState('Lead Generation')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)

    try {
      const payload = {
        name,
        channel,
        budget: Number(budget) || 0,
      }

      const result = await createCampaign(payload)
      if (onCreated) {
        onCreated(result)
      }
      if (onClose) {
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save campaign')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid max-w-md gap-3" onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium">Campaign</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Name</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Channel</span>
        <select
          value={channel}
          onChange={e => setChannel(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option>Facebook/Instagram</option>
          <option>WhatsApp</option>
          <option>X (Twitter)</option>
          <option>Google</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Daily budget (RWF)</span>
        <input
          type="number"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Objective</span>
        <select
          value={objective}
          onChange={e => setObjective(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option>Lead Generation</option>
          <option>Traffic</option>
          <option>Conversions</option>
        </select>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Campaign'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
