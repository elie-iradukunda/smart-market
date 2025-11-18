import React from 'react';

export default function SlaBadge({ status }) {
  let classes = 'bg-gray-100 text-gray-700';
  if (status === 'On Track') classes = 'bg-emerald-50 text-emerald-700';
  if (status === 'At Risk') classes = 'bg-amber-50 text-amber-700';
  if (status === 'Breached') classes = 'bg-red-50 text-red-700';

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
}

