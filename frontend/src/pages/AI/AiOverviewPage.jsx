import React from 'react';
import { fetchDemoAiInsights } from '../../api/apiClient';
import DemandForecastChart from '../../modules/ai/components/DemandForecastChart';
import PriceRecommendationWidget from '../../modules/ai/components/PriceRecommendationWidget';
import ReorderSuggestionList from '../../modules/ai/components/ReorderSuggestionList';

export default function AiOverviewPage() {
  const insights = fetchDemoAiInsights();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">AI &amp; analytics</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Overview</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Demand forecasts, price recommendations, and predictive stock suggestions for TOP Design. Use these
          insights to make better decisions.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <DemandForecastChart data={insights.demandForecast} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <PriceRecommendationWidget data={insights.priceRecommendations} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <ReorderSuggestionList />
      </div>
    </div>
  );
}

