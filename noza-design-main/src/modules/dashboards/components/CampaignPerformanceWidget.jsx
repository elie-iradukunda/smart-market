import React, { useEffect, useState } from 'react';
import { fetchCampaigns } from '@/api/apiClient';

export default function CampaignPerformanceWidget() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchCampaigns()
      .then((data) => {
        if (!isMounted) return;
        setCampaigns(data || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load campaigns');
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
        <h2 className="text-base font-semibold text-gray-900">Campaign Performance</h2>
        <span className="text-[11px] text-gray-500">Active campaigns</span>
      </div>

      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-3 text-[11px] text-gray-500">Loading campaigns...</p>
      ) : (
        <div className="mt-4 space-y-3">
          {campaigns.map((cmp) => {
            const name = cmp.name;
            const channel = cmp.platform || cmp.channel;
            const roasLabel = '—';

            return (
              <div
                key={cmp.id || name}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{name}</p>
                  <p className="text-[11px] text-gray-600">{channel}</p>
                </div>
                <p className="text-xs font-semibold text-emerald-700">ROAS {roasLabel}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

