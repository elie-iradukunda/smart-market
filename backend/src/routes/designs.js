import express from 'express';
import { createDesign, getDesigns, getDesign, updateDesign, deleteDesign, approveDesign } from '../controllers/designController.js';
import { authenticateToken } from '../middleware/auth.js';

import rbacMiddleware from '../../middleware/rbac.js';

const router = express.Router();

// All design routes require authentication and RBAC
router.use(authenticateToken, rbacMiddleware);

router.get('/designs', getDesigns);
router.get('/designs/:id', getDesign);
router.post('/designs', createDesign);
router.put('/designs/:id', updateDesign);
router.put('/designs/:id/approve', approveDesign);
router.delete('/designs/:id', deleteDesign);

export default router;
