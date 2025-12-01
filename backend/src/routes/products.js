import express from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
// import rbacMiddleware from '../../middleware/rbac.js'; // Optional: Add RBAC later

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes (require auth)
// For now, allowing any authenticated user to manage products, or we can restrict to admin
router.post('/', authenticateToken, createProduct);
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
