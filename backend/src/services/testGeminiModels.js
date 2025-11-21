import { GoogleGenerativeAI } from '@google/generative-ai';

export const testAvailableModels = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Test different model names that might be available
    const testModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'text-bison-001',
      'chat-bison-001',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    console.log('Testing available models with your API key...');
    
    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, can you respond?');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ WORKING MODEL: ${modelName}`);
        console.log(`Response: ${text.substring(0, 50)}...`);
        return modelName; // Return first working model
        
      } catch (error) {
        console.log(`❌ ${modelName}: ${error.message.substring(0, 100)}`);
      }
    }
    
    console.log('❌ No working models found with your API key');
    return null;
    
  } catch (error) {
    console.error('Model testing error:', error);
    return null;
  }
};

// Test the API key and find working model
testAvailableModels().then(workingModel => {
  if (workingModel) {
    console.log(`\n🎉 SUCCESS! Use this model: ${workingModel}`);
  } else {
    console.log('\n❌ Your API key may need to be regenerated or activated');
  }
});