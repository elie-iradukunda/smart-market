import React, { useEffect, useState } from 'react';
import { fetchInventoryReport } from '@/api/apiClient';

export default function StockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchInventoryReport()
      .then((data) => {
        if (!isMounted) return;

        // Backend returns materials with stock_status
        const risky = (data || []).filter((m) => m.stock_status === 'low_stock' || m.stock_status === 'out_of_stock');
        setAlerts(risky);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load stock alerts');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Stock Alerts</h2>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
          {alerts.length} materials at risk
        </span>
      </div>
      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-3 text-[11px] text-gray-500">Loading stock alerts...</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.sku}
              className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                <p className="text-[11px] text-gray-600">SKU: {alert.sku}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-700">
                  On hand: <span className="font-semibold">{alert.current_stock}</span>
                </p>
                <p className="text-[11px] text-gray-700">
                  Reorder at: <span className="font-semibold">{alert.reorder_level}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
