// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPOSSales, createCustomer, fetchCustomers } from '@/api/apiClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RevenueOverview from '../modules/dashboards/components/RevenueOverview';
import {
  User, Calendar, CreditCard, Download, AlertTriangle, Loader, Package,
  TrendingUp, Users, FileText, MessageSquare, Target, ArrowRight,
  DollarSign, BarChart3, Search
} from 'lucide-react';

export default function SalesDashboard() {
  const [posSummary, setPosSummary] = useState({ todayTotal: 0, todayCount: 0, last7Total: 0 });
  const [posSales, setPosSales] = useState<any[]>([]);
  const [posLoading, setPosLoading] = useState(true);
  const [posError, setPosError] = useState<string | null>(null);
  const [posFilter, setPosFilter] = useState({
    paymentMethod: 'All',
    date: new Date().toISOString().slice(0, 10),
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    source: 'Walk-in',
  });
  const [customerStatus, setCustomerStatus] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setPosLoading(true);
    setPosError(null);
    fetchPOSSales()
      .then((data) => {
        if (!isMounted) return;
        const mapped = (data || []).map((s) => {
          const dt = new Date(s.created_at);
          return {
            id: `POS-${s.id}`,
            customer: s.customer_name || 'Walk-in',
            cashier: s.cashier_name || 'Unknown',
            total: Number(s.total) || 0,
            paymentMethod: s.payment_method || 'Cash',
            date: dt.toISOString().slice(0, 10),
            time: dt.toTimeString().slice(0, 5),
          };
        });

        setPosSales(mapped);
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);

        let todayTotal = 0;
        let todayCount = 0;
        let last7Total = 0;

        mapped.forEach((s) => {
          const created = new Date(`${s.date}T${s.time}:00`);
          if (Number.isNaN(created.getTime())) return;

          const total = typeof s.total === 'number' ? s.total : 0;
          if (!Number.isFinite(total)) return;

          const dateStr = created.toISOString().slice(0, 10);
          const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

          if (dateStr === todayStr) {
            todayTotal += total;
            todayCount += 1;
          }
          if (diffDays >= 0 && diffDays <= 7) {
            last7Total += total;
          }
        });

        setPosSummary({ todayTotal, todayCount, last7Total });
      })
      .catch(() => {
        if (!isMounted) return;
        setPosError('Failed to load POS sales history.');
      })
      .finally(() => {
        if (!isMounted) return;
        setPosLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoadingLookup(true);
        setLookupError(null);
        const cust = await fetchCustomers();
        if (!mounted) return;
        setCustomers(cust || []);
      } catch (err: any) {
        if (!mounted) return;
        setLookupError(err.message || 'Failed to load POS dropdown data.');
      } finally {
        if (!mounted) return;
        setLoadingLookup(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setCustomerStatus(null);
    setCustomerError(null);
    try {
      setIsSubmitting(true);
      const payload = { ...customerForm };
      const res = await createCustomer(payload);
      setCustomerStatus(`Customer created successfully!`);
      setCustomerForm({ name: '', phone: '', email: '', address: '', source: 'Walk-in' });
      try {
        const freshCustomers = await fetchCustomers();
        setCustomers(freshCustomers || []);
      } catch (refreshErr) {
        // Best-effort reload.
      }
    } catch (err: any) {
      setCustomerError(err.message || 'Failed to create customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePosFilterChange = (e) => {
    const { name, value } = e.target;
    setPosFilter((prev) => ({ ...prev, [name]: value }));
  };

  const filteredSales = posSales.filter((sale) => {
    if (posFilter.paymentMethod !== 'All' && sale.paymentMethod !== posFilter.paymentMethod) {
      return false;
    }
    if (posFilter.date && sale.date !== posFilter.date) {
      return false;
    }
    return true;
  });

  const totalForFilterDay = filteredSales.reduce(
    (sum, sale) => sum + (typeof sale.total === 'number' ? sale.total : 0),
    0
  );
  const transactionCountForDay = filteredSales.length;
  const averageTicketForDay = transactionCountForDay
    ? totalForFilterDay / transactionCountForDay
    : 0;

  const handleExportDaily = () => {
    if (!filteredSales.length) return;
    const header = ['ID', 'Customer', 'Cashier', 'Payment Method', 'Total', 'Date', 'Time'];
    const rows = filteredSales.map((s) => [
      s.id,
      s.customer,
      s.cashier,
      s.paymentMethod,
      s.total,
      s.date,
      s.time,
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateLabel = posFilter.date || 'all';
    link.download = `pos-sales-${dateLabel}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Simple Header Section */}
          <div className="mb-10 p-8 bg-white border border-slate-200 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                <TrendingUp size={16} />
                <span>Sales Hub</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Sales Growth.</h1>
              <p className="max-w-xl text-slate-500 font-medium">
                Manage leads, generate quotes, and process daily transactions.
              </p>
              <div className="flex gap-3 pt-4">
                <Link to="/dashboard/sales/crm/leads" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Manage Leads</Link>
                <Link to="/dashboard/sales/crm/quotes" className="bg-white text-slate-900 border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">New Quote</Link>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 min-w-[280px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Today's Revenue</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">RF {posSummary.todayTotal.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-600">+{posSummary.todayCount} sales</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">65% of Daily Goal.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-8 space-y-8">

              {/* CRM Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Capture Lead', icon: Target, path: '/dashboard/sales/crm/leads', color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Draft Quote', icon: FileText, path: '/dashboard/sales/crm/quotes', color: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((card, i) => (
                  <Link key={i} to={card.path} className="group rounded-3xl border border-slate-200 bg-white p-6 hover:border-indigo-200 transition-all">
                    <div className={`h-12 w-12 rounded-2xl ${card.bg} ${card.text} flex items-center justify-center mb-4 transition-transform`}>
                      <card.icon size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900 tracking-tight">{card.label}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Access Module →</p>
                  </Link>
                ))}
              </div>

              {/* POS Transaction History */}
              <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Daily Transactions.</h3>
                      <p className="text-sm text-slate-500 font-medium">Counter sales and reconciliation records.</p>
                    </div>
                  </div>
                  <button onClick={handleExportDaily} className="flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-200 transition-all border border-slate-200">
                    <Download size={14} /> EXPORT CSV
                  </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Sales</p>
                      <p className="font-bold text-indigo-600">RF {totalForFilterDay.toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg. Ticket</p>
                      <p className="font-bold text-slate-900">RF {Math.round(averageTicketForDay).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      name="paymentMethod"
                      value={posFilter.paymentMethod}
                      onChange={handlePosFilterChange}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    >
                      <option value="All">All Methods</option>
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">M-Pesa</option>
                      <option value="Bank Card">Card</option>
                    </select>
                    <input
                      name="date"
                      type="date"
                      value={posFilter.date}
                      onChange={handlePosFilterChange}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto scrollbar-thin">
                  <table className="min-w-[700px] w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Customer</th>
                        <th className="px-8 py-4">Payment</th>
                        <th className="px-8 py-4 text-right">Amount (RF)</th>
                        <th className="px-8 py-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600 text-sm">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                              <span className="font-bold text-[10px] uppercase text-emerald-600 tracking-tight">Verified</span>
                            </span>
                          </td>
                          <td className="px-8 py-4 font-bold text-slate-900">{sale.customer}</td>
                          <td className="px-8 py-4 text-xs font-bold uppercase">{sale.paymentMethod}</td>
                          <td className="px-8 py-4 text-right font-bold text-slate-900">
                            {sale.total.toLocaleString()}
                          </td>
                          <td className="px-8 py-4 text-xs font-bold text-slate-400">{sale.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">

              {/* Quick Registration */}
              <div className="rounded-3xl bg-indigo-600 p-8 text-white border border-indigo-700 shadow-lg shadow-indigo-100">
                <h3 className="text-xl font-bold mb-6">Quick Registration.</h3>
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <input
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-5 py-3 text-sm font-bold text-white placeholder-indigo-200 focus:bg-white/20 outline-none transition-all"
                    placeholder="Customer Full Name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  />
                  <input
                    className="w-full rounded-xl bg-white/10 border border-white/10 px-5 py-3 text-sm font-bold text-white placeholder-indigo-200 focus:bg-white/20 outline-none transition-all"
                    placeholder="Phone Number"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  />
                  <button className="w-full bg-white text-indigo-600 rounded-xl py-3 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Save Contact.
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <RevenueOverview />
              </div>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}