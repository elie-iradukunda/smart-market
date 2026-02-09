// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchCustomer, fetchChurnPredictions, fetchSegmentPredictions, fetchOrders } from '../../api/apiClient'
import { ArrowLeft, Package, Clock, Phone, Mail, MapPin, Globe, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
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
      fetchOrders(id),
      fetchChurnPredictions().catch(() => []),
      fetchSegmentPredictions().catch(() => []),
    ])
      .then(([data, orderList, churnList, segmentList]) => {
        if (!isMounted) return

        setCustomer(data)
        setOrders(orderList || [])

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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Go Back</span>
              </button>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Customer profile</p>
              {loading ? (
                <div className="mt-3 flex items-center gap-3">
                  <Loader className="animate-spin text-blue-600" size={24} />
                  <h1 className="text-2xl sm:text-3xl font-semibold text-slate-400">Loading...</h1>
                </div>
              ) : error ? (
                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-red-600">{error}</h1>
              ) : customer ? (
                <>
                  <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {customer.name}
                  </h1>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 border border-slate-200 uppercase tracking-widest">{customer.segment || 'Retail Client'}</span>
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <p className="text-sm font-medium text-slate-500">
                      {customer.source ? `Source: ${customer.source}` : 'Direct Lead'}
                    </p>
                  </div>
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
            <div className="grid gap-8 lg:grid-cols-[2fr,1fr] items-start">
              <div className="space-y-8">
                {/* Contact details */}
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Contact Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { label: 'Phone Number', value: customer.phone, icon: Phone },
                      { label: 'Email Address', value: customer.email, icon: Mail },
                      { label: 'Physical Address', value: customer.address, icon: MapPin, full: true },
                      { label: 'Acquisition Source', value: customer.source, icon: Globe },
                    ].map((item, idx) => (
                      <div key={idx} className={item.full ? 'md:col-span-2' : ''}>
                        <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</dt>
                        <dd className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          {item.value || 'Not provided'}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order History */}
                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Package size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Order History</h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase bg-white px-3 py-1 rounded-full border border-slate-200">
                      {orders.length} Orders
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 italic font-medium">
                      No order history found for this customer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto scrollbar-thin">
                      <table className="min-w-[600px] w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                          <tr>
                            <th className="px-8 py-4">Order ID</th>
                            <th className="px-8 py-4">Status</th>
                            <th className="px-8 py-4 text-right">Total (RF)</th>
                            <th className="px-8 py-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.slice(0, 10).map((order: any) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                              <td className="px-8 py-4">
                                <span className="font-bold text-slate-900">ORD-#{order.id}</span>
                              </td>
                              <td className="px-8 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border
                                  ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    order.status === 'production' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                      'bg-slate-50 text-slate-700 border-slate-100'}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-8 py-4 text-right font-bold text-slate-900">
                                {Number(order.total || 0).toLocaleString()} RF
                              </td>
                              <td className="px-8 py-4 text-slate-400 font-medium">
                                {order.eta ? new Date(order.eta).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: AI insights */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600 border border-blue-100">
                      <Clock size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-blue-900">AI Intelligence</h2>
                  </div>

                  {aiChurn || aiSegment ? (
                    <div className="space-y-4">
                      {aiChurn && (
                        <div className="rounded-2xl bg-white px-5 py-4 border border-blue-100 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Churn Risk Score</p>
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-black text-slate-900">
                              {(Number(aiChurn.predicted_value) * 100).toFixed(0)}%
                            </p>
                            <div className={`h-2 w-12 rounded-full ${Number(aiChurn.predicted_value) > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          </div>
                        </div>
                      )}
                      {aiSegment && (
                        <div className="rounded-2xl bg-white px-5 py-4 border border-blue-100 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Market Segment</p>
                          <p className="text-xl font-bold text-blue-700">{aiSegment.predicted_value}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/50 rounded-2xl p-4 border border-blue-100/50 text-center">
                      <p className="text-sm text-blue-600/70 font-medium italic">Generating insights...</p>
                    </div>
                  )}
                </div>

                {/* Quick actions placeholder */}
                <div className="rounded-3xl border border-slate-200 bg-white p-8">
                  <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all text-slate-600">Edit Customer</button>
                    <button className="w-full text-left px-4 py-2 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all text-slate-600">Send Message</button>
                    <button className="w-full text-left px-4 py-2 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all text-rose-600">Mark as Inactive</button>
                  </div>
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
        </div>
      </div>
    </DashboardLayout>
  )
}
