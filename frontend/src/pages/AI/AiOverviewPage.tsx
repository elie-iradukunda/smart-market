// @ts-nocheck
import React, { useEffect, useState } from 'react'

import { Zap, TrendingUp, DollarSign, Package, Users, Activity, Loader, AlertTriangle, BarChart2, ShieldAlert, Target } from 'lucide-react'

// --- IMPORTANT: DO NOT REMOVE / EXTERNAL API IMPORTS ---
// These are assumed to be implemented in your project and are necessary for the component to function.
import { fetchDemandPredictions, fetchReorderSuggestions, fetchPricingPredictions, fetchCustomerInsights, fetchChurnPredictions, fetchSegmentPredictions } from '../../api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'

import DemandForecastChart from '../../modules/ai/components/DemandForecastChart'
import PriceRecommendationWidget from '../../modules/ai/components/PriceRecommendationWidget'
import ReorderSuggestionList from '../../modules/ai/components/ReorderSuggestionList'
// --------------------------------------------------------

// Helper Component for Loading/Error States
const StateFeedback = ({ loading, error, children }) => {
    if (error) {
        return (
            <div role="alert" className="p-6 text-red-700 bg-red-50 border border-red-300 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 mr-3" aria-hidden="true" />
                <p className="text-sm font-medium">Data Loading Error: {error}</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div role="status" className="p-8 flex flex-col items-center justify-center">
                <Loader className="h-6 w-6 text-blue-500 animate-spin" aria-hidden="true" />
                <p className="text-sm text-gray-500 mt-2">Fetching predictive insights...</p>
            </div>
        )
    }

    return children;
}

const InsightCard = ({ title, icon: Icon, children, theme = 'default' }) => {
    let baseStyles = "rounded-xl p-5 border shadow-sm";
    let titleStyles = "text-md font-semibold mb-3 flex items-center";
    let iconColor = "text-gray-500";

    if (theme === 'blue') {
        baseStyles = "rounded-xl p-5 border border-blue-200 bg-blue-50/50 shadow-md";
        titleStyles = "text-md font-semibold mb-3 flex items-center text-blue-700";
        iconColor = "text-blue-500";
    } else if (theme === 'purple') {
        baseStyles = "rounded-xl p-5 border border-purple-200 bg-purple-50/50 shadow-md";
        titleStyles = "text-md font-semibold mb-3 flex items-center text-purple-700";
        iconColor = "text-purple-500";
    }

    return (
        <div className={baseStyles}>
            <h3 className={titleStyles}>
                <Icon className={`h-5 w-5 mr-2 ${iconColor}`} aria-hidden="true" />
                {title}
            </h3>
            {children}
        </div>
    );
};

export default function AiOverviewPage() {
    const [demandData, setDemandData] = useState([])
    const [reorderData, setReorderData] = useState([])
    const [priceData, setPriceData] = useState([])
    const [customerInsights, setCustomerInsights] = useState([])
    const [churnData, setChurnData] = useState([])
    const [segmentData, setSegmentData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setError(null)

        Promise.all([
            fetchDemandPredictions(),
            fetchReorderSuggestions(),
            fetchPricingPredictions(),
            fetchCustomerInsights(),
            fetchChurnPredictions(),
            fetchSegmentPredictions(),
        ])
            .then(([predictions, reorder, pricing, insights, churn, segments]) => {
                if (!isMounted) return

                const safePredictions = Array.isArray(predictions)
                    ? predictions
                    : Array.isArray(predictions?.predictions)
                        ? predictions.predictions
                        : Array.isArray(predictions?.data)
                            ? predictions.data
                            : []

                const safeReorder = Array.isArray(reorder)
                    ? reorder
                    : Array.isArray(reorder?.inventory_analysis)
                        ? reorder.inventory_analysis
                        : Array.isArray(reorder?.data)
                            ? reorder.data
                            : []

                const safePricing = Array.isArray(pricing)
                    ? pricing
                    : Array.isArray(pricing?.pricing_analysis)
                        ? pricing.pricing_analysis
                        : Array.isArray(pricing?.data)
                            ? pricing.data
                            : []

                const safeInsights = Array.isArray(insights)
                    ? insights
                    : Array.isArray(insights?.customer_segments)
                        ? insights.customer_segments
                        : Array.isArray(insights?.data)
                            ? insights.data
                            : []

                const safeChurn = Array.isArray(churn)
                    ? churn
                    : Array.isArray(churn?.churn_analysis)
                        ? churn.churn_analysis
                        : Array.isArray(churn?.data)
                            ? churn.data
                            : []

                const safeSegments = Array.isArray(segments)
                    ? segments
                    : Array.isArray(segments?.customer_segments)
                        ? segments.customer_segments
                        : Array.isArray(segments?.data)
                            ? segments.data
                            : []

                const mappedDemand = safePredictions.map(p => ({
                    category: p.material_name || p.category || 'Item',
                    month: 'Next 30 days',
                    expectedJobs: Number(p.predicted_demand ?? p.predicted_value ?? 0),
                }))

                const mappedReorder = safeReorder.map(r => ({
                    item: r.material_name || r.material_id || 'Item',
                    priority: typeof r.days_until_reorder === 'number'
                        ? (r.days_until_reorder <= 0 ? 'Reorder now' : `${r.days_until_reorder} days`)
                        : (r.priority || r.reorder_status || 'Monitor'),
                }))

                const mappedPricing = safePricing.map(p => ({
                    item: p.item || `Price range ${p.target_id ?? p.price_range ?? ''}`.trim(),
                    currentPrice: Number(p.currentPrice ?? p.price_range ?? p.target_id ?? 0),
                    suggestedPrice: Number(p.suggestedPrice ?? p.avg_price ?? p.predicted_value ?? 0),
                    reason: p.reason || `Acceptance ${((Number(p.acceptance_rate ?? p.confidence ?? 0)) * 100).toFixed(0)}%`,
                }))

                const mappedInsights = safeInsights.map(c => ({
                    id: c.customer_id,
                    name: c.customer_name,
                    total_orders: c.frequency ?? c.total_orders ?? 0,
                    total_spent: c.monetary ?? c.total_spent ?? 0,
                }))

                const mappedChurn = safeChurn.map(c => ({
                    ...c,
                    predicted_value: (typeof c.churn_probability === 'number'
                        ? c.churn_probability
                        : (Number(c.predicted_value) || 0) / 100),
                }))

                const mappedSegments = (safeSegments.length ? safeSegments : safeInsights).map(s => ({
                    ...s,
                    predicted_value: s.segment || s.predicted_value,
                }))

                setDemandData(mappedDemand)
                setReorderData(mappedReorder)
                setPriceData(mappedPricing)
                setCustomerInsights(mappedInsights)
                setChurnData(mappedChurn)
                setSegmentData(mappedSegments)

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
    // --- END API LOGIC PRESERVED ---

    return (
        <DashboardLayout>
            {/* Blue/Purple light gradient background */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-3 sm:px-4 md:px-6 lg:px-8 py-8 font-sans">
                <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADER CARD - Strong Blue Theme */}
                <div className="rounded-3xl border border-blue-200 bg-white/95 backdrop-blur-xl p-8 shadow-2xl shadow-blue-300/50">
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-blue-500" aria-hidden="true" />
                        AI & Business Intelligence
                    </p>
                    <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                        Predictive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Insights</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-600 max-w-xl">
                        Harness the power of machine learning for demand forecasting, price optimization, and smart inventory management.
                    </p>
                    {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>}
                </div>

                {/* Main Content Grid */}
                <div className="mt-8 grid gap-6 lg:grid-cols-3 items-stretch">

                    {/* DEMAND FORECAST CHART - Primary Visualization (2/3 width) */}
                    <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <BarChart2 className="h-5 w-5 mr-2 text-blue-500" aria-hidden="true" />
                            Job Demand Forecast
                        </h2>
                        <StateFeedback loading={loading} error={error}>
                            <DemandForecastChart data={demandData} />
                            <p className="mt-4 text-xs text-gray-500">
                                Projected job volume over the next three months, categorized by service type.
                            </p>
                        </StateFeedback>
                    </div>

                    {/* PRICE RECOMMENDATIONS WIDGET (1/3 width) */}
                    <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-purple-500" aria-hidden="true" />
                            Dynamic Pricing
                        </h2>
                        <StateFeedback loading={loading} error={error}>
                            <PriceRecommendationWidget data={priceData} />
                            <p className="mt-4 text-xs text-gray-500 text-center">
                                Suggested prices based on market competition and historical acceptance rates.
                            </p>
                        </StateFeedback>
                    </div>

                </div>

                {/* REORDER SUGGESTIONS AND CUSTOMER INSIGHTS - Full Width Section */}
                <div className="mt-8 rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-8">
                    
                    {/* Reorder Suggestions */}
                    <div className="border-b border-gray-100 pb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Package className="h-5 w-5 mr-2 text-green-500" aria-hidden="true" />
                            Predictive Reorder Suggestions
                        </h2>
                        <StateFeedback loading={loading} error={error}>
                            <ReorderSuggestionList data={reorderData} />
                        </StateFeedback>
                    </div>

                    {/* Customer Predictions Grid */}
                    <div className="grid gap-6 md:grid-cols-3">
                        
                        {/* Top Customers (AI Insights) */}
                        <InsightCard title="Top Customer Value" icon={Users} theme="blue">
                            <StateFeedback loading={loading} error={error}>
                                <ul className="space-y-3 text-sm text-gray-700">
                                    {(customerInsights || []).slice(0, 5).map((c, index) => (
                                        <li key={c.id || index} className="flex justify-between items-center p-2 rounded-lg bg-white hover:bg-blue-50 transition duration-150 border border-blue-100">
                                            <span className="font-medium truncate">{c.name || `Customer ${index + 1}`}</span>
                                            <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
                                                {c.total_orders} orders · ${Math.round(Number(c.total_spent) || 0).toLocaleString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </StateFeedback>
                        </InsightCard>

                        {/* Churn Risk (Top 5) */}
                        <InsightCard title="High Churn Risk" icon={ShieldAlert} theme="purple">
                            <StateFeedback loading={loading} error={error}>
                                <ul className="space-y-3 text-sm text-gray-700">
                                    {(churnData || []).slice(0, 5).map((c, index) => (
                                        <li key={c.id || index} className="flex justify-between items-center p-2 rounded-lg bg-white hover:bg-purple-50 transition duration-150 border border-purple-100">
                                            <span className="font-medium truncate">{c.customer_name || c.name || `User ${index + 1}`}</span>
                                            <span className={`text-xs font-semibold flex-shrink-0 ${((Number(c.predicted_value) || 0) * 100) > 50 ? 'text-red-600' : 'text-purple-600'}`}>
                                                {Math.min(99, (Number(c.predicted_value) * 100).toFixed(0))}% risk
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </StateFeedback>
                        </InsightCard>

                        {/* Customer Segments */}
                        <InsightCard title="Key Customer Segments" icon={Target} theme="default">
                            <StateFeedback loading={loading} error={error}>
                                <ul className="space-y-3 text-sm text-gray-700">
                                    {(segmentData || []).slice(0, 5).map((s, index) => (
                                        <li key={s.id || index} className="flex justify-between items-center p-2 rounded-lg bg-white hover:bg-gray-50 transition duration-150 border border-gray-100">
                                            <span className="font-medium truncate">{s.customer_name || s.name || `User ${index + 1}`}</span>
                                            <span className="text-xs font-semibold text-gray-600 flex-shrink-0">
                                                Segment {s.predicted_value}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </StateFeedback>
                        </InsightCard>

                    </div>

                </div>

                </div>
            </div>
        </DashboardLayout>
    )
}