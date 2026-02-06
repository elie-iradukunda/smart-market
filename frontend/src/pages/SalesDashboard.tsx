// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPOSSales, createCustomer, createPOSSale, fetchCustomers, fetchMaterials } from '@/api/apiClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RevenueOverview from '../modules/dashboards/components/RevenueOverview';
import {
  User, Calendar, CreditCard, Download, AlertTriangle, Loader, Package,
  TrendingUp, Users, FileText, MessageSquare, Target, ArrowRight,
  DollarSign, ShoppingCart, Zap, BarChart3, Plus, Search
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

  const [posForm, setPosForm] = useState({
    customer_id: '',
  });
  const [posItems, setPosItems] = useState(
    Array.from({ length: 5 }).map(() => ({ material_id: '', quantity: '1', price: '' }))
  );
  const [posStatus, setPosStatus] = useState<string | null>(null);
  const [posSubmitError, setPosSubmitError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
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
        const [cust, mats] = await Promise.all([fetchCustomers(), fetchMaterials()]);
        if (!mounted) return;
        setCustomers(cust || []);
        setMaterials(mats || []);
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

  const handlePosSubmit = async (e) => {
    e.preventDefault();
    setPosStatus(null);
    setPosSubmitError(null);
    try {
      setIsSubmitting(true);
      const activeItems = posItems
        .map((row) => ({
          material_id: row.material_id,
          quantity: Number(row.quantity || '0'),
          price: Number(row.price || '0'),
        }))
        .filter((row) => row.material_id && row.quantity > 0 && row.price >= 0);

      if (activeItems.length === 0) {
        throw new Error('Please add at least one line item.');
      }

      const total = activeItems.reduce((acc, row) => acc + row.quantity * row.price, 0);
      const payload = {
        customer_id: posForm.customer_id ? Number(posForm.customer_id) : undefined,
        total,
        items: activeItems.map((row) => ({
          item_id: Number(row.material_id),
          quantity: row.quantity,
          price: row.price,
        })),
      };
      const res = await createPOSSale(payload);
      setPosStatus(`Sale recorded successfully!`);
      setPosForm({ customer_id: '' });
      setPosItems(Array.from({ length: 5 }).map(() => ({ material_id: '', quantity: '1', price: '' })));
    } catch (err: any) {
      setPosSubmitError(err.message || 'Failed to record POS sale.');
    } finally {
      setIsSubmitting(false);
    }
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
                <Link to="/crm/leads" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Manage Leads</Link>
                <Link to="/crm/quotes" className="bg-white text-slate-900 border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">New Quote</Link>
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
                  { label: 'Capture Lead', icon: Target, path: '/crm/leads', color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Draft Quote', icon: FileText, path: '/crm/quotes', color: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Marketing', icon: Zap, path: '/marketing/campaigns', color: 'bg-amber-600', text: 'text-amber-600', bg: 'bg-amber-50' },
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

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
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

              {/* Express Checkout */}
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Express Checkout.</h3>
                </div>
                <form onSubmit={handlePosSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                      className="w-full rounded-xl bg-slate-50 border border-slate-100 pl-12 py-3 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 transition-all outline-none appearance-none"
                      value={posForm.customer_id}
                      onChange={(e) => setPosForm({ ...posForm, customer_id: e.target.value })}
                    >
                      <option value="">Walk-in Customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.name || `Customer ${c.id}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {posItems.map((row, index) => (
                      <div key={index} className="flex gap-2">
                        <select
                          className="flex-1 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                          value={row.material_id}
                          onChange={(e) => {
                            const next = [...posItems];
                            next[index].material_id = e.target.value;
                            setPosItems(next);
                          }}
                        >
                          <option value="">Item...</option>
                          {materials.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Price"
                          className="w-20 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs font-bold text-center focus:ring-1 focus:ring-indigo-500"
                          value={row.price}
                          onChange={(e) => {
                            const next = [...posItems];
                            next[index].price = e.target.value;
                            setPosItems(next);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Generate Receipt.
                  </button>
                </form>
              </div>

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