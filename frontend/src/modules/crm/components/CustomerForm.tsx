// @ts-nocheck
import React, { useState } from 'react'
import { createCustomer } from '@/api/apiClient'

export default function CustomerForm() {
  const [name, setName] = useState('Acme School')
  const [contactName, setContactName] = useState('Mr. Daniel')
  const [phone, setPhone] = useState('+256 700 000111')
  const [email, setEmail] = useState('bursar@acmeschool.ug')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await createCustomer({ name, contact_name: contactName, phone, email })
      setSuccess('Customer saved to backend')
    } catch (err) {
      setError(err.message || 'Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid max-w-md gap-3" onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium">Customer</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Name</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Contact person</span>
        <input
          value={contactName}
          onChange={e => setContactName(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Phone</span>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Email</span>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
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
        {saving ? 'Saving…' : 'Save Customer'}
      </button>
    </form>
  )
}
