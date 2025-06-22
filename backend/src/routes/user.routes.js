import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { userController } from '../controllers/user.controller.js';

const router = Router();

// Public routes (no authentication required)
router.post('/login', userController.checkLogin);
router.post('/signup', userController.createUser);


// Protected routes (authentication required)
router.use(authMiddleware);
router.get('/validate', userController.validateToken);
router.get('/profile', userController.getProfile);
router.get('/summary', userController.getFinancialSummary);
router.get('/splitmates', userController.getSplitmates);
router.put('/profile', userController.updateProfile);
router.get('/activity', userController.getActivity);

export default router;
