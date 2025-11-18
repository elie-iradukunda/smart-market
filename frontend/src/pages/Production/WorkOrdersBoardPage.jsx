import React from 'react';
import { fetchDemoWorkOrders } from '../../api/apiClient';

export default function WorkOrdersBoardPage() {
  const workOrders = fetchDemoWorkOrders();
  const stages = ['Design', 'Pre-Press', 'Print', 'Finishing', 'QA', 'Ready', 'Delivered'];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Production</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Work orders board</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Visual Kanban of active jobs for the production team. Drag-and-drop can be added later; this view gives a
          clear sense of load per stage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {stages.map(stage => (
          <div key={stage} className="rounded-2xl border border-gray-200 bg-gray-50 shadow-sm flex flex-col max-h-[520px]">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800">
              <span>{stage}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                {workOrders.filter(wo => wo.stage === stage).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {workOrders
                .filter(wo => wo.stage === stage)
                .map(wo => (
                  <div key={wo.id} className="rounded-lg border border-gray-200 bg-white p-2 text-xs">
                    <p className="font-semibold text-gray-800">{wo.jobName}</p>
                    <p className="text-gray-600">Order: {wo.orderId}</p>
                    <p className="text-gray-600">Tech: {wo.technician}</p>
                    <p className="text-[11px] text-gray-500">SLA: {wo.sla}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

