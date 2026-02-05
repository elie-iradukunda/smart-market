// @ts-nocheck
import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchMaterial, createMaterial, updateMaterial, deleteMaterial } from '../../api/apiClient'
import { toast } from 'react-toastify'
import { getAuthUser, currentUserHasPermission } from '@/utils/apiClient'
import { Info, Package, Settings, Trash2, Save, ArrowLeft, BookOpen, History, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

export default function MaterialDetailPage() {
    const { sku } = useParams()
    const navigate = useNavigate()
    const user = getAuthUser()
    const dashboardPrefix = user?.role_id === 1 ? 'admin' : 'staff'
    const isNew = sku === 'new'
    const [material, setMaterial] = useState<any | null>(null)
    const [name, setName] = useState('')
    const [unit, setUnit] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [usageInstructions, setUsageInstructions] = useState('')
    const [reorderLevel, setReorderLevel] = useState<number | string>('')
    const [currentStock, setCurrentStock] = useState<number | string>('')
    const [initialStock, setInitialStock] = useState<number | string>('0')
    const [movements, setMovements] = useState<any[]>([])
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canEdit = currentUserHasPermission('*') || currentUserHasPermission('inventory.manage')

    useEffect(() => {
        if (!sku || sku === 'undefined' || isNew) return
        let isMounted = true
        setLoading(true)
        setError(null)

        fetchMaterial(sku)
            .then((res) => {
                if (!isMounted) return
                // Robustly handle both {success, data} and raw object
                const data = res.data || res;
                setMaterial(data)
                setName(data.name || '')
                setUnit(data.unit || '')
                setCategory(data.category || '')
                setDescription(data.description || '')
                setUsageInstructions(data.usage_instructions || '')
                setReorderLevel(data.reorder_level ?? '')
                setCurrentStock(data.current_stock ?? '')
                setMovements(data.movements || [])
            })
            .catch((err) => {
                if (!isMounted) return
                setError(err.message || 'Failed to load material')
            })
            .finally(() => {
                if (!isMounted) return
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [sku, isNew])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        try {
            const payload = {
                name,
                unit,
                category,
                description,
                usage_instructions: usageInstructions,
                reorder_level: reorderLevel === '' ? null : Number(reorderLevel),
                initial_stock: isNew ? Number(initialStock) : undefined
            }
            if (isNew) {
                await createMaterial(payload)
                toast.success('Material created successfully')
                // Clear form to allow creating another one
                setName('')
                setUnit('')
                setCategory('')
                setDescription('')
                setUsageInstructions('')
                setReorderLevel('')
                setInitialStock('0')
                // Stay on the same page (inventory/materials/new)
                navigate(`/dashboard/${dashboardPrefix}/inventory/materials/new`)
            } else {
                await updateMaterial(sku!, payload)
                toast.success('Material updated successfully')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to save material')
            toast.error(err.message || 'Failed to save material')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (isNew || !sku) return
        if (!window.confirm('Delete this material? This cannot be undone.')) return
        setSaving(true)
        setError(null)
        try {
            await deleteMaterial(sku)
            navigate(`/dashboard/${dashboardPrefix}/inventory/materials`)
        } catch (err: any) {
            setError(err.message || 'Failed to delete material')
        } finally {
            setSaving(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => navigate(`/dashboard/${dashboardPrefix}/inventory/materials`)}
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Materials
                        </button>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 blur-3xl opacity-10">
                            <div className="h-32 w-32 rounded-full bg-indigo-500"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 mb-3 border border-indigo-100 uppercase tracking-wider">
                                Inventory Asset
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
                                {isNew ? 'New Production Material' : loading ? 'Retrieving Asset...' : material?.name || 'Material Details'}
                            </h1>
                            <p className="mt-2 text-slate-500 text-sm max-w-lg">
                                {isNew
                                    ? 'Onboard a new raw material into the production inventory system.'
                                    : 'Review technical specifications and stock telemetry for this material.'}
                            </p>
                        </div>

                        {!isNew && !loading && (
                            <div className="flex items-center gap-3">
                                <div className="text-right mr-4 sm:block hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Stock</p>
                                    <p className="text-2xl font-black text-slate-900">{currentStock} <span className="text-xs font-medium text-slate-400">{unit}</span></p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                    <Package size={24} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            {/* General Information */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Info size={18} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">General Information</h3>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Material Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                readOnly={!canEdit}
                                                placeholder="e.g. Glossy Vinyl Roll"
                                                className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none ${!canEdit ? 'bg-slate-50 border-slate-100 text-slate-600' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                                            <input
                                                type="text"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                readOnly={!canEdit}
                                                placeholder="e.g. Printing Media"
                                                className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none ${!canEdit ? 'bg-slate-50 border-slate-100 text-slate-600' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Professional Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            readOnly={!canEdit}
                                            rows={3}
                                            placeholder="Detailed technical specifications, material grade, and property highlights..."
                                            className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none resize-none ${!canEdit ? 'bg-slate-50 border-slate-100 text-slate-600' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 mb-1.5 ml-1">
                                            <BookOpen size={14} className="text-emerald-600" />
                                            <label className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Production Usage Instructions</label>
                                        </div>
                                        <textarea
                                            value={usageInstructions}
                                            onChange={(e) => setUsageInstructions(e.target.value)}
                                            readOnly={!canEdit}
                                            rows={4}
                                            placeholder="How to handle this material during production? Cutting notes, temperature requirements, etc..."
                                            className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none resize-none ${!canEdit ? 'bg-emerald-50/20 border-emerald-100 text-slate-700' : 'border-emerald-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-emerald-50/10'}`}
                                        />
                                    </div>

                                    {isNew && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 mb-1.5 ml-1">
                                                <TrendingUp size={14} className="text-blue-600" />
                                                <label className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Opening Stock Level</label>
                                            </div>
                                            <input
                                                type="number"
                                                value={initialStock}
                                                onChange={(e) => setInitialStock(e.target.value)}
                                                placeholder="Enter initial quantity on hand..."
                                                className="w-full rounded-2xl border border-blue-100 bg-blue-50/10 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1 ml-1">Setting this will automatically record the initial inventory balance.</p>
                                        </div>
                                    )}

                                    {canEdit && (
                                        <div className="flex items-center gap-3 pt-4">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all"
                                            >
                                                {saving ? <Settings className="animate-spin" size={18} /> : <Save size={18} />}
                                                {isNew ? 'Onboard Material' : 'Commit Changes'}
                                            </button>

                                            {!isNew && (
                                                <button
                                                    type="button"
                                                    onClick={handleDelete}
                                                    disabled={saving}
                                                    className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-100 hover:border-red-200 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                    Decommission
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Inventory Settings */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Settings size={18} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Inventory Control</h3>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Measurement Unit</label>
                                        <input
                                            type="text"
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            readOnly={!canEdit}
                                            placeholder="e.g. roll, kg, meter"
                                            className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none ${!canEdit ? 'bg-slate-50 border-slate-100 text-slate-600' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Reorder Level (Critical Alert)</label>
                                        <input
                                            type="number"
                                            value={reorderLevel}
                                            onChange={(e) => setReorderLevel(e.target.value)}
                                            readOnly={!canEdit}
                                            className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all outline-none ${!canEdit ? 'bg-slate-50 border-slate-100 text-slate-600' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}`}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1 ml-1 px-1 leading-relaxed">System will trigger a restock notification when inventory drops below this value.</p>
                                    </div>

                                    {!isNew && (
                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Current Balance</p>
                                            <p className="text-2xl font-black text-indigo-600">{currentStock} <span className="text-xs font-bold text-slate-500">{unit}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pro Tip Card */}
                            <div className="rounded-3xl bg-slate-900 p-6 shadow-xl text-white">
                                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                    Operational Tip
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Ensure that usage instructions are clear and technical to minimize production waste and improve overall quality consistency.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stock Movements History */}
                    {!isNew && !loading && (
                        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden mt-8">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                        <History size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Inventory Audit Log</h3>
                                        <p className="text-xs text-slate-500">History of stock movements, receipts, and allocations.</p>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-xs font-medium text-slate-400">Showing last 50 movements</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Date & Time</th>
                                            <th className="px-8 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Type</th>
                                            <th className="px-8 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-right">Quantity</th>
                                            <th className="px-8 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Reference / Purpose</th>
                                            <th className="px-8 py-4 font-bold text-[10px] text-slate-400 uppercase tracking-wider">Recorded By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {movements.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                                        <Package size={32} strokeWidth={1} />
                                                        <p className="text-sm">No inventory movements recorded yet.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            movements.map((move) => (
                                                <tr key={move.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-4 text-slate-600 font-medium">
                                                        {move.created_at ? format(new Date(move.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${['grn', 'adjustment_plus'].includes(move.type)
                                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                            }`}>
                                                            {['grn', 'adjustment_plus'].includes(move.type) ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                            {move.type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className={`px-8 py-4 text-right font-black ${['grn', 'adjustment_plus'].includes(move.type) ? 'text-emerald-600' : 'text-rose-600'
                                                        }`}>
                                                        {['grn', 'adjustment_plus'].includes(move.type) ? '+' : '-'}{move.quantity}
                                                    </td>
                                                    <td className="px-8 py-4 text-slate-600">
                                                        {move.reference || 'N/A'}
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                                {(move.user_name || 'U').charAt(0)}
                                                            </div>
                                                            <span className="text-slate-600 font-medium text-xs">{move.user_name || 'System'}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
