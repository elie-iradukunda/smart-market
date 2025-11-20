import React from 'react';
import { fetchDemoWorkOrders } from '../../../api/apiClient';

export default function WorkOrdersKanban() {
  const workOrders = fetchDemoWorkOrders();
  const stages = ['Design', 'Pre-Press', 'Print', 'Finishing', 'QA', 'Ready', 'Delivered'];

  return (
    <div className="mt-4">
      <h2 className="text-lg font-medium">Active Work Orders</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {stages.map(stage => (
          <div key={stage} className="rounded border border-gray-200 bg-gray-50">
            <div className="border-b border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700">
              {stage}
            </div>
            <div className="p-2 space-y-2">
              {workOrders
                .filter(wo => wo.stage === stage)
                .map(wo => (
                  <div key={wo.id} className="rounded border border-gray-200 bg-white p-2 text-[11px]">
                    <p className="font-semibold text-gray-800">{wo.jobName}</p>
                    <p className="text-gray-600">Order: {wo.orderId}</p>
                    <p className="text-gray-600">Tech: {wo.technician}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

