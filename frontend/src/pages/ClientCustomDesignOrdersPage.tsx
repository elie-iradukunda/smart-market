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
    FileText
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-toastify'
import { fetchUserCustomDesignOrders } from '@/api/apiClient'

export default function ClientCustomDesignOrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)

    useEffect(() => {
        loadOrders()
    }, [user])

    const loadOrders = async () => {
        if (!user?.email) {
            setLoading(false)
            return
        }

        try {
            const data = await fetchUserCustomDesignOrders(user.email)
            setOrders(data)
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error(error.message || 'An error occurred while loading orders')
        } finally {
            setLoading(false)
        }
    }

    const getStatusConfig = (status) => {
        const configs = {
            pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
            approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
            payment_pending: { label: 'Payment Required', color: 'bg-purple-100 text-purple-700', icon: CreditCard },
            paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
            in_production: { label: 'In Production', color: 'bg-indigo-100 text-indigo-700', icon: Package },
            completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
            cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
        }
        return configs[status] || configs.pending
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/client" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 mb-4">
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Palette className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">My Custom Design Orders</h1>
                                <p className="text-slate-600 font-medium">Track your custom design requests and orders</p>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 text-center">
                            <Palette className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Custom Design Orders Yet</h3>
                            <p className="text-slate-600 mb-6">Start by creating your first custom design order</p>
                            <Link
                                to="/custom-design"
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                            >
                                <Palette size={18} />
                                Create Custom Design
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {orders.map((order) => {
                                const statusConfig = getStatusConfig(order.status)
                                const StatusIcon = statusConfig.icon

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
                                    >
                                        {/* Order Header */}
                                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Order #{order.id}</p>
                                                    <h3 className="text-xl font-black capitalize">{order.product_type}</h3>
                                                </div>
                                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${statusConfig.color} flex items-center gap-2`}>
                                                    <StatusIcon size={14} />
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-indigo-100">
                                                Ordered on {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        {/* Order Details */}
                                        <div className="p-6 space-y-4">
                                            {/* Dimensions */}
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                                    <Ruler className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase">Dimensions</p>
                                                    <p className="font-black text-slate-900">{order.width}m × {order.height}m ({order.total_area} m²)</p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase">Estimated Price</p>
                                                    <p className="font-black text-slate-900">RWF {Number(order.estimated_price).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            {/* Text Content Preview */}
                                            {order.text_content && (
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                    <p className="text-xs text-slate-500 font-bold uppercase mb-2">Design Text</p>
                                                    <p className="font-bold text-slate-900 italic truncate">{order.text_content}</p>
                                                </div>
                                            )}

                                            {/* Payment Link */}
                                            {order.status === 'payment_pending' && order.payment_link && (
                                                <a
                                                    href={order.payment_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all"
                                                >
                                                    <CreditCard className="inline-block w-5 h-5 mr-2" />
                                                    Pay Now
                                                </a>
                                            )}

                                            {/* View Details Button */}
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Eye size={18} />
                                                View Full Details
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-[2.5rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Order Details</p>
                                    <h2 className="text-3xl font-black">Order #{selectedOrder.id}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-6">
                            {/* Status */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Status</p>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase ${getStatusConfig(selectedOrder.status).color}`}>
                                    {React.createElement(getStatusConfig(selectedOrder.status).icon, { size: 16 })}
                                    {getStatusConfig(selectedOrder.status).label}
                                </span>
                            </div>

                            {/* Product Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Product Type</p>
                                    <p className="font-black text-slate-900 capitalize">{selectedOrder.product_type}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Dimensions</p>
                                    <p className="font-black text-slate-900">{selectedOrder.width}m × {selectedOrder.height}m</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Area</p>
                                    <p className="font-black text-slate-900">{selectedOrder.total_area} m²</p>
                                </div>
                                <div className="bg-emerald-50 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Estimated Price</p>
                                    <p className="font-black text-emerald-900">RWF {Number(selectedOrder.estimated_price).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Design Specifications */}
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-4">Design Specifications</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Background Color</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg border-2 border-slate-200" style={{ backgroundColor: selectedOrder.bg_color }}></div>
                                            <span className="font-mono font-bold text-slate-900">{selectedOrder.bg_color}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Text Color</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg border-2 border-slate-200" style={{ backgroundColor: selectedOrder.text_color }}></div>
                                            <span className="font-mono font-bold text-slate-900">{selectedOrder.text_color}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Font Style</p>
                                        <p className="font-bold text-slate-900">{selectedOrder.font_style}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Font Size</p>
                                        <p className="font-bold text-slate-900">{selectedOrder.font_size}px</p>
                                    </div>
                                </div>
                            </div>

                            {/* Text Content */}
                            {selectedOrder.text_content && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Design Text</p>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                        <p className="font-bold text-slate-900 italic">{selectedOrder.text_content}</p>
                                    </div>
                                </div>
                            )}

                            {/* Design Description */}
                            {selectedOrder.design_description && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Design Description</p>
                                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                                        <p className="text-slate-700 leading-relaxed">{selectedOrder.design_description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Usage Description */}
                            {selectedOrder.usage_description && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Usage Context</p>
                                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                                        <p className="text-slate-700">{selectedOrder.usage_description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Customer Info */}
                            <div>
                                <h3 className="text-lg font-black text-slate-900 mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-700">{selectedOrder.customer_email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-700">{selectedOrder.customer_phone}</span>
                                    </div>
                                    {selectedOrder.customer_location && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-slate-400" />
                                            <span className="text-slate-700">{selectedOrder.customer_location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Order Timeline</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-700">
                                        <span className="font-bold">Created:</span> {new Date(selectedOrder.created_at).toLocaleString()}
                                    </p>
                                    {selectedOrder.updated_at && selectedOrder.updated_at !== selectedOrder.created_at && (
                                        <p className="text-sm text-slate-700">
                                            <span className="font-bold">Last Updated:</span> {new Date(selectedOrder.updated_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Link */}
                            {selectedOrder.status === 'payment_pending' && selectedOrder.payment_link && (
                                <a
                                    href={selectedOrder.payment_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-4 rounded-2xl font-black text-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                                >
                                    <CreditCard className="inline-block w-6 h-6 mr-2" />
                                    Proceed to Payment
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
