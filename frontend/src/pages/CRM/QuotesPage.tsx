// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  fetchQuotes, 
  createQuote, 
  approveQuote, 
  fetchCustomers, 
  fetchLead, 
  fetchLeads 
} from '../../api/apiClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAuthUser } from '@/utils/apiClient';
import { 
  Search, 
  Loader2, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  User,
  ArrowRight
} from 'lucide-react';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [success, setSuccess] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);

  const [newQuote, setNewQuote] = useState({
    customerId: '',
    description: '',
    unitPrice: '',
    quantity: '',
  });

  const [leadIdForQuote, setLeadIdForQuote] = useState('');
  const [availableLeads, setAvailableLeads] = useState([]);
  const [leadItemsForQuote, setLeadItemsForQuote] = useState([]);
  const [loadingLeadForQuote, setLoadingLeadForQuote] = useState(false);
  const [leadLoadError, setLeadLoadError] = useState(null);

  const getStatusTag = (status) => {
    const s = status ? status.toLowerCase() : '';
    switch (s) {
      case 'accepted':
      case 'approved':
        return (
          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100 uppercase tracking-tighter">
            <CheckCircle className="h-3 w-3 mr-1" /> Accepted
          </span>
        );
      case 'pending':
      case 'sent':
        return (
          <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 border border-amber-100 uppercase tracking-tighter">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center rounded-lg bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 border border-red-100 uppercase tracking-tighter">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200 uppercase tracking-tighter">
            <FileText className="h-3 w-3 mr-1" /> Draft
          </span>
        );
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const loadInitialData = async () => {
      try {
        const [quotesData, customersData, leadsData] = await Promise.all([
          fetchQuotes(),
          fetchCustomers(),
          fetchLeads()
        ]);

        if (!isMounted) return;

        const formattedQuotes = Array.isArray(quotesData) ? quotesData.map(q => ({
          ...q,
          value: q.total_amount || q.total,
          customerName: q.customer_name
        })) : [];

        setQuotes(formattedQuotes);
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setAvailableLeads(Array.isArray(leadsData) ? leadsData : (leadsData?.leads || []));
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Data synchronization failed.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  const location = useLocation();
  const hasAutoLoaded = React.useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qLeadId = params.get('leadId');
    if (qLeadId && availableLeads.length > 0 && !hasAutoLoaded.current) {
      setLeadIdForQuote(qLeadId);
      hasAutoLoaded.current = true;
    }
  }, [location.search, availableLeads]);

  useEffect(() => {
    if (leadIdForQuote && availableLeads.length > 0) {
      handleLoadFromLead();
    }
  }, [leadIdForQuote, availableLeads]);

  const handleLoadFromLead = async () => {
    if (!leadIdForQuote) return;
    setLeadLoadError(null);
    setLoadingLeadForQuote(true);
    try {
      const lead = await fetchLead(leadIdForQuote);
      if (lead.customer_id) {
        setNewQuote(prev => ({ ...prev, customerId: String(lead.customer_id) }));
      }
      const items = Array.isArray(lead.items) ? lead.items.map(it => ({
        material_id: it.material_id,
        description: it.description || it.material_name || `Item ${it.id}`,
        quantity: Number(it.quantity || 0) || 0,
        unitPrice: '',
      })) : [];
      setLeadItemsForQuote(items);
    } catch (err) {
      setLeadLoadError(err.message || 'Failed to load lead materials.');
    } finally {
      setLoadingLeadForQuote(false);
    }
  };

  const handleCreateQuote = async (e) => {
    if (e) e.preventDefault();
    if (!newQuote.customerId || leadItemsForQuote.length === 0) {
      setError('Missing customer selection or lead items.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const itemsPayload = leadItemsForQuote
        .map(row => ({
          material_id: row.material_id || null,
          description: row.description,
          unit_price: Number(row.unitPrice || 0),
          quantity: Number(row.quantity || 0),
        }))
        .filter(row => row.quantity > 0);

      await createQuote({
        customer_id: Number(newQuote.customerId),
        items: itemsPayload,
      });

      setNewQuote({ customerId: '', description: '', unitPrice: '', quantity: '' });
      setLeadIdForQuote('');
      setLeadItemsForQuote([]);
      const data = await fetchQuotes();
      setQuotes(Array.isArray(data) ? data.map(q => ({ ...q, value: q.total_amount || q.total, customerName: q.customer_name })) : []);
      setSuccess('Quote generated successfully.');
    } catch (err) {
      setError(err.message || 'Quote creation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveQuote = async () => {
    if (!selectedQuote) return;
    setApproving(true);
    setError(null);
    try {
      await approveQuote(selectedQuote.id);
      const data = await fetchQuotes();
      const formatted = Array.isArray(data) ? data.map(q => ({ ...q, value: q.total_amount || q.total, customerName: q.customer_name })) : [];
      setQuotes(formatted);
      setSelectedQuote(formatted.find(q => q.id === selectedQuote.id) || null);
      setSuccess('Quote approved. Order is now active.');
    } catch (err) {
      setError(err.message || 'Approval failed.');
    } finally {
      setApproving(false);
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const term = search.toLowerCase();
    return String(q.id).toLowerCase().includes(term) || (q.customerName || '').toLowerCase().includes(term);
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Quotes</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search quote ID or customer..."
                className="w-full md:w-80 rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex-1 min-w-[240px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Select Customer</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={newQuote.customerId}
                    onChange={(e) => setNewQuote({ ...newQuote, customerId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="">Select a client...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.company ? `— ${c.company}` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 min-w-[240px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Source Lead Items</label>
                <div className="flex gap-2">
                  <select
                    value={leadIdForQuote}
                    onChange={(e) => setLeadIdForQuote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all"
                  >
                    <option value="">Select lead source...</option>
                    {availableLeads.map(lead => (
                      <option key={lead.id} value={String(lead.id).replace(/^L-?/i, '')}>{lead.name} ({lead.channel})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleLoadFromLead}
                    disabled={loadingLeadForQuote || !leadIdForQuote}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-all whitespace-nowrap"
                  >
                    {loadingLeadForQuote ? 'Syncing...' : 'Load Items'}
                  </button>
                </div>
              </div>
            </div>

            {leadItemsForQuote.length > 0 && (
              <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/30 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                    <DollarSign size={16} /> Item Pricing Configuration
                  </h3>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Estimated Total</p>
                    <p className="text-xl font-bold text-blue-900">
                      RWF {leadItemsForQuote.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {leadItemsForQuote.map((row, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr,100px,150px,120px] gap-4 items-end bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Description</label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium"
                          value={row.description}
                          onChange={(e) => {
                            const next = [...leadItemsForQuote];
                            next[index] = { ...next[index], description: e.target.value };
                            setLeadItemsForQuote(next);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Qty</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-center"
                          value={row.quantity}
                          onChange={(e) => {
                            const next = [...leadItemsForQuote];
                            next[index] = { ...next[index], quantity: e.target.value };
                            setLeadItemsForQuote(next);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-blue-600 uppercase mb-1 block">Unit Price (RWF)</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-100 outline-none"
                          value={row.unitPrice}
                          onChange={(e) => {
                            const next = [...leadItemsForQuote];
                            next[index] = { ...next[index], unitPrice: e.target.value };
                            setLeadItemsForQuote(next);
                          }}
                        />
                      </div>
                      <div className="text-right">
                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Subtotal</label>
                        <p className="text-sm font-bold text-slate-900">
                          {(Number(row.unitPrice || 0) * Number(row.quantity || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCreateQuote}
                    disabled={saving || !newQuote.customerId}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100 transition-all"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText size={18} />}
                    Generate & Send Quote
                  </button>
                </div>
              </div>
            )}

            {(error || success) && (
              <div className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center justify-between ${error ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                <div className="flex items-center gap-2">
                  {error ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  {error || success}
                </div>
                {success && !error && (
                  <Link to="/orders" className="text-xs font-bold underline flex items-center gap-1">
                    View Orders <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            )}

            <div className="grid lg:grid-cols-[1fr,350px] gap-8">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-right font-bold text-slate-500 uppercase text-[10px] tracking-wider">Value (RWF)</th>
                      <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase text-[10px] tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">Synchronizing with server...</td>
                      </tr>
                    ) : filteredQuotes.map(q => (
                      <tr 
                        key={q.id} 
                        onClick={() => setSelectedQuote(q)}
                        className={`cursor-pointer transition-all hover:bg-blue-50/50 ${selectedQuote?.id === q.id ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-100' : ''}`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900">{q.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{q.customerName}</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600">
                          {q.value ? q.value.toLocaleString() : '0'}
                        </td>
                        <td className="px-6 py-4 text-center">{getStatusTag(q.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                {!selectedQuote ? (
                  <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                    <FileText size={48} className="mb-4 text-slate-300" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select a Quote</p>
                    <p className="mt-1 text-xs text-slate-500">Preview financial details and approvals.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Quote Reference</p>
                      <h2 className="text-2xl font-bold text-slate-900 mt-1">#{selectedQuote.id}</h2>
                      <p className="text-sm font-medium text-slate-500">{selectedQuote.customerName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Total Value</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          {selectedQuote.value ? `RWF ${selectedQuote.value.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Current Status</p>
                        <div className="mt-1">{getStatusTag(selectedQuote.status)}</div>
                      </div>
                    </div>

                    {selectedQuote.status !== 'approved' && (
                      <button
                        onClick={handleApproveQuote}
                        disabled={approving}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                      >
                        {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle size={18} />}
                        Approve & Create Order
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}