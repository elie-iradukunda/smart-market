// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Palette,
    ArrowLeft,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Loader2,
    Eye,
    Mail,
    Phone,
    MapPin,
    Ruler,
    DollarSign,
    FileText,
    Filter,
    Search,
    ChevronDown,
    Send,
    Users,
    ClipboardList
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { toast } from 'react-toastify'
import { fetchAllCustomDesignOrders, updateCustomDesignOrderStatus } from '@/api/apiClient'
import CustomDesignAssignModal from '@/components/orders/CustomDesignAssignModal'
import { getAuthUser } from '@/utils/apiClient'

export default function AdminCustomDesignOrdersPage() {
    const currentUser = getAuthUser()
    const isAdmin = currentUser?.role_id === 1 || currentUser?.role_id === 2
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isUpdating, setIsUpdating] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [pendingOrderId, setPendingOrderId] = useState(null)
    const [paymentForm, setPaymentForm] = useState({
        options: 'Momo: *182*8*1*123456# (TOP Design)\nBank: Equity Bank - 400123456789 (TOP Design)',
        steps: '1. Send the total amount to the account above.\n2. Use your Order ID as reference.\n3. Send the screenshot of payment to info@topdesign.rw or WhatsApp +250 788 000 000',
        link: ''
    })
    const [showAssignModal, setShowAssignModal] = useState(false)
    const [assigningOrderId, setAssigningOrderId] = useState(null)
    const [currentAssigneeId, setCurrentAssigneeId] = useState(null)

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        setLoading(true)
        try {
            const data = await fetchAllCustomDesignOrders()
            setOrders(data)
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error(error.message || 'An error occurred while loading orders')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id, newStatus) => {
        if (newStatus === 'payment_pending') {
            setPendingOrderId(id)
            setShowPaymentModal(true)
            return
        }

        await processStatusUpdate(id, newStatus)
    }

    const processStatusUpdate = async (id, newStatus, paymentData = null) => {
        setIsUpdating(true)
        try {
            // If paymentData is provided, we send it as a stringified JSON or formatted string
            // For now, let's send it as a formatted string to stay compatible with existing backend column
            let paymentString = null
            if (paymentData) {
                paymentString = `OPTIONS:\n${paymentData.options}\n\nSTEPS:\n${paymentData.steps}${paymentData.link ? `\n\nLINK: ${paymentData.link}` : ''}`
            }

            await updateCustomDesignOrderStatus(id, newStatus, paymentString)
            toast.success(`Order status updated to ${newStatus}`)
            loadOrders() // Refresh list
            if (selectedOrder && selectedOrder.id === id) {
                // Update selected order in modal too
                setSelectedOrder(prev => ({
                    ...prev,
                    status: newStatus,
                    payment_link: paymentString || prev.payment_link
                }))
            }
            setShowPaymentModal(false)
        } catch (error) {
            toast.error(error.message || 'Failed to update status')
        } finally {
            setIsUpdating(false)
        }
    }

    const getStatusConfig = (status) => {
        const configs = {
            pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
            approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
            payment_pending: { label: 'Payment Required', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CreditCard },
            paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
            in_production: { label: 'In Production', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package },
            completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
            cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
        }
        return configs[status] || configs.pending
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery)

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Custom Design Orders</h1>
                            <p className="text-slate-600 font-medium">Manage and process client design requests</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={loadOrders}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                                title="Refresh"
                            >
                                <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by customer, email, or order ID..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="payment_pending">Payment Required</option>
                                <option value="paid">Paid</option>
                                <option value="in_production">In Production</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Orders List */}
                    {loading && orders.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center">
                            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredOrders.map((order) => {
                                const statusConfig = getStatusConfig(order.status)
                                const StatusIcon = statusConfig.icon

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all group"
                                    >
                                        <div className="flex flex-col lg:flex-row">
                                            {/* Left side - Primary Info */}
                                            <div className="p-6 flex-1 border-b lg:border-b-0 lg:border-r border-slate-100">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-widest">#{order.id}</span>
                                                            <span className="text-xs font-bold text-slate-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-900 capitalize">{order.product_type}</h3>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${statusConfig.color} flex items-center gap-1.5`}>
                                                        <StatusIcon size={12} />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Customer</p>
                                                        <p className="font-bold text-slate-900 truncate">{order.customer_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dimensions</p>
                                                        <p className="font-bold text-slate-900 truncate">{order.width}m × {order.height}m</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Price</p>
                                                        <p className="font-black text-emerald-600">RF {Number(order.estimated_price).toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Assignment</p>
                                                        <div className="flex items-center gap-1.5">
                                                            {order.assigned_staff_name ? (
                                                                <>
                                                                    <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                                                                        {order.assigned_staff_name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-700">{order.assigned_staff_name}</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs font-bold text-slate-400 italic">Unassigned</span>
                                                            )}
                                                            {order.production_stage && (
                                                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold uppercase ml-1">
                                                                    {order.production_stage}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                                                            title="Quick View"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <a
                                                            href={`mailto:${order.customer_email}`}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                                                            title="Email Client"
                                                        >
                                                            <Mail size={18} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side - Actions (Admin Only) */}
                                            {isAdmin && (
                                                <div className="p-6 bg-slate-50/50 lg:w-72 flex flex-col justify-center gap-2">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Quick Status Update</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {order.status === 'pending' && (
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => handleStatusUpdate(order.id, 'approved')}
                                                                className="px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl text-[10px] font-black uppercase hover:bg-blue-50 transition-all"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {['approved', 'pending'].includes(order.status) && (
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => handleStatusUpdate(order.id, 'payment_pending')}
                                                                className="px-3 py-2 bg-white border border-purple-200 text-purple-700 rounded-xl text-[10px] font-black uppercase hover:bg-purple-50 transition-all"
                                                            >
                                                                Req Pay
                                                            </button>
                                                        )}
                                                        {order.status === 'payment_pending' && (
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => handleStatusUpdate(order.id, 'paid')}
                                                                className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-50 transition-all"
                                                            >
                                                                Confirm Paid
                                                            </button>
                                                        )}
                                                        {['paid', 'payment_pending', 'in_production'].includes(order.status) && (
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => {
                                                                    setAssigningOrderId(order.id);
                                                                    setCurrentAssigneeId(order.assigned_to);
                                                                    setShowAssignModal(true);
                                                                }}
                                                                className={`px-3 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-50 transition-all ${order.status === 'paid' ? 'col-span-2 bg-indigo-50' : ''}`}
                                                            >
                                                                {order.assigned_to ? 'Update Assignment' : 'Assign & Start'}
                                                            </button>
                                                        )}
                                                        {order.status === 'in_production' && (
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                                                                className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-50 transition-all"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                                                className="px-3 py-2 bg-white border border-red-200 text-red-700 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 transition-all col-span-2"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed View Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-[2.5rem] max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-slate-900 p-8 text-white z-10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black uppercase tracking-widest">Order ID #{selectedOrder.id}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-white/20`}>
                                            {selectedOrder.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black capitalize">{selectedOrder.product_type}</h2>
                                    <p className="text-slate-400 text-sm mt-1">Requested by <span className="text-white font-bold">{selectedOrder.customer_name}</span></p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8">
                            {/* Vital Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dimensions</p>
                                    <p className="text-lg font-black text-slate-900">{selectedOrder.width}m × {selectedOrder.height}m</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Area</p>
                                    <p className="text-lg font-black text-slate-900">{selectedOrder.total_area} m²</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Est. Price</p>
                                    <p className="text-lg font-black text-emerald-700">RF {Number(selectedOrder.estimated_price).toLocaleString()}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Order Date</p>
                                    <p className="text-lg font-black text-blue-700">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Customer Contact */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users size={16} className="text-indigo-600" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                                                <p className="font-bold text-slate-900">{selectedOrder.customer_email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</p>
                                                <p className="font-bold text-slate-900">{selectedOrder.customer_phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Location</p>
                                                <p className="font-bold text-slate-900">{selectedOrder.customer_location || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Design Specs */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <Palette size={16} className="text-indigo-600" />
                                    Production Technical Specs
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Color Palette</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg border border-slate-200" style={{ backgroundColor: selectedOrder.bg_color }}></div>
                                                <span className="text-xs font-mono font-bold">{selectedOrder.bg_color}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg border border-slate-200" style={{ backgroundColor: selectedOrder.text_color }}></div>
                                                <span className="text-xs font-mono font-bold">{selectedOrder.text_color}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Typography</p>
                                        <p className="text-sm font-bold text-slate-900">{selectedOrder.font_style} ({selectedOrder.font_size}px)</p>
                                    </div>
                                </div>

                                {selectedOrder.text_content && (
                                    <div className="p-6 bg-slate-900 rounded-2xl text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">Customer Text Content</p>
                                        <p className="text-2xl font-black text-white italic tracking-tight underline decoration-indigo-500 underline-offset-8">
                                            "{selectedOrder.text_content}"
                                        </p>
                                    </div>
                                )}

                                {selectedOrder.design_description && (
                                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                        <p className="text-[10px] text-purple-600 font-black uppercase mb-2 flex items-center gap-2">
                                            <Send size={12} />
                                            Production Description / Instructions
                                        </p>
                                        <p className="text-slate-700 leading-relaxed font-medium">
                                            {selectedOrder.design_description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Status Actions (Admin Only) */}
                            {isAdmin && (
                                <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'approved')}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === 'pending' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}
                                    >
                                        Approve Request
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'payment_pending')}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${['pending', 'approved'].includes(selectedOrder.status) ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}
                                    >
                                        Request Payment
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'paid')}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === 'payment_pending' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}
                                    >
                                        Confirm Payment
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'in_production')}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === 'paid' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}
                                    >
                                        Send to Production
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${selectedOrder.status === 'in_production' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}
                                    >
                                        Mark Completed
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Payment Details Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-purple-600 p-6 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <CreditCard size={32} />
                            </div>
                            <h2 className="text-2xl font-black">Payment Instructions</h2>
                            <p className="text-purple-100 text-sm">Send steps and options to the customer</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Payment Options (Momo, Bank, etc.)</label>
                                <textarea
                                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                                    value={paymentForm.options}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, options: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Steps to Complete Payment</label>
                                <textarea
                                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                                    value={paymentForm.steps}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, steps: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Direct Payment Link (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium"
                                    placeholder="https://pay.topdesign.rw/..."
                                    value={paymentForm.link}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, link: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => processStatusUpdate(pendingOrderId, 'payment_pending', paymentForm)}
                                    disabled={isUpdating}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    Send to Client
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignModal && (
                <CustomDesignAssignModal
                    orderId={assigningOrderId}
                    currentAssigneeId={currentAssigneeId}
                    onClose={() => setShowAssignModal(false)}
                    onAssigned={loadOrders}
                />
            )}
        </DashboardLayout>
    )
}
