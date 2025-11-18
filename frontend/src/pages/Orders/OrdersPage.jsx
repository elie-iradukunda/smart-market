import React from 'react';
import { fetchDemoOrders } from '../../api/apiClient';

export default function OrdersPage() {
  const orders = fetchDemoOrders();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Orders</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Live jobs</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          All confirmed jobs coming from CRM, ready for production, delivery, and invoicing.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Jobs in progress</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{orders.length}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Due today</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">3</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-600">Ready for invoicing</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">2</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Orders</p>
          <select className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option>All statuses</option>
            <option>In Production</option>
            <option>Ready</option>
            <option>Delivered</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Order</th>
                <th className="px-3 py-2 font-medium text-gray-700">Customer</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
                <th className="px-3 py-2 font-medium text-gray-700">Status</th>
                <th className="px-3 py-2 font-medium text-gray-700">ETA</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{order.id}</td>
                  <td className="px-3 py-2 text-gray-800">{order.customer}</td>
                  <td className="px-3 py-2 text-right text-gray-800">${order.total}</td>
                  <td className="px-3 py-2 text-gray-800">{order.status}</td>
                  <td className="px-3 py-2 text-gray-800">{order.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

