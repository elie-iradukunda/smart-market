// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// WARNING: This import is causing a compilation error in this isolated environment
// because it cannot resolve the path '../../api/apiClient'.
// It is left here as requested.
import { fetchQuotes, createQuote, approveQuote, fetchCustomers } from '../../api/apiClient'

import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ReceptionTopNav from '@/components/layout/ReceptionTopNav'
import SalesTopNav from '@/components/layout/SalesTopNav'
import { getAuthUser } from '@/utils/apiClient'

// Import necessary icons
import { Search, Loader2, DollarSign, Users, CheckCircle, Clock, XCircle, FileText } from 'lucide-react'

// =========================================================================
// API Fallback/Check
// We declare a safe function to prevent runtime errors if fetchQuotes is undefined
// due to the failed import resolution in this environment.
// When fetchQuotes is available (in your project), this safe check is ignored.
// =========================================================================
const safeFetchQuotes = typeof fetchQuotes === 'function' 
    ? fetchQuotes 
    : () => {
        console.warn("Using placeholder function: fetchQuotes is not defined.");
        // Return an empty array promise if the function is missing, to prevent crashes
        return new Promise(resolve => resolve([]));
    };


export default function QuotesPage() {
    const [quotes, setQuotes] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedQuote, setSelectedQuote] = useState<any | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [customers, setCustomers] = useState<any[]>([])
    const [saving, setSaving] = useState(false)
    const [approving, setApproving] = useState(false)
    const [newQuote, setNewQuote] = useState({
      customerId: '',
      description: '',
      unitPrice: '',
      quantity: '',
    })

    // Helper to get status tag styling
    const getStatusTag = (status) => {
        const s = status ? status.toLowerCase() : '';
        switch (s) {
            case 'accepted':
            case 'approved':
                return (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 border border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> Accepted
                    </span>
                );
            case 'pending':
            case 'sent':
                return (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3 mr-1" /> Pending
                    </span>
                );
            case 'rejected':
            case 'cancelled':
                return (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 border border-red-200">
                        <XCircle className="h-3 w-3 mr-1" /> Rejected
                    </span>
                );
            case 'draft':
            default:
                return (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
                        <FileText className="h-3 w-3 mr-1" /> Draft
                    </span>
                );
        }
    };


    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setError(null)
        setSuccess(null)

        // Load quotes
        safeFetchQuotes()
            .then((data) => {
                if (!isMounted) return
                const formattedData = Array.isArray(data) ? data.map(q => ({
                    ...q,
                    value: q.total_amount || q.total,
                    customerName: q.customer_name
                })) : []
                setQuotes(formattedData)
            })
            .catch((err) => {
                if (!isMounted) return
                const errorMessage = typeof err === 'object' && err !== null && err.message ? err.message : 'Failed to load quotes. Check API connectivity.';
                setError(errorMessage)
            })
            .finally(() => {
                if (!isMounted) return
                setLoading(false)
            })

        // Load customers for new quote form
        fetchCustomers()
          .then((data) => {
            if (!isMounted) return
            setCustomers(Array.isArray(data) ? data : [])
          })
          .catch(() => {
            // ignore customer load error in this view
          })

        return () => {
            isMounted = false
        }
    }, [])

    const refreshQuotes = async () => {
      setLoading(true)
      try {
        const data = await safeFetchQuotes()
        const formattedData = Array.isArray(data) ? data.map(q => ({
          ...q,
          value: q.total_amount || q.total,
          customerName: q.customer_name
        })) : []
        setQuotes(formattedData)
        if (selectedQuote) {
          const updated = formattedData.find((q) => q.id === selectedQuote.id)
          setSelectedQuote(updated || null)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to refresh quotes')
        setSuccess(null)
      } finally {
        setLoading(false)
      }
    }

    const handleCreateQuote = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!newQuote.customerId) return
      setSaving(true)
      setError(null)
      setSuccess(null)
      try {
        const payload = {
          customer_id: Number(newQuote.customerId),
          items: [
            {
              description: newQuote.description || 'Quoted items',
              unit_price: Number(newQuote.unitPrice || 0),
              quantity: Number(newQuote.quantity || 1),
            },
          ],
        }
        await createQuote(payload)
        setNewQuote({ customerId: '', description: '', unitPrice: '', quantity: '' })
        await refreshQuotes()
      } catch (err: any) {
        setError(err.message || 'Failed to create quote')
      } finally {
        setSaving(false)
      }
    }

    const handleApproveQuote = async () => {
      if (!selectedQuote) return
      setApproving(true)
      setError(null)
      setSuccess(null)
      try {
        await approveQuote(selectedQuote.id)
        await refreshQuotes()
        setSuccess('Quote approved and order created successfully.')
      } catch (err: any) {
        setError(err.message || 'Failed to approve quote')
      } finally {
        setApproving(false)
      }
    }

    const filteredQuotes = quotes.filter((q) => {
        const term = (search || '').toLowerCase()
        if (!term) return true
        
        // Search across ID and Customer Name
        return (
            String(q.id).toLowerCase().includes(term) ||
            (q.customerName || '').toLowerCase().includes(term)
        )
    })

    const user = getAuthUser()
    const isReception = user?.role_id === 5

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {isReception ? <ReceptionTopNav /> : <OwnerTopNav />}
            <SalesTopNav />
            <div className="max-w-6xl mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-10">

                {/* Header Card */}
                <div className="rounded-3xl bg-gradient-to-r from-[#043b84] via-[#0555b0] to-[#0fb3ff] p-7 sm:p-8 shadow-2xl border border-blue-500/40">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-cyan-200" /> CRM Module
                    </p>
                    <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                        Customer Quotes
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-blue-100/90 max-w-2xl">
                        Manage, search, and track the financial proposals sent to clients for products and services.
                    </p>
                </div>

                {/* Main Table + Detail Grid */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xl">

                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <p className="text-lg sm:text-xl font-semibold text-slate-900 flex items-center">
                                 <Users className="h-5 w-5 mr-2 text-indigo-500" /> All Quotes ({filteredQuotes.length})
                            </p>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by quote ID or customer"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-full border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
                                />
                            </div>
                        </div>

                        {/* Simple New Quote form for accountants */}
                        <form onSubmit={handleCreateQuote} className="flex flex-wrap gap-2 items-center rounded-2xl bg-indigo-50/70 border border-indigo-200 px-3 py-3 text-xs sm:text-sm">
                          <span className="font-semibold text-indigo-900 mr-1">New quote:</span>
                          <select
                            value={newQuote.customerId}
                            onChange={(e) => setNewQuote({ ...newQuote, customerId: e.target.value })}
                            className="min-w-[150px] rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            required
                          >
                            <option value="">Select customer</option>
                            {customers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Description"
                            value={newQuote.description}
                            onChange={(e) => setNewQuote({ ...newQuote, description: e.target.value })}
                            className="min-w-[150px] flex-1 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[11px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Unit price"
                            value={newQuote.unitPrice}
                            onChange={(e) => setNewQuote({ ...newQuote, unitPrice: e.target.value })}
                            className="w-24 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[11px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            required
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={newQuote.quantity}
                            onChange={(e) => setNewQuote({ ...newQuote, quantity: e.target.value })}
                            className="w-20 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[11px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            required
                          />
                          <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {saving ? 'Saving…' : 'Create Quote'}
                          </button>
                        </form>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200 flex items-center">
                            <XCircle className="h-5 w-5 mr-2" />
                            <p className="font-medium">API Error:</p>
                            <p className="ml-1">{error}</p>
                        </div>
                    )}

                    {/* Success Message after approve */}
                    {success && !error && (
                      <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs sm:text-sm text-emerald-800 border border-emerald-200">
                        <span>{success}</span>
                        <Link
                          to="/orders"
                          className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-500"
                        >
                          View Orders
                        </Link>
                      </div>
                    )}
                    {/* Loading State */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mr-2" />
                            <p className="text-sm sm:text-base text-slate-500">Loading quotes data from API...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-start">
                          {/* Quotes table */}
                          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-indigo-50/90 border-b border-indigo-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 uppercase tracking-wider text-xs">Quote ID</th>
                                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 uppercase tracking-wider text-xs">Customer</th>
                                        <th className="px-4 py-3 text-right font-semibold text-indigo-700 uppercase tracking-wider text-xs">Value</th>
                                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 uppercase tracking-wider text-xs">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-indigo-700 uppercase tracking-wider text-xs hidden sm:table-cell">Rep</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {filteredQuotes.map((q) => (
                                        <tr
                                          key={q.id}
                                          className="hover:bg-blue-50/60 transition duration-150 cursor-pointer"
                                          onClick={() => setSelectedQuote(q)}
                                        >
                                            <td className="px-4 py-3 font-medium text-slate-900">{q.id}</td>
                                            <td className="px-4 py-3 text-slate-800">{q.customerName}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-indigo-700">${q.value ? q.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                {getStatusTag(q.status)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{q.rep || 'Unassigned'}</td>
                                        </tr>
                                    ))}
                                    {filteredQuotes.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                                                {search ? `No quotes found matching "${search}".` : "No quotes available. Check your API endpoint."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                          </div>

                          {/* Side detail panel */}
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 shadow-inner min-h-[220px]">
                            {!selectedQuote ? (
                              <div className="h-full flex flex-col items-center justify-center text-center text-sm text-slate-500">
                                <p className="font-semibold text-slate-600 mb-1">Select a quote to preview</p>
                                <p className="text-xs max-w-xs">
                                  Click any row on the left to see key details, status and owner information here.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">

                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Quote preview</p>
                                <h2 className="text-lg font-bold text-slate-900">Quote {selectedQuote.id}</h2>
                                <p className="text-sm text-slate-600">
                                  {selectedQuote.customerName || 'Unknown customer'}
                                </p>

                                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mt-2">

                                  <div className="rounded-lg bg-white px-3 py-2 border border-slate-200">
                                    <p className="text-slate-500">Value</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                      {selectedQuote.value
                                        ? `$${selectedQuote.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-white px-3 py-2 border border-slate-200">
                                    <p className="text-slate-500">Status</p>
                                    <div className="mt-1">
                                      {getStatusTag(selectedQuote.status)}
                                    </div>
                                  </div>
                                  <div className="rounded-lg bg-white px-3 py-2 border border-slate-200">
                                    <p className="text-slate-500">Owner / Rep</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{selectedQuote.rep || 'Unassigned'}</p>
                                  </div>
                                  <div className="rounded-lg bg-white px-3 py-2 border border-slate-200">
                                    <p className="text-slate-500">Quote ID</p>
                                    <p className="mt-1 text-sm font-mono text-slate-900">{selectedQuote.id}</p>
                                  </div>
                                </div>

                                {/* Approve quote → create order */}
                                {selectedQuote.status !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={handleApproveQuote}
                                    disabled={approving}
                                    className="mt-3 inline-flex items-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    {approving ? 'Approving…' : 'Approve quote → Create order'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}