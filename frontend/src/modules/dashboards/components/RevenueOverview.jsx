import React, { useEffect, useState } from 'react';
import { fetchFinancialOverview } from '@/api/apiClient';

export default function RevenueOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchFinancialOverview()
      .then((res) => {
        if (!isMounted) return;
        setData(res);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load revenue overview');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Backend may return DECIMAL fields as strings; coerce to numbers safely
  const totalRevenue = Number(data?.total_revenue) || 0;
  const outstanding = Number(data?.outstanding_amount) || 0;
  const collected = Math.max(totalRevenue - outstanding, 0);

  const metrics = [
    { label: 'Total Revenue (30 days)', value: `$${totalRevenue.toFixed(2)}`, trend: '' },
    { label: 'Outstanding Invoices', value: `$${outstanding.toFixed(2)}`, trend: '' },
    { label: 'Net Collected', value: `$${collected.toFixed(2)}`, trend: '' },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Revenue Overview</h2>
        <span className="text-[11px] text-gray-500">Last 30 days</span>
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      )}
      {loading ? (
        <p className="mt-4 text-xs text-gray-500">Loading financial data...</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {metrics.map(m => (
            <div key={m.label} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{m.label}</p>
              <p className="mt-2 text-xl font-semibold text-gray-900">{m.value}</p>
              {m.trend && (
                <p className="mt-1 text-[11px] font-medium text-emerald-600">{m.trend}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

