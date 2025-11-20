import React, { useEffect, useState } from 'react';
import { fetchProductionReport } from '@/api/apiClient';

export default function JobPipelineOverview() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProductionReport()
      .then((data) => {
        if (!isMounted) return;

        // Backend returns rows like { status, count }
        const mapped = (data || []).map((row) => ({
          name: row.status || 'Unknown',
          count: row.count || 0,
        }));

        setStages(mapped);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load job pipeline');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Job Pipeline</h2>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
          {stages.reduce((sum, s) => sum + s.count, 0)} active jobs
        </span>
      </div>
      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-3 text-[11px] text-gray-500">Loading job pipeline...</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {stages.map((stage) => (
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
      )}
    </div>
  );
}

