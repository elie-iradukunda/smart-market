import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const generateBusinessRecommendations = async (data, type) => {
  try {
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
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Unable to generate recommendations at this time. Please try again later.';
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