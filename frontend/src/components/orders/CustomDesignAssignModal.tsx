// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { User, X, Check, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { updateCustomDesignOrderStatus } from '@/api/apiClient'

interface CustomDesignAssignModalProps {
    orderId: number
    currentAssigneeId?: number
    onClose: () => void
    onAssigned: () => void
}

export default function CustomDesignAssignModal({ orderId, currentAssigneeId, onClose, onAssigned }: CustomDesignAssignModalProps) {
    const [workers, setWorkers] = useState([])
    const [selectedWorker, setSelectedWorker] = useState(currentAssigneeId || null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [productionStage, setProductionStage] = useState<string>('design')

    useEffect(() => {
        loadWorkers()
    }, [])

    async function loadWorkers() {
        try {
            setLoading(true)
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'}/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) throw new Error('Failed to load workers')

            const data = await response.json()
            // Filter for staff role (role_id: 3 or 5 or whatever is relevant)
            // Looking at previous data, technician might be role_id 5 or role name 'Technician Officer'
            const staffMembers = data.filter((user: any) =>
                [1, 2, 3, 5, 7].includes(user.role_id) // Allow Admin, Technician, etc.
            )
            setWorkers(staffMembers)
        } catch (err) {
            console.error('Failed to load workers:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleAssign() {
        if (!selectedWorker) {
            toast.error('Please select a staff member')
            return
        }

        try {
            setSubmitting(true)
            // We pass 'in_production' as the status to ensure the order moves to production state
            await updateCustomDesignOrderStatus(orderId, 'in_production', undefined, selectedWorker, productionStage)
            toast.success('Staff assigned and production started!')
            onAssigned()
            onClose()
        } catch (err) {
            console.error('Failed to assign staff:', err)
            toast.error('Failed to assign staff')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Assign Staff</h2>
                            <p className="text-sm text-slate-600">Select a team member for Custom Design #{orderId}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Production Stage</label>
                            <select
                                value={productionStage}
                                onChange={(e) => setProductionStage(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value="design">Design</option>
                                <option value="prepress">Pre-press</option>
                                <option value="print">Printing</option>
                                <option value="finishing">Finishing</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Workers List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                ) : workers.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                        <User size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-600">No staff members available</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-2">
                        {workers.map(worker => (
                            <button
                                key={worker.id}
                                onClick={() => setSelectedWorker(worker.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedWorker === worker.id
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${selectedWorker === worker.id ? 'bg-indigo-600' : 'bg-slate-400'
                                        }`}>
                                        {worker.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-900">{worker.name}</p>
                                        <p className="text-xs text-slate-500">{worker.email}</p>
                                    </div>
                                </div>
                                {selectedWorker === worker.id && (
                                    <Check size={20} className="text-indigo-600" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedWorker || submitting}
                        className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            'Assign & Update'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
