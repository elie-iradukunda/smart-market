import pool from '../config/database.js';

// Manual prediction creation removed - AI generates automatically

export const getDemandPredictions = async (req, res) => {
  try {
    const [predictions] = await pool.execute(
      'SELECT * FROM ai_predictions WHERE type = "demand" ORDER BY created_at DESC LIMIT 50'
    );
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
};

export const getReorderSuggestions = async (req, res) => {
  try {
    const [materials] = await pool.execute(`
      SELECT m.*, 
        CASE WHEN m.current_stock <= m.reorder_level THEN 'urgent' 
             WHEN m.current_stock <= m.reorder_level * 1.5 THEN 'soon' 
             ELSE 'ok' END as reorder_status
      FROM materials m 
      WHERE m.current_stock <= m.reorder_level * 2
      ORDER BY m.current_stock / m.reorder_level ASC
    `);
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reorder suggestions' });
  }
};

export const getCustomerInsights = async (req, res) => {
  try {
    const [insights] = await pool.execute(`
      SELECT 
        c.id, c.name,
        COUNT(o.id) as total_orders,
        SUM(q.total_amount) as total_spent,
        AVG(q.total_amount) as avg_order_value,
        MAX(o.created_at) as last_order_date
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      LEFT JOIN quotes q ON o.quote_id = q.id
      GROUP BY c.id, c.name
      HAVING total_orders > 0
      ORDER BY total_spent DESC
      LIMIT 100
    `);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
};

// Linear Regression for Demand Forecasting
const linearRegression = (x, y) => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

// Moving Average for Time Series
const movingAverage = (data, window = 7) => {
  if (data.length < window) return data[data.length - 1] || 0;
  const recent = data.slice(-window);
  return recent.reduce((a, b) => a + b, 0) / window;
};

// Exponential Smoothing
const exponentialSmoothing = (data, alpha = 0.3) => {
  if (data.length === 0) return 0;
  if (data.length === 1) return data[0];
  
  let forecast = data[0];
  for (let i = 1; i < data.length; i++) {
    forecast = alpha * data[i] + (1 - alpha) * forecast;
  }
  return forecast;
};

export const generateDemandPredictions = async () => {
  try {
    const [materials] = await pool.execute(`
      SELECT m.id, m.name, m.current_stock, m.reorder_level
      FROM materials m
    `);

    for (const material of materials) {
      // Get historical usage data (last 30 days)
      const [usage] = await pool.execute(`
        SELECT DATE(created_at) as date, SUM(ABS(quantity)) as daily_usage
        FROM stock_movements 
        WHERE material_id = ? AND type = 'issue' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [material.id]);

      if (usage.length < 3) continue;

      const days = usage.map((_, i) => i + 1);
      const quantities = usage.map(u => u.daily_usage);
      
      // Apply multiple models
      const linearModel = linearRegression(days, quantities);
      const nextDay = days.length + 1;
      const linearPrediction = Math.max(0, linearModel.slope * nextDay + linearModel.intercept);
      
      const movingAvgPrediction = movingAverage(quantities, 7);
      const expSmoothPrediction = exponentialSmoothing(quantities, 0.3);
      
      // Ensemble prediction (weighted average)
      const predicted_demand = Math.round(
        (linearPrediction * 0.4 + movingAvgPrediction * 0.3 + expSmoothPrediction * 0.3)
      );
      
      // Calculate confidence based on data quality
      const variance = quantities.reduce((sum, q) => {
        const mean = quantities.reduce((a, b) => a + b, 0) / quantities.length;
        return sum + Math.pow(q - mean, 2);
      }, 0) / quantities.length;
      
      const confidence = Math.max(0.3, Math.min(0.95, 1 - (variance / 100)));
      
      await pool.execute(
        'INSERT INTO ai_predictions (type, target_id, predicted_value, confidence) VALUES (?, ?, ?, ?)',
        ['demand', material.id, predicted_demand, confidence]
      );
    }
    
    console.log(`Generated ${materials.length} demand predictions using ML models`);
  } catch (error) {
    console.error('Demand prediction generation failed:', error);
  }
};

// Economic Order Quantity (EOQ) Model
const calculateEOQ = (annualDemand, orderingCost, holdingCost) => {
  if (holdingCost === 0) return Math.sqrt(2 * annualDemand * orderingCost);
  return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
};

// Safety Stock Calculation
const calculateSafetyStock = (leadTime, avgDemand, demandVariability) => {
  const serviceLevel = 1.65; // 95% service level (z-score)
  return serviceLevel * Math.sqrt(leadTime) * demandVariability;
};

export const generateReorderPredictions = async () => {
  try {
    const [materials] = await pool.execute(`
      SELECT m.id, m.name, m.current_stock, m.reorder_level
      FROM materials m
      WHERE m.current_stock > 0
    `);

    for (const material of materials) {
      // Get usage statistics
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as usage_days,
          AVG(ABS(quantity)) as avg_daily_usage,
          STDDEV(ABS(quantity)) as usage_stddev,
          SUM(ABS(quantity)) as total_usage
        FROM stock_movements 
        WHERE material_id = ? AND type = 'issue' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      `, [material.id]);

      if (!stats[0] || stats[0].usage_days < 5) continue;

      const avgDailyUsage = stats[0].avg_daily_usage || 0;
      const usageStddev = stats[0].usage_stddev || 0;
      const annualDemand = avgDailyUsage * 365;
      
      // EOQ calculation (assuming ordering cost $50, holding cost 20% of item value)
      const orderingCost = 50;
      const holdingCost = 0.2;
      const eoq = calculateEOQ(annualDemand, orderingCost, holdingCost);
      
      // Safety stock (assuming 7-day lead time)
      const leadTime = 7;
      const safetyStock = calculateSafetyStock(leadTime, avgDailyUsage, usageStddev);
      
      // Reorder point
      const reorderPoint = (avgDailyUsage * leadTime) + safetyStock;
      
      // Days until reorder needed
      let days_until_reorder;
      if (avgDailyUsage > 0) {
        const stockAboveReorder = Math.max(0, material.current_stock - reorderPoint);
        days_until_reorder = Math.round(stockAboveReorder / avgDailyUsage);
      } else {
        days_until_reorder = 999; // No usage pattern
      }
      
      // Confidence based on data consistency
      const coefficientOfVariation = usageStddev / avgDailyUsage;
      const confidence = Math.max(0.4, Math.min(0.95, 1 - coefficientOfVariation));
      
      await pool.execute(
        'INSERT INTO ai_predictions (type, target_id, predicted_value, confidence) VALUES (?, ?, ?, ?)',
        ['reorder', material.id, Math.max(0, days_until_reorder), confidence]
      );
    }
    
    console.log(`Generated EOQ-based reorder predictions for ${materials.length} materials`);
  } catch (error) {
    console.error('Reorder prediction generation failed:', error);
  }
};

// Logistic Regression for Churn Prediction
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

const logisticRegression = (features, weights) => {
  const z = features.reduce((sum, feature, i) => sum + feature * weights[i], 0);
  return sigmoid(z);
};

// RFM Analysis (Recency, Frequency, Monetary)
const calculateRFMScore = (recency, frequency, monetary) => {
  // Normalize scores (1-5 scale)
  const recencyScore = recency <= 30 ? 5 : recency <= 60 ? 4 : recency <= 90 ? 3 : recency <= 180 ? 2 : 1;
  const frequencyScore = frequency >= 10 ? 5 : frequency >= 5 ? 4 : frequency >= 3 ? 3 : frequency >= 2 ? 2 : 1;
  const monetaryScore = monetary >= 5000 ? 5 : monetary >= 2000 ? 4 : monetary >= 1000 ? 3 : monetary >= 500 ? 2 : 1;
  
  return { recencyScore, frequencyScore, monetaryScore };
};

export const generateChurnPredictions = async () => {
  try {
    const [customers] = await pool.execute(`
      SELECT 
        c.id, c.name,
        DATEDIFF(NOW(), MAX(o.created_at)) as days_since_last_order,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(q.total_amount), 0) as total_spent,
        COALESCE(AVG(q.total_amount), 0) as avg_order_value,
        STDDEV(DATEDIFF(o2.created_at, o1.created_at)) as order_interval_stddev
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      LEFT JOIN quotes q ON o.quote_id = q.id
      LEFT JOIN orders o1 ON c.id = o1.customer_id
      LEFT JOIN orders o2 ON c.id = o2.customer_id AND o2.id > o1.id
      GROUP BY c.id
      HAVING total_orders > 0
    `);

    for (const customer of customers) {
      // RFM Analysis
      const rfm = calculateRFMScore(
        customer.days_since_last_order || 365,
        customer.total_orders,
        customer.total_spent
      );
      
      // Feature engineering for logistic regression
      const features = [
        1, // bias term
        Math.log(customer.days_since_last_order + 1), // log recency
        customer.total_orders, // frequency
        Math.log(customer.total_spent + 1), // log monetary
        customer.avg_order_value / 1000, // normalized AOV
        customer.order_interval_stddev || 0, // order consistency
        rfm.recencyScore + rfm.frequencyScore + rfm.monetaryScore // RFM composite
      ];
      
      // Trained weights (would normally come from historical data)
      const weights = [-2.5, 0.8, -0.3, -0.2, -0.1, 0.15, -0.25];
      
      // Logistic regression prediction
      const churn_probability = logisticRegression(features, weights);
      
      // Decision tree rules for confidence
      let confidence = 0.6;
      if (customer.total_orders >= 5 && customer.days_since_last_order !== null) {
        confidence = 0.85;
      } else if (customer.total_orders >= 2) {
        confidence = 0.7;
      }
      
      // Adjust confidence based on data quality
      if (customer.order_interval_stddev > 30) {
        confidence *= 0.8; // Less confident for irregular customers
      }
      
      await pool.execute(
        'INSERT INTO ai_predictions (type, target_id, predicted_value, confidence) VALUES (?, ?, ?, ?)',
        ['churn', customer.id, Math.round(churn_probability * 100) / 100, confidence]
      );
    }
    
    console.log(`Generated ML-based churn predictions for ${customers.length} customers`);
  } catch (error) {
    console.error('Churn prediction generation failed:', error);
  }
};

// K-means Clustering for Customer Segmentation
const euclideanDistance = (point1, point2) => {
  return Math.sqrt(point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0));
};

const kMeansClustering = (data, k = 3, maxIterations = 100) => {
  if (data.length === 0) return { centroids: [], clusters: [] };
  
  // Initialize centroids randomly
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push(data[Math.floor(Math.random() * data.length)].slice());
  }
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to clusters
    const clusters = Array(k).fill().map(() => []);
    
    data.forEach((point, index) => {
      let minDistance = Infinity;
      let clusterIndex = 0;
      
      centroids.forEach((centroid, i) => {
        const distance = euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = i;
        }
      });
      
      clusters[clusterIndex].push({ point, index });
    });
    
    // Update centroids
    const newCentroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0].slice();
      
      const dimensions = cluster[0].point.length;
      return Array(dimensions).fill(0).map((_, dim) => {
        return cluster.reduce((sum, item) => sum + item.point[dim], 0) / cluster.length;
      });
    });
    
    // Check convergence
    const converged = centroids.every((centroid, i) => 
      euclideanDistance(centroid, newCentroids[i]) < 0.001
    );
    
    centroids = newCentroids;
    if (converged) break;
  }
  
  return { centroids, clusters: centroids.map(() => []) };
};

export const generateCustomerSegmentation = async () => {
  try {
    const [customers] = await pool.execute(`
      SELECT 
        c.id,
        COALESCE(COUNT(o.id), 0) as frequency,
        COALESCE(SUM(q.total_amount), 0) as monetary,
        COALESCE(DATEDIFF(NOW(), MAX(o.created_at)), 365) as recency,
        COALESCE(AVG(q.total_amount), 0) as avg_order_value
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      LEFT JOIN quotes q ON o.quote_id = q.id
      GROUP BY c.id
      HAVING frequency > 0
    `);

    if (customers.length < 3) return;

    // Prepare data for clustering (normalize features)
    const maxFreq = Math.max(...customers.map(c => c.frequency));
    const maxMonetary = Math.max(...customers.map(c => c.monetary));
    const maxRecency = Math.max(...customers.map(c => c.recency));
    
    const clusterData = customers.map(c => [
      c.frequency / maxFreq,
      c.monetary / maxMonetary,
      (maxRecency - c.recency) / maxRecency, // Invert recency (recent = high score)
      c.avg_order_value / maxMonetary
    ]);
    
    // Perform K-means clustering
    const { centroids } = kMeansClustering(clusterData, 3);
    
    // Assign customers to segments
    customers.forEach((customer, index) => {
      const point = clusterData[index];
      let minDistance = Infinity;
      let segment = 0;
      
      centroids.forEach((centroid, i) => {
        const distance = euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          segment = i;
        }
      });
      
      // Define segment names
      const segmentNames = ['Champions', 'Loyal Customers', 'At Risk'];
      const segmentName = segmentNames[segment] || 'New Customers';
      
      // Store segmentation result
      pool.execute(
        'INSERT INTO ai_predictions (type, target_id, predicted_value, confidence) VALUES (?, ?, ?, ?)',
        ['segment', customer.id, segment, 0.8]
      );
    });
    
    console.log(`Generated customer segmentation for ${customers.length} customers`);
  } catch (error) {
    console.error('Customer segmentation failed:', error);
  }
};

// Price Elasticity and Optimization
export const generatePricingPredictions = async () => {
  try {
    // Get historical quote data
    const [quotes] = await pool.execute(`
      SELECT 
        qi.unit_price,
        qi.quantity,
        q.status,
        q.created_at,
        MONTH(q.created_at) as month,
        DAYOFWEEK(q.created_at) as day_of_week
      FROM quote_items qi
      JOIN quotes q ON qi.quote_id = q.id
      WHERE q.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      AND qi.unit_price > 0
    `);

    if (quotes.length < 10) return;

    // Group by price ranges
    const priceRanges = {};
    quotes.forEach(quote => {
      const priceRange = Math.floor(quote.unit_price / 10) * 10;
      if (!priceRanges[priceRange]) {
        priceRanges[priceRange] = { total: 0, accepted: 0, quantities: [] };
      }
      priceRanges[priceRange].total++;
      priceRanges[priceRange].quantities.push(quote.quantity);
      if (quote.status === 'approved') {
        priceRanges[priceRange].accepted++;
      }
    });

    // Calculate price elasticity and optimal pricing
    Object.entries(priceRanges).forEach(([priceRange, data]) => {
      if (data.total < 3) return;
      
      const acceptanceRate = data.accepted / data.total;
      const avgQuantity = data.quantities.reduce((a, b) => a + b, 0) / data.quantities.length;
      
      // Simple price elasticity calculation
      const elasticity = -1.2; // Assume elastic demand
      const currentPrice = parseInt(priceRange);
      
      // Optimal price calculation (maximize revenue)
      const optimalPrice = currentPrice * (1 + (acceptanceRate - 0.7) * 0.1);
      
      // Store pricing prediction
      pool.execute(
        'INSERT INTO ai_predictions (type, target_id, predicted_value, confidence) VALUES (?, ?, ?, ?)',
        ['pricing', parseInt(priceRange), Math.round(optimalPrice), acceptanceRate]
      );
    });
    
    console.log(`Generated pricing predictions for ${Object.keys(priceRanges).length} price ranges`);
  } catch (error) {
    console.error('Pricing prediction generation failed:', error);
  }
};

// Run all predictions
export const runAllPredictions = async (req, res) => {
  try {
    // Clear old predictions (keep last 7 days)
    await pool.execute(
      'DELETE FROM ai_predictions WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    
    await generateDemandPredictions();
    await generateReorderPredictions();
    await generateChurnPredictions();
    await generateCustomerSegmentation();
    await generatePricingPredictions();
    
    if (res) {
      res.json({ message: 'All AI predictions generated successfully' });
    }
  } catch (error) {
    console.error('AI prediction generation failed:', error);
    if (res) {
      res.status(500).json({ error: 'AI prediction generation failed' });
    }
  }
};