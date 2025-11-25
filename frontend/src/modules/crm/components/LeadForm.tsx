// @ts-nocheck
import React, { useState } from 'react'
import { createLead } from '@/api/apiClient'

export default function LeadForm() {
  const [leadName, setLeadName] = useState('Back to School Banner')
  const [customerName, setCustomerName] = useState('Acme School')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [source, setSource] = useState('whatsapp')
  const [estimatedValue, setEstimatedValue] = useState(450)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await createLead({
        name: leadName,
        customer_name: customerName,
        phone,
        email,
        address,
        source,
        channel: source, // backend will normalise channel enum from this
        estimated_value: estimatedValue,
      })
      setSuccess('Lead saved to backend')
    } catch (err) {
      setError(err.message || 'Failed to save lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid max-w-md gap-3" onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium">New Lead</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Lead name</span>
        <input
          value={leadName}
          onChange={e => setLeadName(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Customer name</span>
        <input
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
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
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Address</span>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Source / Channel</span>
        <select
          value={source}
          onChange={e => setSource(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="walkin">Walk-in</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="web">Website / Email</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Estimated value (USD)</span>
        <input
          type="number"
          value={estimatedValue}
          onChange={e => setEstimatedValue(Number(e.target.value) || 0)}
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
        {saving ? 'Saving…' : 'Save Lead'}
      </button>
    </form>
  )
}
