// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { DollarSign, User, Calendar, Clock, Download, AlertTriangle, Loader, Package, CreditCard, PiggyBank } from 'lucide-react'
import { fetchPOSSales } from '../../api/apiClient'
import PosTopNav from '@/components/layout/PosTopNav'

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

const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


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
                        customer: s.customer_name || 'Walk-in',
                        total: Number(s.total) || 0,
                        paymentMethod: s.payment_method || 'Cash', 
                        date: dt.toISOString().slice(0, 10),
                        time: dt.toTimeString().slice(0, 5),
                    }
                })
                setSales(mapped)
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


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-blue-100/50 font-sans">
            <PosTopNav />
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">

                <div className="rounded-3xl border border-blue-100 bg-white/95 backdrop-blur-xl p-8 shadow-2xl shadow-blue-200/50">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-700">
                        <PiggyBank className="inline h-4 w-4 mr-2" aria-hidden="true" />
                        Retail Operations
                    </p>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
                        Daily Sales <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">Transactions</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-600 max-w-xl">
                        Review and reconcile recent counter transactions. Data is presented chronologically for daily closing reports.
                    </p>
                    <button 
                        className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition duration-300"
                        aria-label="Export full sales report"
                    >
                        <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                        Export Full Report
                    </button>
                </div>

                <div className="mt-8 rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <p className="text-xl font-semibold text-gray-900">Recent Transactions ({filteredSales.length})</p>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                <select 
                                    name="paymentMethod" 
                                    value={filter.paymentMethod}
                                    onChange={handleFilterChange}
                                    aria-label="Filter by payment method"
                                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150 shadow-sm"
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
                                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 
                                              focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-150 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {error || loading || filteredSales.length === 0 ? (
                         <StateFeedback error={error} loading={loading} salesLength={filteredSales.length} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm" role="table">
                                <thead className="bg-blue-50/80 border-b border-blue-200">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col">ID</th>
                                        <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col"><User className="inline h-4 w-4 mr-1" aria-hidden="true" /> Customer</th>
                                        <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col"><CreditCard className="inline h-4 w-4 mr-1" aria-hidden="true" /> Method</th>
                                        <th className="px-6 py-3 text-right font-semibold text-blue-700 uppercase tracking-wider" scope="col">Total</th>
                                        <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider" scope="col"><Calendar className="inline h-4 w-4 mr-1" aria-hidden="true" /> Date & Time</th>
                                        <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider text-right" scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredSales.map(sale => (
                                        <tr key={sale.id} className="hover:bg-blue-50/50 transition duration-150 cursor-pointer">
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{sale.id}</td>
                                            <td className="px-6 py-4 text-gray-800 font-medium">{sale.customer}</td>
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
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition duration-150"
                                                    aria-label={`View receipt for transaction ID ${sale.id}`}
                                                >
                                                    View Receipt
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}