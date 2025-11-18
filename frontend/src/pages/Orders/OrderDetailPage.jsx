import React from 'react';

export default function OrderDetailPage() {
  const order = {
    id: 'ORD-23001',
    customer: 'Acme School',
    jobName: 'Opening Ceremony Banners',
    status: 'In Production',
    eta: '2025-11-25',
    depositPaid: 225,
    balanceDue: 225,
    currentStage: 'Print',
  };

  const stages = ['Design', 'Pre-Press', 'Print', 'Finishing', 'QA', 'Ready', 'Delivered'];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Order</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{order.id}</h1>
          <p className="mt-2 text-sm text-gray-600">{order.customer} • {order.jobName}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{order.status}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">ETA</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{order.eta}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Deposit paid</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${order.depositPaid}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Balance due</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${order.balanceDue}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-start">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 text-sm">
          <h2 className="text-base font-semibold text-gray-900">Production timeline</h2>
          <div className="flex flex-wrap gap-2">
            {stages.map(stage => {
              const isCurrent = stage === order.currentStage;
              const isPassed = stages.indexOf(stage) < stages.indexOf(order.currentStage);
              return (
                <div
                  key={stage}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : isPassed
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-sm">
          <h2 className="text-base font-semibold text-gray-900">Job notes</h2>
          <p className="mt-2 text-gray-700">
            Confirm final banner sizes and finishing (eyelets, pockets) with the customer before sending to print.
            Ensure colour profile is set correctly for the large format printer.
          </p>
        </section>
      </div>
    </div>
  );
}

