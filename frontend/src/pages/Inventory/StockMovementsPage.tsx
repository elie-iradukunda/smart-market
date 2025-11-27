// @ts-nocheck
import React, { useEffect, useState } from 'react'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import { fetchStockMovements, createStockMovement, fetchMaterials } from '@/api/apiClient'

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
    <div className="min-h-screen bg-gray-50">
      <InventoryTopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
            <p className="text-sm text-gray-500">Track and manage all inventory movements</p>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr,2fr] items-start">
          {/* Stock Movement Form */}
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Record Movement <span className="text-sm font-normal text-red-500">* Required fields</span>
            </h2>
            
            {/* Material Selection */}
            <div>
              <label htmlFor="material_id" className="block text-sm font-medium text-gray-700 mb-1">
                Material <span className="text-red-500">*</span>
              </label>
              <select
                id="material_id"
                name="material_id"
                className={`w-full rounded-md border ${
                  error && !form.material_id ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-sm`}
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
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Movement Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                name="quantity"
                className={`w-full rounded-md border ${
                  error && (!form.quantity || isNaN(parseFloat(form.quantity)) || parseFloat(form.quantity) <= 0) 
                    ? 'border-red-300' 
                    : 'border-gray-300'
                } px-3 py-2 text-sm`}
                placeholder="Enter quantity"
                type="number"
                step="0.01"
                min="0.01"
                value={form.quantity}
                onChange={handleChange}
                required
                disabled={saving}
              />
              {error && (!form.quantity || isNaN(parseFloat(form.quantity)) || parseFloat(form.quantity) <= 0) && (
                <p className="mt-1 text-xs text-red-600">Please enter a valid quantity greater than 0</p>
              )}
            </div>
            
            {/* Reference */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                id="reference"
                name="reference"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Processing...' : 'Record Movement'}
              </button>
            </div>
          </form>

          {/* Recent Movements */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Movements</h2>
            </div>
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading movements...</div>
            ) : movements.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No stock movements found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {movements.slice(0, 10).map((movement) => (
                  <div key={movement.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {movement.material_name || 'Unknown Material'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(movement.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          movement.type === 'grn' || movement.type === 'return' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {movement.type === 'grn' || movement.type === 'return' ? '+' : '-'}{movement.quantity} 
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{movement.type}</p>
                      </div>
                    </div>
                    {movement.reference && (
                      <p className="mt-1 text-xs text-gray-500">Ref: {movement.reference}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}