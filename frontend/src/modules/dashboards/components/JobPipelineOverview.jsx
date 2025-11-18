import React from 'react';

export default function JobPipelineOverview() {
  const stages = [
    { name: 'Design', count: 3 },
    { name: 'Pre-Press', count: 2 },
    { name: 'Print', count: 4 },
    { name: 'Finishing', count: 1 },
    { name: 'QA', count: 1 },
    { name: 'Ready', count: 2 },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Job Pipeline</h2>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
          {stages.reduce((sum, s) => sum + s.count, 0)} active jobs
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {stages.map(stage => (
          <div
            key={stage.name}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5"
          >
            <span className="text-xs font-medium text-gray-800">{stage.name}</span>
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
              {stage.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

