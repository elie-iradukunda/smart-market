import pool from '../config/database.js';
import { 
  getSimplifiedDemandForecast, 
  getSimplifiedCustomerSegmentation, 
  getSimplifiedChurnPrediction, 
  getSimplifiedInventoryOptimization 
} from '../services/simplifiedAiService.js';
import { 
  generateBusinessRecommendations, 
  generatePricingRecommendations, 
  generateProductionOptimization, 
  generateMarketingInsights 
} from '../services/geminiService.js';

export const getDemandPredictions = async (req, res) => {
  try {
    // Get simplified analysis
    const demandData = await getSimplifiedDemandForecast();
    
    // Generate AI recommendations
    const recommendations = await generateBusinessRecommendations(demandData.slice(0, 10), 'demand');
    
    res.json({
      predictions: demandData,
      ai_recommendations: recommendations,
      generated_at: new Date().toISOString(),
      powered_by: 'Gemini AI'
    });
  } catch (error) {
    console.error('Demand predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch demand predictions' });
  }
};

export const getReorderSuggestions = async (req, res) => {
  try {
    // Get simplified inventory optimization
    const inventoryData = await getSimplifiedInventoryOptimization();
    
    // Generate AI recommendations
    const recommendations = await generateBusinessRecommendations(inventoryData.slice(0, 10), 'inventory');
    
    res.json({
      inventory_analysis: inventoryData,
      ai_recommendations: recommendations,
      generated_at: new Date().toISOString(),
      powered_by: 'Gemini AI'
    });
  } catch (error) {
    console.error('Reorder suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch reorder suggestions' });
  }
};

export const getCustomerInsights = async (req, res) => {
  try {
    // Get simplified customer segmentation
    const segmentationData = await getSimplifiedCustomerSegmentation();
    
    // Generate AI recommendations
    const recommendations = await generateBusinessRecommendations(segmentationData.slice(0, 15), 'customer');
    
    res.json({
      customer_segments: segmentationData,
      ai_recommendations: recommendations,
      generated_at: new Date().toISOString(),
      powered_by: 'Gemini AI'
    });
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
};

export const getChurnPredictions = async (req, res) => {
  try {
    // Get simplified churn analysis
    const churnData = await getSimplifiedChurnPrediction();
    
    // Generate AI recommendations
    const recommendations = await generateBusinessRecommendations(churnData.slice(0, 10), 'churn');
    
    res.json({
      churn_analysis: churnData,
      ai_recommendations: recommendations,
      generated_at: new Date().toISOString(),
      powered_by: 'Gemini AI'
    });
  } catch (error) {
    console.error('Churn predictions error:', error);
    res.status(500).json({ error: 'Failed to fetch churn predictions' });
  }
};

export const getPricingRecommendations = async (req, res) => {
  try {
    // Get historical pricing data
    const [historicalData] = await pool.execute(`
      SELECT 
        FLOOR(unit_price / 10) * 10 as price_range,
        COUNT(*) as quote_count,
        AVG(CASE WHEN q.status = 'approved' THEN 1 ELSE 0 END) as acceptance_rate,
        AVG(unit_price) as avg_price,
        SUM(total) as total_revenue
      FROM quote_items qi
      JOIN quotes q ON qi.quote_id = q.id
      WHERE q.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY price_range
      HAVING quote_count >= 5
      ORDER BY price_range
    `);
    
    const marketData = {
      total_quotes: historicalData.reduce((sum, item) => sum + item.quote_count, 0),
      avg_acceptance_rate: historicalData.reduce((sum, item) => sum + item.acceptance_rate, 0) / historicalData.length,
      price_ranges: historicalData.length
    };
    
    // Generate AI pricing recommendations
    const recommendations = await generatePricingRecommendations(historicalData, marketData);
    
    res.json({
      pricing_analysis: historicalData,
      market_summary: marketData,
      ai_recommendations: recommendations,
      generated_at: new Date().toISOString(),
      powered_by: 'Gemini AI'
    });
  } catch (error) {
    console.error('Pricing recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate pricing recommendations' });
  }
};

export const getProductionOptimization = async (req, res) => {
  try {
    // Get production workflow data
    const [workflowData] = await pool.execute(`
      SELECT 
        wo.stage,
        COUNT(*) as total_orders,
        AVG(TIMESTAMPDIFF(HOUR, wo.started_at, wo.ended_at)) as avg_duration_hours,
        COUNT(CASE WHEN wo.ended_at IS NULL THEN 1 END) as pending_orders
      FROM work_orders wo
      WHERE wo.started_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY wo.stage
    `);
    
    // Get resource utilization data
    const [resourceData] = await pool.execute(`
      SELECT 
        u.name as technician_name,
        COUNT(wl.id) as total_logs,
        SUM(wl.time_spent_minutes) as total_minutes,
        AVG(wl.time_spent_minutes) as avg_time_per_task
      FROM work_logs wl
      JOIN users u ON wl.technician_id = u.id
      WHERE wl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY u.id, u.name
      ORDER BY total_minutes DESC
    `);
    
    // Generate AI optimization recommendations
    const recommendations = await generateProductionOptimization(workflowData, resourceData);
    
    res.json({
      workflow_analysis: workflowData,
      resource_utilization: resourceData,
      ai_recommendations: recommendations,
      generated_at: new Date().toISOString(),
      powered_by: 'Gemini AI'
    });
  } catch (error) {
    console.error('Production optimization error:', error);
    res.status(500).json({ error: 'Failed to generate production optimization' });
  }
};

export const getMarketingInsights = async (req, res) => {
  try {
    // Get campaign performance data
    const [campaignData] = await pool.execute(`
      SELECT 
        c.name as campaign_name,
        c.platform,
        c.budget,
        c.status,
        COALESCE(SUM(ap.impressions), 0) as total_impressions,
        COALESCE(SUM(ap.clicks), 0) as total_clicks,
        COALESCE(SUM(ap.conversions), 0) as total_conversions,
        COALESCE(SUM(ap.cost_spent), 0) as total_cost,
        CASE WHEN SUM(ap.impressions) > 0 THEN SUM(ap.clicks) / SUM(ap.impressions) * 100 ELSE 0 END as ctr,
        CASE WHEN SUM(ap.clicks) > 0 THEN SUM(ap.conversions) / SUM(ap.clicks) * 100 ELSE 0 END as conversion_rate
      FROM campaigns c
      LEFT JOIN ad_performance ap ON c.id = ap.campaign_id
      WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY c.id, c.name, c.platform, c.budget, c.status
    `);
    
    // Get customer acquisition data
    const [customerData] = await pool.execute(`
      SELECT 
        source,
        COUNT(*) as customer_count,
        AVG(total_orders) as avg_orders_per_customer,
        AVG(total_spent) as avg_lifetime_value
      FROM (
        SELECT 
          c.source,
          c.id,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(q.total_amount), 0) as total_spent
        FROM customers c
        LEFT JOIN orders o ON c.id = o.customer_id
        LEFT JOIN quotes q ON o.quote_id = q.id
        GROUP BY c.id, c.source
      ) customer_metrics
      GROUP BY source
    `);
    
    // Generate AI marketing recommendations
    const recommendations = await generateMarketingInsights(campaignData, customerData);
    
    res.json({
      campaign_performance: campaignData,
      customer_acquisition: customerData,
      ai_recommendations: recommendations,
      generated_at: new Date().toISOString(),
      powered_by: 'Gemini AI'
    });
  } catch (error) {
    console.error('Marketing insights error:', error);
    res.status(500).json({ error: 'Failed to generate marketing insights' });
  }
};

// Generate all AI insights using simplified service
export const runAllPredictions = async (req, res) => {
  try {
    console.log('Generating AI insights with Gemini...');
    
    // Generate all predictions using simplified service + Gemini
    const [demandData, inventoryData, customerData, churnData] = await Promise.all([
      getSimplifiedDemandForecast(),
      getSimplifiedInventoryOptimization(), 
      getSimplifiedCustomerSegmentation(),
      getSimplifiedChurnPrediction()
    ]);
    
    // Store results in local database for quick access
    await storePredictions('demand', demandData);
    await storePredictions('inventory', inventoryData);
    await storePredictions('segment', customerData);
    await storePredictions('churn', churnData);
    
    if (res) {
      res.json({ 
        message: 'AI predictions generated successfully using Gemini AI',
        data_points: {
          demand_forecasts: demandData.length,
          inventory_items: inventoryData.length,
          customer_segments: customerData.length,
          churn_predictions: churnData.length
        },
        powered_by: 'Gemini AI',
        generated_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('AI prediction generation failed:', error);
    if (res) {
      res.status(500).json({ error: 'AI prediction generation failed' });
    }
  }
};

const storePredictions = async (type, data) => {
  try {
    // Clear old predictions
    await pool.execute('DELETE FROM ai_predictions WHERE type = ?', [type]);
    
    // Store new predictions
    for (const item of data.slice(0, 50)) { // Limit to 50 items
      let targetId, predictedValue, confidence;
      
      switch (type) {
        case 'demand':
          targetId = item.material_id;
          predictedValue = item.predicted_demand;
          confidence = item.confidence;
          break;
        case 'inventory':
          targetId = item.material_id;
          predictedValue = item.days_until_reorder;
          confidence = 0.8;
          break;
        case 'segment':
          targetId = item.customer_id;
          predictedValue = item.frequency_score + item.recency_score + item.monetary_score;
          confidence = 0.7;
          break;
        case 'churn':
          targetId = item.customer_id;
          predictedValue = item.churn_probability * 100;
          confidence = item.confidence;
          break;
      }
      
      await pool.execute(
        'INSERT INTO ai_predictions (type, target_id, predicted_value, confidence) VALUES (?, ?, ?, ?)',
        [type, targetId, predictedValue, confidence]
      );
    }
  } catch (error) {
    console.error(`Failed to store ${type} predictions:`, error);
  }
};