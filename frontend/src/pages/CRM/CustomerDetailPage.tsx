// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ControllerTopNav from '@/components/layout/ControllerTopNav'
import ReceptionTopNav from '@/components/layout/ReceptionTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import { getAuthUser } from '@/utils/apiClient'
import { fetchCustomer, fetchChurnPredictions, fetchSegmentPredictions } from '../../api/apiClient'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [aiChurn, setAiChurn] = useState(null)
  const [aiSegment, setAiSegment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([
      fetchCustomer(id),
      fetchChurnPredictions().catch(() => []),
      fetchSegmentPredictions().catch(() => []),
    ])
      .then(([data, churnList, segmentList]) => {
        if (!isMounted) return

        setCustomer(data)

        const numericId = Number(id)
        const churnForCustomer = (churnList || []).find((c) => Number(c.target_id) === numericId)
        const segmentForCustomer = (segmentList || []).find((s) => Number(s.target_id) === numericId)

        setAiChurn(churnForCustomer || null)
        setAiSegment(segmentForCustomer || null)
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load customer')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const user = getAuthUser()
  const isController = user?.role_id === 4
  const isReception = user?.role_id === 2
  const isOwner = user?.role_id === 1

  return (
    <div className="min-h-screen bg-slate-50">
      {isController ? <ControllerTopNav /> : isReception ? <ReceptionTopNav /> : <OwnerTopNav />}

      {/* Owner shell: sidebar + main content wrapper. OwnerSideNav only for owner/admin (role_id 1). */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="flex gap-6 max-w-7xl mx-auto">
          {isOwner && <OwnerSideNav />}

          <main className="flex-1 space-y-8">
        {/* Header card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Customer profile</p>
            {loading ? (
              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-500">Loading...</h1>
            ) : error ? (
              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-red-600">{error}</h1>
            ) : customer ? (
              <>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {customer.name}
                </h1>
                <p className="mt-3 text-sm text-slate-600">
                  {customer.segment || 'Customer'}
                  {customer.source ? ` • ${customer.source}` : ''}
                </p>
              </>
            ) : (
              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-500">Customer not found</h1>
            )}
          </div>

          {!loading && customer && (
            <div className="w-full md:w-72 grid grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                <p className="text-slate-500">Phone</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{customer.phone || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                <p className="text-slate-500">Email</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{customer.email || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100 col-span-2">
                <p className="text-slate-500">Address</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{customer.address || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100 col-span-2">
                <p className="text-slate-500">Source</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{customer.source || '-'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main layout */}
        {!loading && customer && (
          <div className="grid gap-6 lg:grid-cols-[1.8fr,1.2fr] items-start">
            {/* Left: contact & activity summary placeholder */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Contact details</h2>
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{customer.phone || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Email</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{customer.email || '-'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Address</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{customer.address || '-'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Source</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{customer.source || '-'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Right: AI insights */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-indigo-100 bg-indigo-50/80 p-6 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700 mb-2">AI insights</p>
                {aiChurn || aiSegment ? (
                  <div className="space-y-3 text-sm">
                    {aiChurn && (
                      <div className="rounded-2xl bg-white/80 px-4 py-3 border border-indigo-100">
                        <p className="text-xs font-medium text-slate-500">Churn risk</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {(Number(aiChurn.predicted_value) * 100).toFixed(0)}%
                        </p>
                      </div>
                    )}
                    {aiSegment && (
                      <div className="rounded-2xl bg-white/80 px-4 py-3 border border-indigo-100">
                        <p className="text-xs font-medium text-slate-500">Segment</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{aiSegment.predicted_value}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">No AI insights available yet for this customer.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && !error && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Loading customer details...</p>
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}
          </main>
        </div>
      </div>
    </div>
  )
}
