import { Router } from 'express';
import { createCommunity, getCommunities, getCommunityBySlug, updateCommunity, joinCommunity, leaveCommunity, getMembers, getTrending, approveMember } from '../controllers/communityController';
import { protect } from '../middleware/auth';
import { validate, createCommunitySchema } from '../middleware/validators';

const router = Router();

router.get('/trending', getTrending);
router.get('/', getCommunities);
router.get('/:slug', getCommunityBySlug);
router.post('/', protect, validate(createCommunitySchema), createCommunity);
router.put('/:id', protect, updateCommunity);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);
router.get('/:id/members', getMembers);
router.post('/:id/approve/:userId', protect, approveMember);

export default router;
