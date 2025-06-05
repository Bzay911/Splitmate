import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.post('/', userController.createUser);
router.get('/auth/login', userController.checkLogin);

// Protected routes
router.use(authMiddleware);
router.get('/profile', userController.getProfile);
router.get('/summary', userController.getFinancialSummary);

export default router;
