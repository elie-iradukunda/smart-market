// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMaterials } from '../../api/apiClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAuthUser, currentUserHasPermission } from '@/utils/apiClient';
import { Plus, Search, Package } from 'lucide-react';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const user = getAuthUser();
  const dashboardPrefix = user?.role_id === 1 ? 'admin' : 'staff';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchMaterials()
      .then((data) => {
        if (!isMounted) return;
        const materialsData = Array.isArray(data) ? data : [];
        setMaterials(materialsData);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching materials:', err);
        setError(err.message || 'Failed to load materials');
        setMaterials([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getStockColor = (qty) => {
    if (qty < 20) return 'text-red-700 font-bold bg-red-50 border border-red-200';
    if (qty < 50) return 'text-amber-700 font-bold bg-amber-50 border border-amber-200';
    return 'text-emerald-700 font-bold bg-emerald-50 border border-emerald-200';
  };

  const filtered = materials.filter((m) => {
    const term = (search || '').toLowerCase();
    if (!term) return true;
    return (
      (m.name || '').toLowerCase().includes(term) ||
      (m.category || '').toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans">
        <div className="mx-auto max-w-7xl space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Raw Materials
            </h1>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-500 focus:outline-none w-full md:w-64 transition-all"
                />
              </div>
              {currentUserHasPermission('material.create') && (
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/${dashboardPrefix}/inventory/materials/new`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
                >
                  <Plus size={18} />
                  New Material
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {error && (
              <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-700 font-bold">
                Error: {error}
              </div>
            )}

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
                <p className="mt-4 text-sm text-slate-500 font-bold">Loading Inventory...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Material Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Current Stock</th>
                      <th className="px-6 py-4">UoM</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 text-slate-400 font-mono text-xs font-bold">#{m.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                              <Package size={16} />
                            </div>
                            <span className="font-bold text-slate-900">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 text-slate-600 px-2.5 py-1 text-[10px] font-bold uppercase">
                            {m.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs uppercase tracking-tighter ${getStockColor(m.current_stock)}`}>
                            {m.current_stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-bold uppercase text-[10px]">{m.unit}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => navigate(`/dashboard/${dashboardPrefix}/inventory/materials/${m.id}`)}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 font-bold italic">
                          No materials found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}