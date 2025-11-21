// @ts-nocheck
import React, { useEffect, useState } from 'react'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import PosTopNav from '@/components/layout/PosTopNav'
import { getAuthUser } from '@/utils/apiClient'

// Reverting to the original import path, which may cause a compilation error
import { fetchJournalEntries } from '../../api/apiClient' 
import {
  FileText,
  Search,
  BookOpen,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
} from 'lucide-react'

// --- Utility Components ---

// Helper to format currency
const formatCurrency = (amount, isDebit) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A'
    const colorClass = isDebit ? 'text-green-700' : 'text-red-700';
    return (
        <span className={`font-mono font-bold ${colorClass}`}>
            {`$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>
    );
}

// Helper to style the Journal Status pill
const getJournalStatusClasses = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800 ring-gray-500/20'
  
  switch (status.toLowerCase()) {
    case 'posted':
      return 'bg-green-100 text-green-800 ring-green-500/20 font-bold'
    case 'draft':
      return 'bg-amber-100 text-amber-800 ring-amber-500/20'
    case 'error':
      return 'bg-red-100 text-red-800 ring-red-500/20 font-bold' 
    default:
      return 'bg-gray-100 text-gray-800 ring-gray-500/20'
  }
}

// Component to render the status pill with an icon
const JournalStatusPill = ({ status }) => {
  const statusText = status || 'Draft'
  const Icon = ({ className }) => {
    switch (statusText.toLowerCase()) {
      case 'posted':
        return <CheckCircle className={className} />;
      case 'draft':
        return <AlertTriangle className={className} />;
      case 'error':
        return <XCircle className={className} />;
      default:
        return <FileText className={className} />;
    }
  }

  return (
    <span 
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getJournalStatusClasses(statusText)}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {statusText}
    </span>
  )
}

// State Feedback Component for UX
const StateFeedback = ({ error, loading, filteredLength }) => {
    if (error) {
      return (
        <div className="p-8 text-red-700 bg-red-50 border border-red-300 rounded-b-3xl flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 mr-3" />
          <p className="text-base font-medium">Error loading data: {error}</p>
        </div>
      )
    }
    
    if (loading) {
      return (
        <div className="p-8 flex items-center justify-center">
          <Loader className="h-6 w-6 mr-3 text-indigo-500 animate-spin" />
          <p className="text-base text-gray-500">Loading journal entries...</p>
        </div>
      )
    }

    if (filteredLength === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <BookOpen className="h-10 w-10 mb-4 text-gray-400" />
                <p className="text-lg font-semibold">No matching entries found.</p>
                <p className="text-sm mt-1">Try searching by entry ID, description, or account.</p>
            </div>
        )
    }

    return null
}


// --- JournalEntriesPage Component ---

export default function JournalEntriesPage() {
  const [journals, setJournals] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  // Fetching data from the external API client
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    // Using the original external dependency
    fetchJournalEntries()
      .then((data) => {
        if (!isMounted) return
        setJournals(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        // This catch block will likely run due to the unresolved import
        setError(err.message || 'Failed to load journal entries. (Dependency missing)')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Filtered list based on state
  const filtered = journals.filter((j) => {
    const term = (search || '').toLowerCase()
    if (!term) return true
    return (
      String(j.id).toLowerCase().includes(term) ||
      (j.description || '').toLowerCase().includes(term) ||
      (j.account_name || '').toLowerCase().includes(term) // Assuming entries have an account_name field
    )
  })

  const user = getAuthUser()
  const isPosRole = user?.role_id === 5 || user?.role_id === 11

  return (
    <div className="min-h-screen bg-slate-50">
      {isPosRole ? <PosTopNav /> : <OwnerTopNav />}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section - Light card with blue gradient top */}
        <div className="rounded-3xl shadow-2xl overflow-hidden bg-white border border-slate-200">
            <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-500 text-white p-6 transition duration-500">
                <p className="text-sm font-bold uppercase tracking-widest text-indigo-200">
                    <BookOpen className="inline h-4 w-4 mr-2" />
                    General Ledger
                </p>
                <h1 className="mt-1 text-4xl font-extrabold leading-tight">
                    Journal Entries
                </h1>
                <p className="mt-2 text-base text-indigo-300 max-w-xl">
                    Detailed records of all financial transactions, including debits, credits, and account classifications. This view is for internal auditing.
                </p>
            </div>
          
            {/* Summary Metrics */}
            <div className="bg-white p-6 pt-3">
                <p className="text-lg font-semibold text-gray-800 mb-4">Summary Totals</p>
                <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    {/* Placeholder Card 1: Total Entries */}
                    <div className="rounded-xl px-4 py-3 border shadow-md bg-gray-50 border-gray-200">
                        <p className="text-sm font-medium text-gray-700">Total Entries</p>
                        <p className="mt-1 text-2xl font-extrabold text-gray-900">{journals.length}</p>
                        <p className="text-xs text-gray-500 mt-1">All debit/credit lines.</p>
                    </div>
                    {/* Placeholder Card 2: Last Posted Date */}
                    <div className="rounded-xl px-4 py-3 border shadow-md bg-blue-50 border-blue-200">
                        <p className="text-sm font-medium text-gray-700">Last Post Date</p>
                        <p className="mt-1 text-2xl font-extrabold text-blue-700">N/A</p>
                        <p className="text-xs text-gray-500 mt-1">Date of latest entry.</p>
                    </div>
                    {/* Placeholder Card 3: Draft Entries */}
                    <div className="rounded-xl px-4 py-3 border shadow-md bg-amber-50 border-amber-200">
                        <p className="text-sm font-medium text-gray-700">Draft Entries</p>
                        <p className="mt-1 text-2xl font-extrabold text-amber-700">N/A</p>
                        <p className="text-xs text-gray-500 mt-1">Pending review.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Journal Entries List and Filters */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <p className="text-xl font-semibold text-gray-900">Entry List ({filtered.length})</p>
              
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entry ID, description, or account..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition duration-200"
                />
              </div>
            </div>
          </div>
          
          {/* Table Container */}
          {loading || error || filtered.length === 0 ? (
            <StateFeedback error={error} loading={loading} filteredLength={filtered.length} />
          ) : (
            <div className="flow-root">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50/70 border-b border-indigo-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Entry ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Credit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white divide-y divide-gray-100">
                    {/* NOTE: Data fields used (id, date, description, account_name, debit, credit, status) 
                        must be provided by the external fetchJournalEntries API. */}
                    {filtered.map((j) => (
                      <tr
                        key={j.id}
                        className="group hover:bg-gray-50/50 transition duration-300 ease-in-out cursor-pointer"
                      >
                        {/* Entry ID */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 group-hover:text-indigo-700">
                          {j.id}
                        </td>
                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {j.date}
                        </td>
                         {/* Account */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                          {j.account_name || 'N/A'}
                        </td>
                        {/* Description */}
                        <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500" title={j.description}>
                          {j.description}
                        </td>
                        {/* Debit */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {formatCurrency(j.debit, true)}
                        </td>
                        {/* Credit */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {formatCurrency(j.credit, false)}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <JournalStatusPill status={j.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}