// @ts-nocheck
import React, { useEffect, useState } from 'react'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/api/apiClient'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ id: null as number | null, name: '', contact: '', rating: '0' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchSuppliers()
      setSuppliers(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleEdit = (s: any) => {
    setForm({ id: s.id, name: s.name || '', contact: s.contact || '', rating: String(s.rating ?? 0) })
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this supplier?')) return
    try {
      setSaving(true)
      await deleteSupplier(id)
      await load()
    } catch (err: any) {
      setError(err.message || 'Failed to delete supplier')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      const payload = {
        name: form.name,
        contact: form.contact,
        rating: Number(form.rating || '0'),
      }
      if (form.id) {
        await updateSupplier(form.id, payload)
      } else {
        await createSupplier(payload)
      }
      setForm({ id: null, name: '', contact: '', rating: '0' })
      await load()
    } catch (err: any) {
      setError(err.message || 'Failed to save supplier')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryTopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Suppliers</h1>
        </div>

        {error && <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[1.4fr,2fr] items-start">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800">Add / edit supplier</h2>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Contact (phone / email)"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Rating (0-5)"
              type="number"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {form.id ? 'Update supplier' : 'Create supplier'}
            </button>
          </form>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Supplier list</h2>
              {loading && <span className="text-xs text-gray-400">Loading…</span>}
            </div>
            <div className="overflow-x-auto text-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Contact</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Rating</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-2 text-gray-900">{s.name}</td>
                      <td className="px-3 py-2 text-gray-500">{s.contact}</td>
                      <td className="px-3 py-2 text-gray-500">{s.rating}</td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(s)}
                          className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {suppliers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-xs text-gray-400">
                        No suppliers yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
