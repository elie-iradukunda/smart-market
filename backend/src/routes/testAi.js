import express from 'express';
import { testGeminiAI, testGeminiPricing } from '../controllers/testAiController.js';
import { listGeminiModels, testBasicGemini } from '../controllers/geminiTestController.js';

const router = express.Router();

// Test routes for Gemini AI (no authentication needed for testing)
router.get('/test/gemini/models', listGeminiModels);
router.get('/test/gemini/basic', testBasicGemini);
router.get('/test/gemini/demand', testGeminiAI);
router.get('/test/gemini/pricing', testGeminiPricing);

export default router;