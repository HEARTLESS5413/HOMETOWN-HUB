import { Router } from 'express';
import { getStats, getAllUsers, suspendUser, getReports, handleReport, suspendCommunity } from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect, authorize('platformAdmin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.get('/reports', getReports);
router.put('/reports/:id', handleReport);
router.put('/communities/:id/suspend', suspendCommunity);

export default router;
