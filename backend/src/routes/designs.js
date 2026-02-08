import express from 'express';
import { createDesign, getDesigns, getDesign, updateDesign, deleteDesign, approveDesign } from '../controllers/designController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

import rbacMiddleware from '../../middleware/rbac.js';

const router = express.Router();

// Publicly accessible routes with optional authentication 
// (Admins can see more if logged in, but guests can see published designs)
router.get('/designs', optionalAuthenticateToken, getDesigns);
router.get('/designs/:id', optionalAuthenticateToken, getDesign);

// Protected routes (Require login and RBAC)
router.use(authenticateToken, rbacMiddleware);

router.post('/designs', createDesign);
router.put('/designs/:id', updateDesign);
router.put('/designs/:id/approve', approveDesign);
router.delete('/designs/:id', deleteDesign);

export default router;
