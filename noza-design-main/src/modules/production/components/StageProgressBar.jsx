import React from 'react';

export default function StageProgressBar({ currentStage }) {
  const stages = ['Design', 'Pre-Press', 'Print', 'Finishing', 'QA', 'Ready', 'Delivered'];
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-gray-600">
      {stages.map((stage, index) => {
        const reached = index <= currentIndex;
        return (
          <div key={stage} className="flex flex-1 items-center gap-1">
            <div
              className={
                'h-1 flex-1 rounded-full ' +
                (reached ? 'bg-green-500' : 'bg-gray-200')
              }
            />
            <span className={reached ? 'text-green-700' : ''}>{stage}</span>
          </div>
        );
      })}
    </div>
  );
}

