// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLeads, createLead, createCustomer } from '../../api/apiClient';
import { toast } from 'react-toastify';
import { Eye, Plus, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]); // List of recent leads
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    channel: 'Walk-in',
  });

  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [leadItems, setLeadItems] = useState(
    Array.from({ length: 3 }).map(() => ({ description: '', quantity: '1' }))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const leadsPerPage = 8;

  const loadLeads = (page) => {
    setLoading(true);
    setError(null);
    fetchLeads(page, leadsPerPage)
      .then((data) => {
        const leadsList = Array.isArray(data) ? data : (data.leads || []);
        setLeads(leadsList);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load leads');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLeads(currentPage);
  }, [currentPage]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMaterialsError(null);
    try {
      const uiChannel = newLead.channel || 'Walk-in';
      let source = 'web';
      let channel = 'web';

      switch (uiChannel) {
        case 'Walk-in': source = 'walkin'; channel = 'web'; break;
        case 'Phone': source = 'phone'; channel = 'web'; break;
        case 'WhatsApp': source = 'whatsapp'; channel = 'whatsapp'; break;
        case 'Facebook': source = 'facebook'; channel = 'facebook'; break;
        default: source = 'web'; channel = 'web';
      }

      const items = leadItems
        .map((row) => ({
          material_id: null,
          description: row.description || null,
          quantity: Number(row.quantity || '0'),
        }))
        .filter((row) => row.description && row.quantity > 0);

      if (items.length === 0) {
        setMaterialsError('Please describe what the customer needs.');
        setCreating(false);
        return;
      }

      const customerPayload = {
        name: newLead.name || newLead.company || 'Lead customer',
        company: newLead.company || null,
        phone: newLead.phone || null,
        email: newLead.email || null,
        address: newLead.address || null,
        source,
      };

      const createdCustomer = await createCustomer(customerPayload);
      await createLead({
        customer_id: createdCustomer.id,
        channel,
        status: 'New',
        items,
      });

      toast.success('Lead created successfully');
      setIsModalOpen(false);
      setNewLead({ name: '', company: '', phone: '', email: '', address: '', channel: 'Walk-in' });
      setLeadItems(Array.from({ length: 3 }).map(() => ({ description: '', quantity: '1' })));
      setCurrentPage(1);
      loadLeads(1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lead');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'Contacted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Qualified': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Leads Management</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium italic">Track and manage customer inquiries.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition duration-150 relative z-10"
            >
              <Plus size={18} />
              Add New Lead
            </button>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50" />
          </div>

          {/* Table Card */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Recent Leads
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {leads.length} Records
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-[700px] divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Customer</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Channel</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Date Received</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading leads...</td></tr>
                  ) : leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{lead.customer_name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{lead.customer_company || lead.company || 'No company'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {lead.channel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/dashboard/sales/crm/leads/${lead.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Eye size={14} />
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              <div className="text-xs text-slate-500 font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Capture New Lead</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Contact Name</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Company Name</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition"
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Email Address</label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Address</label>
                  <input
                    type="text"
                    placeholder="Full street address..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition"
                    value={newLead.address}
                    onChange={(e) => setNewLead({ ...newLead, address: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Lead Channel</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition"
                    value={newLead.channel}
                    onChange={(e) => setNewLead({ ...newLead, channel: e.target.value })}
                  >
                    <option value="Walk-in">Walk-in</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Requested Items</label>
                  {materialsError && <span className="text-[10px] text-red-500 font-bold">{materialsError}</span>}
                </div>
                <div className="space-y-2">
                  {leadItems.map((row, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Item description..."
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        value={row.description}
                        onChange={(e) => {
                          const next = [...leadItems];
                          next[index].description = e.target.value;
                          setLeadItems(next);
                        }}
                      />
                      <input
                        type="number"
                        className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        value={row.quantity}
                        onChange={(e) => {
                          const next = [...leadItems];
                          next[index].quantity = e.target.value;
                          setLeadItems(next);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {creating ? 'Saving...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}