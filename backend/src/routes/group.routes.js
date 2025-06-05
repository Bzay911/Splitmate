import { Router } from 'express';
import { groupController } from '../controllers/group.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

// Apply authMiddleware to all routes in this router
router.use(authMiddleware);

// Routes (no need to specify authMiddleware for each route)
router.get('/', groupController.getAllGroups);
router.get('/:groupId', groupController.getGroupById);
router.post('/', groupController.createGroup);
router.post('/:groupId/addMember', groupController.addMemberToGroup);
router.delete('/:groupId', groupController.deleteGroup);

export default router;