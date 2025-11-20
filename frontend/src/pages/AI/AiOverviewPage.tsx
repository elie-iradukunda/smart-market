// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchDemandPredictions, fetchReorderSuggestions, fetchDemoAiInsights } from '../../api/apiClient'
import DemandForecastChart from '../../modules/ai/components/DemandForecastChart'
import PriceRecommendationWidget from '../../modules/ai/components/PriceRecommendationWidget'
import ReorderSuggestionList from '../../modules/ai/components/ReorderSuggestionList'

export default function AiOverviewPage() {
  const [demandData, setDemandData] = useState([])
  const [reorderData, setReorderData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Until there is a backend endpoint for price recommendations, keep them from demo helper
  const demoInsights = fetchDemoAiInsights()
  const priceRecommendations = demoInsights.priceRecommendations || []

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([fetchDemandPredictions(), fetchReorderSuggestions()])
      .then(([predictions, reorder]) => {
        if (!isMounted) return

        const mappedDemand = (predictions || []).map(p => ({
          category: p.target_id || p.type || 'Item',
          month: (p.created_at || '').slice(0, 10),
          expectedJobs: Number(p.predicted_value) || 0,
        }))

        setDemandData(mappedDemand)
        setReorderData(reorder || [])
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load AI insights')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">AI &amp; Business Intelligence</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Predictive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Insights</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          Demand forecasts, price recommendations, and predictive stock suggestions for TOP Design. Use these
          insights to make better operational and commercial decisions.
        </p>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        
        {/* Demand Forecast Chart - Larger section for the main visualization */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Demand Forecast</h2>
          {loading ? (
            <p className="text-sm text-gray-500 py-6">Loading demand forecast...</p>
          ) : (
            <DemandForecastChart data={demandData} />
          )}
        </div>
        
        {/* Price Recommendations Widget */}
        <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Recommendations</h2>
          <PriceRecommendationWidget data={priceRecommendations} />
        </div>

      </div>

      {/* Reorder Suggestions List - Full width at the bottom */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2 text-xl text-green-600">📦</span> Predictive Reorder Suggestions
        </h2>
        {loading ? (
          <p className="text-sm text-gray-500 py-6">Loading reorder suggestions...</p>
        ) : (
          <ReorderSuggestionList data={reorderData} />
        )}
      </div>
    </div>
  )
}