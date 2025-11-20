// @ts-nocheck
import React, { useState } from 'react'
import { recordPayment } from '@/api/apiClient'

export default function PaymentForm() {
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Mobile Money')
  const [reference, setReference] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await recordPayment({
        invoice_id: Number(invoiceId),
        method,
        amount: Number(amount),
        reference: reference || null,
      })
      setSuccess('Payment recorded in backend')
    } catch (err) {
      setError(err.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid max-w-md gap-3" onSubmit={handleSubmit}>
      <h2 className="text-lg font-medium">Record Payment</h2>
      <label className="text-sm">
        <span className="block text-gray-700">Invoice ID</span>
        <input
          value={invoiceId}
          onChange={e => setInvoiceId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Amount</span>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        />
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Method</span>
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option>Cash</option>
          <option>Mobile Money</option>
          <option>Bank Transfer</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="block text-gray-700">Reference</span>
        <input
          value={reference}
          onChange={e => setReference(e.target.value)}
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
        {saving ? 'Saving…' : 'Save Payment'}
      </button>
    </form>
  )
}
