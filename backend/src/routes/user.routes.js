import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { userController } from '../controllers/user.controller.js';

const router = Router();

// Public routes
router.post('/', userController.createUser);
router.get('/login', userController.checkLogin);

// Protected routes
router.use(authMiddleware);
router.get('/profile', userController.getProfile);
router.get('/summary', userController.getFinancialSummary);
router.get('/splitmates', userController.getSplitmates);
router.put('/profile', userController.updateProfile);

export default router;
