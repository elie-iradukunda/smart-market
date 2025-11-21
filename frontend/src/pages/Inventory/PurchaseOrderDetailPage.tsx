// @ts-nocheck
import React, { useEffect, useState } from 'react'
import InventoryTopNav from '@/components/layout/InventoryTopNav'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchPurchaseOrder, createPurchaseOrder, updatePurchaseOrder, fetchSuppliers } from '../../api/apiClient'
import OwnerTopNav from '@/components/layout/OwnerTopNav'

export default function PurchaseOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [po, setPo] = useState<any | null>(null)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [total, setTotal] = useState<string | number>('')
  const [status, setStatus] = useState('Draft')
  const [eta, setEta] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || isNew) return
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchPurchaseOrder(id)
      .then((data) => {
        if (!isMounted) return
        setPo(data)
        setSupplierId(String(data.supplier_id))
        setTotal(data.total || '')
        setStatus(data.status || 'Draft')
        setEta(data.eta || '')
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load purchase order')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, isNew])

  // Load suppliers for dropdown
  useEffect(() => {
    let isMounted = true
    fetchSuppliers()
      .then((data) => {
        if (!isMounted) return
        setSuppliers(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        // ignore supplier load errors here; form will still allow manual entry if needed later
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload: any = {
        supplier_id: supplierId ? Number(supplierId) : undefined,
        total: total === '' ? null : Number(total),
        status,
        eta: eta || null,
      }
      if (isNew) {
        const created = await createPurchaseOrder(payload)
        navigate(`/inventory/purchase-orders/${created.id}`)
      } else {
        await updatePurchaseOrder(id!, payload)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save purchase order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryTopNav />
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Purchase order</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
              {isNew ? 'New purchase order' : loading ? 'Loading...' : po?.id || 'Purchase order'}
            </h1>
            {!isNew && po && (
              <p className="mt-2 text-sm text-gray-600">{po.supplier_name}</p>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl max-w-xl">
          {error && (
            <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select supplier…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Received">Received</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ETA</label>
            <input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : isNew ? 'Create PO' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}
