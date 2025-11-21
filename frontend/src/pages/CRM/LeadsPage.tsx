// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchDemoLeads, createLead } from '../../api/apiClient'

import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ReceptionTopNav from '@/components/layout/ReceptionTopNav'
import SalesTopNav from '@/components/layout/SalesTopNav'
import { getAuthUser } from '@/utils/apiClient'

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    channel: 'Walk-in',
  })

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchDemoLeads()
      .then((data) => {
        if (!isMounted) return
        setLeads(data || [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load leads')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      await createLead({
        customer_name: newLead.name || newLead.company,
        company: newLead.company || null,
        phone: newLead.phone || null,
        email: newLead.email || null,
        channel: newLead.channel || 'Walk-in',
        status: 'New',
      })
      // refresh list
      const refreshed = await fetchDemoLeads()
      setLeads(refreshed || [])
      setNewLead({ name: '', company: '', phone: '', email: '', channel: 'Walk-in' })
    } catch (err: any) {
      setError(err.message || 'Failed to create lead')
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Hot':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Qualified':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const user = getAuthUser()
  const isReception = user?.role_id === 5

  return (
    <div className="min-h-screen bg-slate-50">
      {isReception ? <ReceptionTopNav /> : <OwnerTopNav />}
      <SalesTopNav />
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-10 space-y-10">

        {/* Main Header Grid */}
        <div className="grid gap-8 lg:grid-cols-[2fr,1.3fr] items-stretch">

          {/* Leads Inbox Hero Card */}
          <div className="rounded-3xl bg-gradient-to-r from-[#043b84] via-[#0555b0] to-[#0fb3ff] p-8 shadow-2xl border border-blue-500/40 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Customer Relationship Management</p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                New <span className="text-cyan-300">Leads Inbox</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-blue-100/90 max-w-xl">
                Capture and qualify website, walk-in, and campaign enquiries in one modern, real-time dashboard.
              </p>
            </div>

            {/* Action/Filter Buttons */}
            <div className="mt-7 flex flex-col gap-4 text-xs sm:text-sm">
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-white text-[#043b84] px-5 py-2 font-semibold shadow-md shadow-blue-900/30 hover:bg-blue-50 transition duration-150">
                  All channels
                </button>
                <button className="rounded-full border border-blue-100/70 bg-blue-500/10 px-4 py-2 font-medium text-blue-50 hover:bg-blue-400/20 transition duration-150">
                  Hot leads
                </button>
                <button className="rounded-full border border-blue-200/70 bg-blue-900/20 px-4 py-2 font-medium text-blue-50 hover:bg-blue-800/40 transition duration-150">
                  Needs follow-up
                </button>
              </div>

              {/* Inline create-lead form for accountants */}
              <form onSubmit={handleCreateLead} className="flex flex-wrap gap-2 items-center bg-blue-900/20 border border-cyan-300/50 rounded-2xl px-3 py-3">
                <p className="text-[11px] font-semibold text-cyan-100 mr-2">Quick add lead:</p>
                <input
                  type="text"
                  placeholder="Name or contact person"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="min-w-[120px] flex-1 rounded-full border border-blue-200/70 bg-white/95 px-3 py-1.5 text-[11px] text-slate-900 placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Company (optional)"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="min-w-[120px] flex-1 rounded-full border border-blue-200/70 bg-white/95 px-3 py-1.5 text-[11px] text-slate-900 placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="min-w-[110px] rounded-full border border-blue-200/70 bg-white/95 px-3 py-1.5 text-[11px] text-slate-900 placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="min-w-[150px] rounded-full border border-blue-200/70 bg-white/95 px-3 py-1.5 text-[11px] text-slate-900 placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <select
                  value={newLead.channel}
                  onChange={(e) => setNewLead({ ...newLead, channel: e.target.value })}
                  className="rounded-full border border-blue-200/70 bg-blue-950/50 px-3 py-1.5 text-[11px] text-blue-50 focus:outline-none focus:ring-1 focus:ring-cyan-300"
                >
                  <option value="Walk-in">Walk-in</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Email">Email</option>
                </select>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center rounded-full bg-cyan-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? 'Saving...' : 'Add Lead'}
                </button>
              </form>
            </div>

          </div>

          {/* Visual side card */}
          <div className="rounded-3xl overflow-hidden border border-blue-100/60 bg-blue-900 shadow-[0_20px_60px_rgba(15,23,42,0.45)] relative">
            <img
              src="https://images.pexels.com/photos/1181555/pexels-photo-1181555.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Customer communications on laptop and phone"
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Live Communications</p>
              <p className="mt-2 text-sm sm:text-base text-slate-50 max-w-xs">
                Every enquiry, from WhatsApp to website forms, appears here with a clear owner and status.
              </p>
            </div>
          </div>
        </div>

        {/* Leads Table Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">Recent Leads</p>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name, company, or channel"
              className="w-full sm:max-w-xs rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 
                       focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition duration-150 shadow-sm"
            />
          </div>
          
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>
          )}
          {loading ? (
            <p className="text-sm text-slate-500 py-4">Loading leads...</p>
          ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-indigo-50/80 border-b border-indigo-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">ID</th>
                  <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Name / Company</th>
                  <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Channel</th>
                  <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Owner</th>
                  <th className="px-6 py-3 font-semibold text-indigo-700 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map(lead => (
                  <tr key={lead.id} className="bg-white hover:bg-blue-50/50 transition duration-150 cursor-pointer">
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{lead.id}</td>
                    <td className="px-6 py-3 text-slate-900 font-medium">{lead.name}</td>
                    <td className="px-6 py-3 text-slate-700">
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-0.5 text-xs font-medium">
                        {lead.channel}
                      </span>
                    </td>
                    
                    <td className="px-6 py-3">
                      {/* Status Tag - Dynamically colored tag */}
                      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-700">{lead.owner}</td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/crm/leads/${lead.id}`}
                        className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-4"
                      >
                        View →
                      </Link>
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