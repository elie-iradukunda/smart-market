import { generateBusinessRecommendations } from '../services/geminiService.js';

// Test Gemini AI without database
export const testGeminiAI = async (req, res) => {
  try {
    // Sample data for testing
    const sampleData = [
      {
        material_id: 1,
        material_name: 'A4 Paper',
        category: 'Paper',
        predicted_demand: 50,
        confidence: 0.8
      },
      {
        material_id: 2,
        material_name: 'Vinyl Roll',
        category: 'Vinyl',
        predicted_demand: 25,
        confidence: 0.7
      }
    ];

    console.log('Testing Gemini AI with sample data...');
    
    // Test Gemini recommendations
    const recommendations = await generateBusinessRecommendations(sampleData, 'demand');
    
    res.json({
      message: 'Gemini AI test successful',
      sample_data: sampleData,
      ai_recommendations: recommendations,
      powered_by: 'Gemini AI',
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Gemini test error:', error);
    res.status(500).json({ 
      error: 'Gemini AI test failed',
      details: error.message 
    });
  }
};

export const testGeminiPricing = async (req, res) => {
  try {
    const samplePricingData = [
      { price_range: 100, quote_count: 15, acceptance_rate: 0.8, avg_price: 105 },
      { price_range: 200, quote_count: 12, acceptance_rate: 0.6, avg_price: 210 },
      { price_range: 300, quote_count: 8, acceptance_rate: 0.4, avg_price: 320 }
    ];

    const marketData = {
      total_quotes: 35,
      avg_acceptance_rate: 0.6,
      price_ranges: 3
    };

    console.log('Testing Gemini pricing recommendations...');
    
    const recommendations = await generateBusinessRecommendations(samplePricingData, 'pricing');
    
    res.json({
      message: 'Gemini pricing test successful',
      pricing_data: samplePricingData,
      market_data: marketData,
      ai_recommendations: recommendations,
      powered_by: 'Gemini AI',
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Gemini pricing test error:', error);
    res.status(500).json({ 
      error: 'Gemini pricing test failed',
      details: error.message 
    });
  }
};