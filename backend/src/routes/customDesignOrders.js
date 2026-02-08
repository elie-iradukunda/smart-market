import express from 'express';
import { 
    createCustomDesignOrder, 
    getCustomDesignOrder, 
    getUserCustomDesignOrders,
    getAllCustomDesignOrders,
    updateCustomDesignOrderStatus
} from '../controllers/customDesignOrderController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import rbacMiddleware from '../../middleware/rbac.js';

const router = express.Router();

// Public/Customer routes
router.post('/custom-design/orders', optionalAuthenticateToken, createCustomDesignOrder);
router.get('/custom-design/orders/user', optionalAuthenticateToken, getUserCustomDesignOrders);
router.get('/custom-design/orders/:id', optionalAuthenticateToken, getCustomDesignOrder);

// Admin/Staff routes
router.get('/custom-design/orders', authenticateToken, rbacMiddleware, getAllCustomDesignOrders);
router.put('/custom-design/orders/:id/status', authenticateToken, rbacMiddleware, updateCustomDesignOrderStatus);

export default router;
