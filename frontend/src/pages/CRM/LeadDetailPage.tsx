// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ReceptionTopNav from '@/components/layout/ReceptionTopNav'
import SalesTopNav from '@/components/layout/SalesTopNav'
import { getAuthUser } from '@/utils/apiClient'
import { fetchLead } from '@/api/apiClient'

export default function LeadDetailPage() {
  const { id } = useParams()
  const [lead, setLead] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const user = getAuthUser()
  const isReception = user?.role_id === 2

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
    <div className="min-h-screen bg-slate-50">
      {isReception ? (
        <ReceptionTopNav />
      ) : (
        <>
          <OwnerTopNav />
          <SalesTopNav />
        </>
      )}
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
          </div>
        )}
      </div>
    </div>
  )
}
