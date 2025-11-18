import React from 'react';

export default function StockAlerts() {
  const alerts = [
    { sku: 'VINYL-3M-GLOSS', name: '3m Glossy Vinyl', onHand: 40, reorderPoint: 60 },
    { sku: 'INK-CMYK-1L', name: 'Solvent Ink CMYK 1L Set', onHand: 3, reorderPoint: 5 },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Stock Alerts</h2>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
          {alerts.length} materials at risk
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {alerts.map(alert => (
          <li
            key={alert.sku}
            className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{alert.name}</p>
              <p className="text-[11px] text-gray-600">SKU: {alert.sku}</p>
            </div>
            <div className="text-right text-[11px] text-gray-800">
              <p>
                On hand: <span className="font-semibold">{alert.onHand}</span>
              </p>
              <p>
                Reorder at: <span className="font-semibold">{alert.reorderPoint}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

