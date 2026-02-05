// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchQuotes, createQuote, approveQuote, fetchCustomers, fetchLead, fetchLeads } from '../../api/apiClient'
import { DollarSign } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  // Parse route id like "L-12" to numeric backend id 12
  const numericId = React.useMemo(() => {
    if (!id) return null
    const str = String(id)
    if (str.startsWith('L-')) {
      return str.split('-')[1]
    }
    return str
  }, [id])

  useEffect(() => {
    if (!numericId) return
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchLead(numericId)
      .then((data) => {
        if (!isMounted) return
        setLead(data)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load lead')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [numericId])

  const renderStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'hot') return 'inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-800 border border-red-200'
    if (s === 'qualified') return 'inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200'
    if (s === 'contacted') return 'inline-flex items-center rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-800 border border-purple-200'
    return 'inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200'
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600">
              Loading lead details...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && lead && (
            <>
              <div className="rounded-3xl bg-gradient-to-r from-[#043b84] via-[#0555b0] to-[#0fb3ff] p-6 sm:p-8 shadow-2xl border border-blue-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Lead details</p>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                    {lead.customer_name || `Lead ${lead.id}`}
                  </h1>
                  <p className="mt-2 text-sm text-blue-100/90">
                    Channel: <span className="font-semibold">{lead.channel || 'N/A'}</span> • ID: <span className="font-mono">L-{lead.id}</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm w-full sm:w-auto">
                    <div className="rounded-xl bg-white/10 px-4 py-3 border border-blue-200/40 text-blue-50">
                      <p className="text-[11px] uppercase tracking-wide text-blue-100/80">Status</p>
                      <div className="mt-1">
                        <span className={renderStatusBadge(lead.status)}>{lead.status || 'New'}</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/10 px-4 py-3 border border-blue-200/40 text-blue-50">
                      <p className="text-[11px] uppercase tracking-wide text-blue-100/80">Owner</p>
                      <p className="mt-1 text-sm font-semibold">
                        {lead.owner_name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/sales/crm/quotes?leadId=${lead.id}`)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#0555b0] shadow-xl hover:bg-blue-50 transition-all whitespace-nowrap"
                  >
                    <DollarSign size={18} />
                    Convert to Quote
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Name</label>
                      <p className="text-slate-900 font-medium">{lead.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
                      <p className="text-slate-900 font-medium">{lead.customer_company || lead.company || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                      <p className="text-slate-900 font-medium">{lead.customer_email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                      <p className="text-slate-900 font-medium">{lead.customer_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Physical Address</label>
                      <p className="text-slate-900 font-medium">{lead.customer_address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    Requested Items
                  </h3>
                  <div className="space-y-3">
                    {lead.items && lead.items.length > 0 ? (
                      lead.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                          <span className="font-medium text-slate-700">{item.description || item.material_name || 'Generic Item'}</span>
                          <span className="px-3 py-1 rounded-full bg-white text-xs font-bold text-blue-600 border border-blue-100">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm italic">No items requested for this lead.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
