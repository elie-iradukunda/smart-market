// @ts-nocheck
import React, { useState } from 'react'
import { createRole } from '@/api/apiClient'

export default function RoleForm() {
  const [name, setName] = useState('Receptionist')
  const [description, setDescription] = useState('Handles leads, quotes, orders, deposits, and receipts.')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await createRole({ name, description })
      setSuccess('Role saved to backend')
    } catch (err) {
      setError(err.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid max-w-md gap-3" onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium">Role</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Name</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Description</span>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-emerald-600">{success}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 inline-flex items-center justify-center rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Role'}
      </button>
    </form>
  )
}
