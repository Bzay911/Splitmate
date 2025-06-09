import { Router } from 'express';
import { expenseController, upload } from '../controllers/expense.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/groups/:groupId/expenses', expenseController.addExpense);
router.get('/groups/:groupId/expenses', expenseController.getGroupExpenses);
router.post('/groups/:groupId/scan-receipt', upload.single('receipt'), expenseController.scanReceipt);

export default router;
