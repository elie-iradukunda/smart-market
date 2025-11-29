// @ts-nocheck
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchStockMovements, createStockMovement, fetchMaterials } from '@/api/apiClient'
import { ArrowLeftRight, Package, Calendar, FileText } from 'lucide-react'

interface Material {
  id: number
  name: string
  unit?: string
}

interface StockMovement {
  id: number
  material_id: number
  material_name: string
  type: 'grn' | 'issue' | 'return' | 'adjustment' | 'damage'
  quantity: number
  reference: string
  created_at: string
}

interface StockMovementForm {
  material_id: string
  type: 'grn' | 'issue' | 'return' | 'adjustment' | 'damage'
  quantity: string
  reference: string
}

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<StockMovementForm>({
    material_id: '',
    type: 'grn',
    quantity: '0',
    reference: ''
  })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)

      const [movesResponse, matsResponse] = await Promise.all([
        fetchStockMovements().catch(err => {
          console.error('Error fetching stock movements:', err)
          return []
        }),
        fetchMaterials().catch(err => {
          console.error('Error fetching materials:', err)
          return []
        })
      ])

      setMovements(Array.isArray(movesResponse) ? movesResponse : [])
      setMaterials(Array.isArray(matsResponse) ? matsResponse : [])
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stock data'
      setError(errorMessage)
      console.error('Error in load:', err)
      setMovements([])
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const validateForm = (): boolean => {
    if (!form.material_id) {
      setError('Please select a material')
      return false
    }
    if (!form.quantity || isNaN(parseFloat(form.quantity)) || parseFloat(form.quantity) <= 0) {
      setError('Please enter a valid quantity')
      return false
    }
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      const payload = {
        material_id: Number(form.material_id),
        type: form.type,
        quantity: parseFloat(form.quantity),
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
            <p className="text-sm text-gray-500">Track and manage all inventory movements</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr,2fr] items-start">
          {/* Stock Movement Form */}
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ArrowLeftRight size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Record Movement</h2>
                <p className="text-xs text-gray-500">Update stock levels manually</p>
              </div>
            </div>

            {/* Material Selection */}
            <div>
              <label htmlFor="material_id" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Material <span className="text-red-500">*</span>
              </label>
              <select
                id="material_id"
                name="material_id"
                className={`w-full rounded-xl border ${error && !form.material_id ? 'border-red-300' : 'border-gray-200'
                  } px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white`}
                value={form.material_id}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="">Select material</option>
                {materials.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name} {m.unit ? `(${m.unit})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Movement Type */}
            <div>
              <label htmlFor="type" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Movement Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={form.type}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="grn">Goods Receipt (GRN)</option>
                <option value="issue">Issue to Production</option>
                <option value="return">Return from Production</option>
                <option value="adjustment">Stock Adjustment</option>
                <option value="damage">Damage / Loss</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                name="quantity"
                className={`w-full rounded-xl border ${error && (!form.quantity || isNaN(parseFloat(form.quantity)) || parseFloat(form.quantity) <= 0)
                    ? 'border-red-300'
                    : 'border-gray-200'
                  } px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                placeholder="Enter quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={form.quantity}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>

            {/* Reference */}
            <div>
              <label htmlFor="reference" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Reference
              </label>
              <input
                id="reference"
                name="reference"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g., PO#, Work order#, note"
                value={form.reference}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? 'Processing...' : 'Record Movement'}
              </button>
            </div>
          </form>

          {/* Recent Movements */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Movements</h2>
              <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                <FileText size={16} />
              </div>
            </div>
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent mb-2"></div>
                <p className="text-xs">Loading movements...</p>
              </div>
            ) : movements.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Package className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium">No stock movements found</p>
                <p className="text-xs mt-1">Record your first movement to see it here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {movements.slice(0, 10).map((movement) => (
                  <div key={movement.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full ${movement.type === 'grn' || movement.type === 'return'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                          }`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {movement.material_name || 'Unknown Material'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(movement.created_at).toLocaleDateString()}
                            </span>
                            {movement.reference && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded-md">
                                {movement.reference}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-bold ${movement.type === 'grn' || movement.type === 'return'
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                          }`}>
                          {movement.type === 'grn' || movement.type === 'return' ? '+' : '-'}{movement.quantity}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5">
                          {movement.type === 'grn' ? 'Received' : movement.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}