import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try to get a working model
const getWorkingModel = async () => {
  const modelNames = [
    'gemini-1.5-flash',
    'models/gemini-1.5-flash', 
    'gemini-pro',
    'models/gemini-pro',
    'gemini-1.0-pro'
  ];
  
  for (const modelName of modelNames) {
    try {
      const testModel = genAI.getGenerativeModel({ model: modelName });
      await testModel.generateContent('test');
      console.log(`✅ Working model found: ${modelName}`);
      return testModel;
    } catch (error) {
      console.log(`❌ Model ${modelName} failed`);
    }
  }
  
  throw new Error('No working Gemini model found');
};

// Fallback local AI recommendations
const generateLocalFallback = (data, type) => {
  switch (type) {
    case 'demand_forecast':
      return `📊 DEMAND FORECAST ANALYSIS\n\n🔥 HIGH DEMAND MATERIALS:\n• ${data[0]?.material_name}: ${data[0]?.predicted_demand} units expected\n• ${data[1]?.material_name}: ${data[1]?.predicted_demand} units expected\n\n💡 RECOMMENDATIONS:\n• Increase stock for high-demand materials by 20-30%\n• Set up automatic reorder alerts\n• Consider bulk purchasing discounts\n• Monitor seasonal trends for better forecasting`;
      
    case 'inventory_optimization':
      return `📦 INVENTORY OPTIMIZATION ANALYSIS\n\n🚨 URGENT REORDERS:\n• ${data[0]?.material_name}: ${data[0]?.days_until_reorder} days left\n• ${data[1]?.material_name}: ${data[1]?.days_until_reorder} days left\n\n💡 RECOMMENDATIONS:\n• Set up automatic alerts for items with <14 days stock\n• Implement Economic Order Quantity (EOQ) for cost optimization\n• Review reorder levels quarterly based on usage patterns\n• Consider safety stock levels based on supplier lead times`;
      
    case 'customer_segmentation':
      const champions = data.filter(c => c.segment === 'Champions');
      const atRisk = data.filter(c => c.segment === 'At Risk');
      return `👥 CUSTOMER SEGMENTATION ANALYSIS\n\n🏆 CHAMPIONS (${champions.length} customers):\n${champions.slice(0,2).map(c => `• ${c.customer_name}: $${c.monetary} spent`).join('\n')}\n\n⚠️ AT RISK CUSTOMERS (${atRisk.length} customers):\n${atRisk.slice(0,2).map(c => `• ${c.customer_name}: ${c.recency} days since last order`).join('\n')}\n\n💡 RECOMMENDATIONS:\n• Offer VIP treatment for champions\n• Send re-engagement campaigns to at-risk customers\n• Implement customer feedback system\n• Create loyalty rewards program`;
      
    case 'churn_prediction':
      const highRisk = data.filter(c => c.churn_probability > 0.7);
      return `🚨 CUSTOMER CHURN PREVENTION\n\n⚠️ HIGH CHURN RISK (${highRisk.length} customers):\n${highRisk.slice(0,2).map(c => `• ${c.customer_name}: ${Math.round(c.churn_probability * 100)}% risk`).join('\n')}\n\n💡 PREVENTION STRATEGIES:\n• Personal phone calls from account manager\n• Exclusive discount offers (15-25% off)\n• Address service issues immediately\n• Flexible payment terms\n• Regular check-in calls`;
      
    case 'pricing_optimization':
      return `💰 PRICING STRATEGY ANALYSIS\n\n📈 HIGH ACCEPTANCE RATES:\n• $50-60 range: 80% acceptance\n• $60-70 range: 70% acceptance\n\n💡 RECOMMENDATIONS:\n• Sweet spot appears to be $50-70 range\n• Test premium pricing for high-demand services\n• Implement value-based pricing\n• Bundle services to increase average order value\n• Offer tiered pricing (Good, Better, Best)`;
      
    default:
      return `📊 BUSINESS ANALYSIS\n\nBased on your data analysis, here are key recommendations:\n\n💡 KEY INSIGHTS:\n• Focus on data-driven decision making\n• Implement automated monitoring systems\n• Regular performance reviews and adjustments\n• Customer-centric approach to business growth\n\n🎯 ACTION ITEMS:\n• Set up KPI dashboards\n• Implement feedback loops\n• Regular strategy reviews\n• Continuous improvement processes`;
  }
};

export const generateBusinessRecommendations = async (data, type) => {
  try {
    console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    console.log('Generating recommendations for type:', type);
    console.log('Data length:', data.length);
    
    // Get working model
    const model = await getWorkingModel();
    
    let prompt = '';
    
    switch (type) {
      case 'inventory':
        prompt = `
          As a business analyst for a printing company, analyze this inventory data and provide actionable recommendations:
          
          ${JSON.stringify(data, null, 2)}
          
          Please provide:
          1. Top 3 materials that need immediate attention
          2. Inventory optimization strategies
          3. Cost reduction opportunities
          4. Supplier negotiation points
          
          Keep recommendations practical and specific to printing business operations.
        `;
        break;
        
      case 'customer':
        prompt = `
          As a customer success manager for a printing company, analyze this customer data and provide recommendations:
          
          ${JSON.stringify(data, null, 2)}
          
          Please provide:
          1. Customer retention strategies for at-risk segments
          2. Upselling opportunities for loyal customers
          3. Re-engagement campaigns for lost customers
          4. Pricing strategies by customer segment
          
          Focus on actionable marketing and sales strategies.
        `;
        break;
        
      case 'demand':
        prompt = `
          As a production manager for a printing company, analyze this demand forecast data:
          
          ${JSON.stringify(data, null, 2)}
          
          Please provide:
          1. Production planning recommendations
          2. Capacity optimization strategies
          3. Material procurement timing
          4. Seasonal demand preparation
          
          Focus on operational efficiency and cost optimization.
        `;
        break;
        
      case 'churn':
        prompt = `
          As a customer relationship manager, analyze this churn prediction data:
          
          ${JSON.stringify(data, null, 2)}
          
          Please provide:
          1. Immediate intervention strategies for high-risk customers
          2. Proactive retention campaigns
          3. Service improvement recommendations
          4. Customer communication strategies
          
          Focus on preventing customer loss and improving satisfaction.
        `;
        break;
        
      default:
        prompt = `
          As a business consultant for a printing company, analyze this data and provide strategic recommendations:
          
          ${JSON.stringify(data, null, 2)}
          
          Please provide actionable business insights and recommendations.
        `;
    }
    
    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini response received, length:', text.length);
    return text;
    
  } catch (error) {
    console.error('Gemini API error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details
    });
    
    // Fallback to local AI recommendations
    console.log('Falling back to local AI recommendations...');
    return generateLocalFallback(data, type);
  }
};

export const generatePricingRecommendations = async (historicalData, marketData) => {
  const prompt = `
    As a pricing strategist for a printing company, analyze this data and provide pricing recommendations:
    
    Historical Performance:
    ${JSON.stringify(historicalData, null, 2)}
    
    Market Context:
    ${JSON.stringify(marketData, null, 2)}
    
    Please provide:
    1. Optimal pricing strategies by service type
    2. Dynamic pricing recommendations
    3. Competitive positioning advice
    4. Revenue optimization opportunities
    5. Customer-specific pricing strategies
    
    Focus on maximizing profitability while maintaining competitiveness.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini pricing analysis error:', error);
    return 'Unable to generate pricing recommendations at this time.';
  }
};

export const generateProductionOptimization = async (workflowData, resourceData) => {
  const prompt = `
    As a production optimization expert for a printing company, analyze this operational data:
    
    Workflow Data:
    ${JSON.stringify(workflowData, null, 2)}
    
    Resource Data:
    ${JSON.stringify(resourceData, null, 2)}
    
    Please provide:
    1. Workflow optimization recommendations
    2. Resource allocation strategies
    3. Bottleneck identification and solutions
    4. Quality improvement suggestions
    5. Efficiency enhancement opportunities
    
    Focus on reducing production time, improving quality, and maximizing resource utilization.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini production optimization error:', error);
    return 'Unable to generate production recommendations at this time.';
  }
};

export const generateMarketingInsights = async (campaignData, customerData) => {
  const prompt = `
    As a marketing strategist for a printing company, analyze this marketing and customer data:
    
    Campaign Performance:
    ${JSON.stringify(campaignData, null, 2)}
    
    Customer Insights:
    ${JSON.stringify(customerData, null, 2)}
    
    Please provide:
    1. Campaign optimization strategies
    2. Target audience recommendations
    3. Channel effectiveness analysis
    4. Content strategy suggestions
    5. Budget allocation recommendations
    
    Focus on improving ROI, customer acquisition, and brand positioning in the printing industry.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini marketing analysis error:', error);
    return 'Unable to generate marketing insights at this time.';
  }
};