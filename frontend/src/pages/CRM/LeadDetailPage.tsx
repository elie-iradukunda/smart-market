// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLead } from '../../api/apiClient';
import { DollarSign, ArrowLeft, Mail, Phone, MapPin, Building2, User } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numericId = React.useMemo(() => {
    if (!id) return null;
    const str = String(id);
    if (str.startsWith('L-')) {
      return str.split('-')[1];
    }
    return str;
  }, [id]);

  useEffect(() => {
    if (!numericId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchLead(numericId)
      .then((data) => {
        if (!isMounted) return;
        setLead(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load lead');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [numericId]);

  const renderStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'hot') return 'inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 border border-red-200';
    if (s === 'qualified') return 'inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200';
    if (s === 'contacted') return 'inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 border border-purple-200';
    return 'inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 border border-blue-200';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">

          {/* Top Navigation Row */}
          <button
            onClick={() => navigate('/dashboard/sales/crm/leads')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium mb-2"
          >
            <ArrowLeft size={16} />
            Back to Leads Inbox
          </button>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-sm text-slate-600">Retrieving lead record...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && lead && (
            <>
              {/* Header Profile Card */}
              <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {(lead.customer_name || 'L').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-slate-900">
                        {lead.customer_name || `Lead ${lead.id}`}
                      </h1>
                      <span className={renderStatusBadge(lead.status)}>{lead.status || 'New'}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Enquiry via <span className="font-semibold text-slate-700">{lead.channel || 'Direct'}</span> • Reference: L-{lead.id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/dashboard/sales/crm/quotes?leadId=${lead.id}`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all whitespace-nowrap"
                  >
                    <DollarSign size={18} />
                    Convert to Quote
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Contact & Metadata */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <User size={20} className="text-blue-600" />
                      Contact Profile
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                      <div className="flex items-start gap-4">
                        <Building2 className="text-slate-400 mt-1" size={18} />
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company</label>
                          <p className="text-slate-900 font-medium text-lg leading-tight">{lead.customer_company || lead.company || 'Private Individual'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Mail className="text-slate-400 mt-1" size={18} />
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                          <p className="text-slate-900 font-medium text-lg leading-tight break-all">{lead.customer_email || 'No email provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Phone className="text-slate-400 mt-1" size={18} />
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone</label>
                          <p className="text-slate-900 font-medium text-lg leading-tight">{lead.customer_phone || 'No phone provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <MapPin className="text-slate-400 mt-1" size={18} />
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Address</label>
                          <p className="text-slate-900 font-medium text-lg leading-tight">{lead.customer_address || lead.address || 'No address provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      Customer Requirements
                    </h3>
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {lead.items && lead.items.length > 0 ? (
                            lead.items.map((item: any, idx: number) => (
                              <tr key={idx}>
                                <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                                  {item.description || item.material_name || 'Generic Item'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                    {item.quantity}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-6 py-8 text-center text-slate-400 italic text-sm">
                                No items listed for this enquiry.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Column: Internal Info */}
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Internal Assignment</h3>
                    <div className="space-y-6">
                      <div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Lead Created</label>
                          <p className="mt-1 text-slate-800 font-medium">
                            {lead.created_at ? new Date(lead.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-blue-50 p-6 border border-blue-100">
                    <h4 className="text-blue-900 font-bold text-sm mb-2">Ready to proceed?</h4>
                    <p className="text-blue-700 text-xs leading-relaxed mb-4">
                      Converting this lead will transfer all contact details and requested items into a new Quote draft.
                    </p>
                    <button
                      onClick={() => navigate(`/dashboard/sales/crm/quotes?leadId=${lead.id}`)}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                    >
                      Draft Quote Now
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}