// @ts-nocheck
import React, { useEffect, useState } from 'react'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import { fetchStockMovements, createStockMovement, fetchMaterials } from '@/api/apiClient'

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ material_id: '', type: 'grn', quantity: '0', reference: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const [moves, mats] = await Promise.all([fetchStockMovements(), fetchMaterials()])
      setMovements(moves)
      setMaterials(mats)
    } catch (err: any) {
      setError(err.message || 'Failed to load stock data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      const payload = {
        material_id: Number(form.material_id),
        type: form.type,
        quantity: Number(form.quantity || '0'),
        reference: form.reference,
      }
      await createStockMovement(payload)
      setForm({ material_id: '', type: 'grn', quantity: '0', reference: '' })
      await load()
    } catch (err: any) {
      setError(err.message || 'Failed to record stock movement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryTopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Stock movements</h1>
        </div>

        {error && <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[1.4fr,2fr] items-start">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800">Record movement</h2>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.material_id}
              onChange={(e) => setForm({ ...form, material_id: e.target.value })}
              required
            >
              <option value="">Select material</option>
              {materials.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="grn">Goods receipt (GRN)</option>
              <option value="issue">Issue to production</option>
              <option value="return">Return from production</option>
              <option value="adjustment">Stock adjustment</option>
              <option value="damage">Damage / loss</option>
            </select>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Quantity"
              type="number"
              step="0.01"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Reference (e.g. PO#, Work order#, note)"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              Save movement
            </button>
          </form>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Recent movements</h2>
              {loading && <span className="text-xs text-gray-400">Loading…</span>}
            </div>
            <div className="overflow-x-auto text-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Material</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Type</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {movements.map((mv) => (
                    <tr key={mv.id}>
                      <td className="px-3 py-2 text-gray-500 text-xs">{mv.created_at}</td>
                      <td className="px-3 py-2 text-gray-900">{mv.material_name}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{mv.type}</td>
                      <td className="px-3 py-2 text-right text-gray-900">{mv.quantity}</td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{mv.reference}</td>
                    </tr>
                  ))}
                  {movements.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-xs text-gray-400">
                        No stock movements recorded yet.
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
