import React from 'react';

export default function OrderTimeline() {
  const stages = ['Design', 'Pre-Press', 'Print', 'Finishing', 'QA', 'Ready', 'Delivered'];
  const currentStage = 'Print';

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium">Production Timeline</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        {stages.map(stage => {
          const reached = stages.indexOf(stage) <= stages.indexOf(currentStage);
          return (
            <div
              key={stage}
              className={
                'flex items-center gap-1 rounded-full border px-3 py-1 ' +
                (reached
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-gray-50 text-gray-500')
              }
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>{stage}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

