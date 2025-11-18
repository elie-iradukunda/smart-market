import React from 'react';

export default function CustomerDetailPage() {
  const customer = {
    name: 'Acme School',
    contactPerson: 'Mr. Daniel',
    phone: '+256 700 000111',
    email: 'bursar@acmeschool.ug',
    segment: 'Institution',
    lifetimeValue: 5400,
    lastOrder: 'ORD-23001',
    openBalance: 450,
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Customer</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{customer.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{customer.segment} • Key account</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Lifetime value</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${customer.lifetimeValue}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Open balance</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">${customer.openBalance}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Last order</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{customer.lastOrder}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr] items-start">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-base font-semibold text-gray-900">Profile</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Contact person</dt>
              <dd className="text-gray-900">{customer.contactPerson}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900">{customer.phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{customer.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Segment</dt>
              <dd className="text-gray-900">{customer.segment}</dd>
            </div>
          </dl>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 text-sm">
          <h2 className="text-base font-semibold text-gray-900">Account summary</h2>
          <p className="text-gray-700">
            Use this customer view to quickly see commercial value, recent orders, and any outstanding balances
            before you promise new jobs.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-gray-700">
            <li>Key contact details are always visible.</li>
            <li>Lifetime value helps prioritise support and discounts.</li>
            <li>Open balance highlights collection actions.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

