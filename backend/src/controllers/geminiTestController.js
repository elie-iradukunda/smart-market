import { GoogleGenerativeAI } from '@google/generative-ai';

export const listGeminiModels = async (req, res) => {
  res.json({
    message: 'Common Gemini model names to try',
    models: [
      'gemini-1.5-flash',
      'gemini-1.5-pro', 
      'gemini-pro',
      'gemini-1.0-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro',
      'models/gemini-pro'
    ],
    note: 'Use /test/gemini/basic to test which one works'
  });
};

export const testBasicGemini = async (req, res) => {
  try {
    // Test API key validity first
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'GEMINI_API_KEY not found in environment' });
    }
    
    console.log('API Key length:', apiKey.length);
    console.log('API Key starts with:', apiKey.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try the most common working model names
    const modelNames = [
      'gemini-pro',
      'models/gemini-pro',
      'gemini-1.5-flash',
      'models/gemini-1.5-flash',
      'text-bison-001',
      'chat-bison-001'
    ];
    
    const results = [];
    
    for (const modelName of modelNames) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100
          }
        });
        
        const result = await model.generateContent('Say "Hello World" if you can see this message.');
        const response = await result.response;
        const text = response.text();
        
        results.push({
          model: modelName,
          status: 'SUCCESS',
          response: text.trim()
        });
        
        // If we found a working model, break
        console.log(`✅ Working model found: ${modelName}`);
        break;
        
      } catch (error) {
        console.log(`❌ Model ${modelName} failed:`, error.message);
        results.push({
          model: modelName,
          status: 'FAILED',
          error: error.message.substring(0, 200) + '...'
        });
      }
    }
    
    res.json({
      message: 'Gemini API test completed',
      results,
      api_key_present: true,
      api_key_length: apiKey.length,
      working_model: results.find(r => r.status === 'SUCCESS')?.model || 'None found'
    });
    
  } catch (error) {
    console.error('Gemini test error:', error);
    res.status(500).json({ 
      error: 'Gemini test failed',
      details: error.message 
    });
  }
};