import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.post('/', userController.createUser);
router.get('/login', userController.checkLogin);

// Protected routes
router.use(authMiddleware);
router.get('/profile', userController.getProfile);
router.get('/summary', userController.getFinancialSummary);
router.get('/splitmates', userController.getSplitmates);

export default router;
