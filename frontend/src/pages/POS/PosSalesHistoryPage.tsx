// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { DollarSign, User, Calendar, Clock, Download, AlertTriangle, Loader, Package, CreditCard, PiggyBank, Receipt, X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchPOSSales } from '../../api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/utils/formatters'

const getPaymentColor = (method) => {
    switch (method) {
        case 'Cash':
            return 'bg-green-100 text-green-800 border-green-300';
        case 'Mobile Money':
            return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'Bank Card':
            return 'bg-purple-100 text-purple-800 border-purple-300';
        case 'Bank Transfer':
            return 'bg-blue-100 text-blue-800 border-blue-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

const StateFeedback = ({ error, loading, salesLength }) => {
    if (error) {
        return (
            <div role="alert" className="p-8 text-red-700 bg-red-50 border border-red-300 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 mr-3" aria-hidden="true" />
                <p className="text-base font-medium">Error loading data: {error}</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div role="status" className="p-8 flex items-center justify-center">
                <Loader className="h-6 w-6 mr-3 text-indigo-500 animate-spin" aria-hidden="true" />
                <p className="text-base text-gray-500">Loading POS sales history...</p>
            </div>
        )
    }

    if (salesLength === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Package className="h-10 w-10 mb-4 text-gray-400" aria-hidden="true" />
                <p className="text-lg font-semibold">No sales transactions found.</p>
                <p className="text-sm mt-1">Check your date filters or confirm recent POS activity.</p>
            </div>
        )
    }

    return null
}

export default function PosSalesHistoryPage() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState({
        paymentMethod: 'All',
        date: new Date().toISOString().slice(0, 10),
    });
    const [selectedSale, setSelectedSale] = useState<any | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setError(null)

        fetchPOSSales()
            .then((data) => {
                if (!isMounted) return
                const mapped = (data || []).map((s) => {
                    const dt = new Date(s.created_at)
                    return {
                        id: `POS-${s.id}`,
                        rawId: s.id,
                        customer: s.customer_name || 'Walk-in',
                        cashier: s.cashier_name || 'Unknown',
                        total: Number(s.total) || 0,
                        paymentMethod: s.payment_method || 'Cash',
                        date: dt.toISOString().slice(0, 10),
                        time: dt.toTimeString().slice(0, 5),
                        items: s.items || [],
                        created_at: s.created_at
                    }
                })
                setSales(mapped)
                setCurrentPage(1) // Reset to first page when data loads
            })
            .catch((err) => {
                if (!isMounted) return
                setError(err.message || 'Failed to load POS sales history')
            })
            .finally(() => {
                if (!isMounted) return
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

    const handleFilterChange = (e) => {
        setFilter(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setCurrentPage(1) // Reset to first page when filter changes
    }

    const filteredSales = sales.filter(sale => {
        if (filter.paymentMethod !== 'All' && sale.paymentMethod !== filter.paymentMethod) {
            return false;
        }
        if (filter.date && sale.date !== filter.date) {
            return false;
        }
        return true;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedSales = filteredSales.slice(startIndex, endIndex)

    const totalForDay = filteredSales.reduce((sum, sale) => sum + (typeof sale.total === 'number' ? sale.total : 0), 0)
    const transactionCount = filteredSales.length
    const averageTicket = transactionCount ? totalForDay / transactionCount : 0

    const handleExport = () => {
        if (!filteredSales.length) return
        const header = ['ID', 'Customer', 'Cashier', 'Payment Method', 'Total', 'Date', 'Time', 'Items Count']
        const rows = filteredSales.map((s) => [
            s.id,
            s.customer,
            s.cashier,
            s.paymentMethod,
            s.total,
            s.date,
            s.time,
            s.items.length
        ])
        const csvContent = [header, ...rows]
            .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const dateLabel = filter.date || 'all'
        link.download = `pos-sales-${dateLabel}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">
                    <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">
                        <PiggyBank className="inline h-4 w-4 mr-2" aria-hidden="true" />
                        Retail Operations
                    </p>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
                        Daily Sales <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Transactions</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-600 max-w-xl">
                        Review and reconcile recent counter transactions. Data is presented chronologically for daily closing reports.
                    </p>
                    <button
                        className="mt-4 inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-purple-700 transition"
                        onClick={handleExport}
                        aria-label="Export full sales report"
                    >
                        <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                        Export Full Report
                    </button>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <p className="text-xl font-semibold text-gray-900">Recent Transactions ({filteredSales.length})</p>
                                <p className="text-sm text-gray-600 mt-1">Total for {filter.date}: <span className="font-semibold text-gray-900">{formatCurrency(totalForDay)}</span></p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <select
                                    name="paymentMethod"
                                    value={filter.paymentMethod}
                                    onChange={handleFilterChange}
                                    aria-label="Filter by payment method"
                                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition shadow-sm"
                                >
                                    <option value="All">All Payment Methods</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Mobile Money">Mobile Money</option>
                                    <option value="Bank Card">Bank Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                                <input
                                    name="date"
                                    type="date"
                                    value={filter.date}
                                    onChange={handleFilterChange}
                                    aria-label="Filter by date"
                                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* KPI strip */}
                    <div className="px-6 pb-4 grid gap-3 sm:grid-cols-3 text-sm">
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Transactions</p>
                            <p className="mt-1 text-xl font-bold text-gray-900">{transactionCount}</p>
                        </div>
                        <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Total sales</p>
                            <p className="mt-1 text-xl font-bold text-green-800">{formatCurrency(totalForDay)}</p>
                        </div>
                        <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Average ticket</p>
                            <p className="mt-1 text-xl font-bold text-purple-800">{formatCurrency(averageTicket)}</p>
                        </div>
                    </div>

                    {error || loading || filteredSales.length === 0 ? (
                        <StateFeedback error={error} loading={loading} salesLength={filteredSales.length} />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm" role="table">
                                    <thead className="bg-purple-50 border-b border-purple-200">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-purple-700 uppercase tracking-wider" scope="col">ID</th>
                                            <th className="px-6 py-3 font-semibold text-purple-700 uppercase tracking-wider" scope="col"><User className="inline h-4 w-4 mr-1" aria-hidden="true" /> Customer</th>
                                            <th className="px-6 py-3 font-semibold text-purple-700 uppercase tracking-wider" scope="col">Cashier</th>
                                            <th className="px-6 py-3 font-semibold text-purple-700 uppercase tracking-wider" scope="col"><ShoppingCart className="inline h-4 w-4 mr-1" aria-hidden="true" /> Items</th>
                                            <th className="px-6 py-3 font-semibold text-purple-700 uppercase tracking-wider" scope="col"><CreditCard className="inline h-4 w-4 mr-1" aria-hidden="true" /> Method</th>
                                            <th className="px-6 py-3 text-right font-semibold text-purple-700 uppercase tracking-wider" scope="col">Total</th>
                                            <th className="px-6 py-3 font-semibold text-purple-700 uppercase tracking-wider" scope="col"><Calendar className="inline h-4 w-4 mr-1" aria-hidden="true" /> Date & Time</th>
                                            <th className="px-6 py-3 font-semibold text-purple-700 uppercase tracking-wider text-right" scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedSales.map(sale => (
                                            <tr key={sale.id} className="hover:bg-purple-50/50 transition cursor-pointer">
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{sale.id}</td>
                                                <td className="px-6 py-4 text-gray-800 font-medium">{sale.customer}</td>
                                                <td className="px-6 py-4 text-gray-700">{sale.cashier}</td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Package className="h-3 w-3" />
                                                        {sale.items.length} items
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ring-1 ring-inset ${getPaymentColor(sale.paymentMethod)}`}>
                                                        {sale.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-900 font-bold font-mono text-base">{formatCurrency(sale.total)}</td>
                                                <td className="px-6 py-4 text-gray-600 font-medium">
                                                    {sale.date} <span className="text-xs text-gray-400">({sale.time})</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800 transition"
                                                        aria-label={`View receipt for transaction ID ${sale.id}`}
                                                        onClick={() => setSelectedSale(sale)}
                                                    >
                                                        <Receipt className="h-4 w-4" />
                                                        View Receipt
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {startIndex + 1} to {Math.min(endIndex, filteredSales.length)} of {filteredSales.length} transactions
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(totalPages)].map((_, i) => {
                                                const page = i + 1
                                                // Show first page, last page, current page, and pages around current
                                                if (
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => goToPage(page)}
                                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === page
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    )
                                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                    return <span key={page} className="px-2 text-gray-400">...</span>
                                                }
                                                return null
                                            })}
                                        </div>

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Enhanced Receipt modal */}
            {selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Receipt className="h-6 w-6" />
                                    <h2 className="text-xl font-bold">Sales Receipt</h2>
                                </div>
                                <button
                                    className="p-1 hover:bg-white/20 rounded-lg transition"
                                    onClick={() => setSelectedSale(null)}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-purple-100 mt-1">Transaction: {selectedSale.id}</p>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-6 space-y-6">
                            {/* Transaction Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Customer</p>
                                    <p className="text-gray-900 font-medium mt-1">{selectedSale.customer}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Cashier</p>
                                    <p className="text-gray-900 font-medium mt-1">{selectedSale.cashier}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Date & Time</p>
                                    <p className="text-gray-900 font-medium mt-1">{selectedSale.date} {selectedSale.time}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-semibold">Payment Method</p>
                                    <p className="text-gray-900 font-medium mt-1">{selectedSale.paymentMethod}</p>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3 flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Items Purchased
                                </h3>
                                {selectedSale.items && selectedSale.items.length > 0 ? (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Product</th>
                                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Qty</th>
                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Price</th>
                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedSale.items.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-gray-900">{item.product_name || `Item #${item.item_id}`}</td>
                                                        <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right text-gray-700 font-mono">{formatCurrency(item.price)}</td>
                                                        <td className="px-4 py-3 text-right text-gray-900 font-semibold font-mono">{formatCurrency(item.price * item.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No items recorded for this transaction.</p>
                                )}
                            </div>

                            {/* Total */}
                            <div className="border-t-2 border-gray-200 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-purple-600 font-mono">{formatCurrency(selectedSale.total)}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
                                <p>Thank you for your business!</p>
                                <p className="mt-1">Smart Market POS System</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}