import React from 'react';

export default function WorkOrderDetailPage() {
  const workOrder = {
    id: 'WO-501',
    orderId: 'ORD-23001',
    jobName: 'School Opening Banners',
    stage: 'Print',
    technician: 'Joseph',
    estimatedHours: 6,
    hoursLogged: 2.5,
  };

  const progress = Math.round((workOrder.hoursLogged / workOrder.estimatedHours) * 100);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Work order</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{workOrder.id}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {workOrder.jobName} • Order {workOrder.orderId}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Stage</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{workOrder.stage}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Technician</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{workOrder.technician}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Estimated hours</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{workOrder.estimatedHours}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Logged hours</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{workOrder.hoursLogged}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 text-sm">
        <h2 className="text-base font-semibold text-gray-900">Time tracking</h2>
        <p className="text-gray-700">
          Logged {workOrder.hoursLogged} / {workOrder.estimatedHours} hours ({progress}%).
        </p>
        <div className="h-3 w-full overflow-hidden rounded bg-gray-200">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          Encourage technicians to log time at each stage so you can measure true job profitability and team load.
        </p>
      </section>
    </div>
  );
}

