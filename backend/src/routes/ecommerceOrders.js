import express from 'express';
import { createOrder, getOrder, getUserOrders } from '../controllers/ecommerceOrderController.js';

const router = express.Router();

// Public routes (or protected by frontend auth token, but for now open for simplicity of integration)
router.post('/', createOrder);
router.get('/user', getUserOrders); // ?email=...
router.get('/:id', getOrder);

export default router;
