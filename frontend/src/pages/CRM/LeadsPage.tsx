// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchLeads, createLead, fetchMaterials, createCustomer } from '../../api/apiClient'

import OwnerTopNav from '@/components/layout/OwnerTopNav'
import ReceptionTopNav from '@/components/layout/ReceptionTopNav'
import SalesTopNav from '@/components/layout/SalesTopNav'
import MarketingTopNav from '@/components/layout/MarketingTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'

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
    address: '',
    channel: 'Walk-in',
  })

  const [materials, setMaterials] = useState<any[]>([])
  const [materialsError, setMaterialsError] = useState<string | null>(null)
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [leadItems, setLeadItems] = useState(
    Array.from({ length: 3 }).map(() => ({ material_id: '', quantity: '1' }))
  )

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchLeads()
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

  useEffect(() => {
    let mounted = true
    const loadMaterials = async () => {
      try {
        setLoadingMaterials(true)
        setMaterialsError(null)
        const mats = await fetchMaterials()
        if (!mounted) return
        setMaterials(mats || [])
      } catch (err: any) {
        if (!mounted) return
        setMaterialsError(err.message || 'Failed to load materials for lead items')
      } finally {
        if (!mounted) return
        setLoadingMaterials(false)
      }
    }

    loadMaterials()
    return () => {
      mounted = false
    }
  }, [])

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    setMaterialsError(null)
    try {
      const uiChannel = newLead.channel || 'Walk-in'

      // Map UI dropdown label to backend source/channel enums
      let source = 'web'
      let channel = 'web'
      switch (uiChannel) {
        case 'Walk-in':
          source = 'walkin'
          channel = 'web'
          break
        case 'Phone':
          source = 'phone'
          channel = 'web'
          break
        case 'WhatsApp':
          source = 'whatsapp'
          channel = 'whatsapp'
          break
        case 'Facebook':
          source = 'facebook'
          channel = 'facebook'
          break
        case 'Email':
          source = 'web'
          channel = 'web'
          break
        default:
          source = 'web'
          channel = 'web'
      }

      const items = leadItems
        .map((row) => ({
          material_id: row.material_id ? Number(row.material_id) : null,
          quantity: Number(row.quantity || '0'),
        }))
        .filter((row) => row.material_id && row.quantity > 0)

      if (items.length === 0) {
        setMaterialsError('Please select at least one material/product and quantity for this lead.')
        setCreating(false)
        return
      }

      // Step 1: create or register the customer in backend so we have a customer_id
      const customerPayload: any = {
        name: newLead.name || newLead.company || 'Lead customer',
        phone: newLead.phone || null,
        email: newLead.email || null,
        address: newLead.address || null,
        source,
      }

      const createdCustomer = await createCustomer(customerPayload)
      const customerId = createdCustomer.id

      // Step 2: create the lead linked to that customer and attach requested materials
      await createLead({
        customer_id: customerId,
        channel,
        items,
      })

      // refresh list
      const refreshed = await fetchLeads()
      setLeads(refreshed || [])
      setNewLead({ name: '', company: '', phone: '', email: '', address: '', channel: 'Walk-in' })
      setLeadItems(Array.from({ length: 3 }).map(() => ({ material_id: '', quantity: '1' })))
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
  const isReception = user?.role_id === 2
  const isMarketing = user?.role_id === 4

  const isOwner = user?.role_id === 1

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Super admin: only owner navbar. Marketing: only marketing navbar. Reception: only reception navbar. Others: owner + sales. */}
      {isOwner ? (
        <OwnerTopNav />

      ) : isMarketing ? (
        <MarketingTopNav />
      ) : isReception ? (
        <ReceptionTopNav />
      ) : (
        <>
          <OwnerTopNav />
          <SalesTopNav />
        </>
      )}

      {/* Owner shell: sidebar + main content wrapper. OwnerSideNav self-hides for non-owner roles. */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <OwnerSideNav />

          <main className="flex-1 space-y-10 max-w-7xl mx-auto">

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
                    <input
                      type="text"
                      placeholder="Address (optional)"
                      value={newLead.address}
                      onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
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

                  {/* Simple requested materials section for this lead */}
                  <div className="mt-3 rounded-2xl border border-blue-200/40 bg-blue-900/10 px-3 py-3 text-[11px] text-blue-50">
                    <p className="font-semibold mb-1">Requested materials (optional)</p>
                    {materialsError && (
                      <p className="mb-2 rounded-md bg-red-50/80 px-2 py-1 text-[10px] text-red-800 border border-red-200">
                        {materialsError}
                      </p>
                    )}
                    {loadingMaterials && (
                      <p className="mb-2 text-[10px] text-blue-100">Loading materials list…</p>
                    )}
                    <div className="space-y-1">
                      {leadItems.map((row, index) => (
                        <div
                          key={index}
                          className="grid gap-1 sm:grid-cols-[minmax(0,2.2fr)_minmax(0,0.8fr)] items-center"
                        >
                          <select
                            className="rounded-full border border-blue-200/60 bg-white/95 px-2 py-1.5 text-[11px] text-slate-900"
                            value={row.material_id}
                            onChange={(e) => {
                              const next = [...leadItems]
                              next[index] = { ...next[index], material_id: e.target.value }
                              setLeadItems(next)
                            }}
                          >
                            <option value="">Select material / product</option>
                            {materials.map((m: any) => (
                              <option key={m.id} value={String(m.id)}>
                                {m.name || m.material_name || m.sku || `Material ${m.id}`}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            className="rounded-full border border-blue-200/60 bg-white/95 px-2 py-1.5 text-[11px] text-slate-900"
                            placeholder="Qty"
                            value={row.quantity}
                            onChange={(e) => {
                              const next = [...leadItems]
                              next[index] = { ...next[index], quantity: e.target.value }
                              setLeadItems(next)
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] text-blue-100/80">
                      These items will be saved on the lead so quotes and production can see what the customer requested.
                    </p>
                  </div>
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

              {/* TODO: Leads table content goes here */}
            </div>

          </main>
        </div>
      </div>
    </div>
  
)
}