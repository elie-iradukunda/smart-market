// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchLeads, createLead, fetchMaterials, createCustomer } from '../../api/apiClient'
import { toast } from 'react-toastify'

import DashboardLayout from '@/components/layout/DashboardLayout'

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const leadsPerPage = 8


  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchLeads(currentPage, leadsPerPage)
      .then((data) => {
        if (!isMounted) return
        const leadsList = Array.isArray(data) ? data : (data.leads || [])
        setLeads(leadsList)
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages)
        }
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
  }, [currentPage])

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
        company: newLead.company || null,
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

      // refresh list (go to page 1)
      setCurrentPage(1)
      const refreshed = await fetchLeads(1, leadsPerPage)
      const leadsList = Array.isArray(refreshed) ? refreshed : (refreshed.leads || [])
      setLeads(leadsList)
      if (refreshed.pagination) {
        setTotalPages(refreshed.pagination.totalPages)
      }
      setNewLead({ name: '', company: '', phone: '', email: '', address: '', channel: 'Walk-in' })
      setLeadItems(Array.from({ length: 3 }).map(() => ({ material_id: '', quantity: '1' })))
      toast.success('Lead created successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to create lead')
      toast.error(err.message || 'Failed to create lead')
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">

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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Company</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Channel</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">{lead.customer_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.company || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {lead.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {lead.created_at ? new Date(lead.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Just now'}
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No leads found. Create one above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-3xl -mt-6 pt-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Page numbers could go here, but for now just prev/next is fine or simple counter */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}