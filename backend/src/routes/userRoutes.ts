import { Router } from 'express';
import { getUserProfile, getUserByUsername, updateProfile, updateAvatar, searchUsers } from '../controllers/userController';
import { protect } from '../middleware/auth';
import { validate, updateProfileSchema } from '../middleware/validators';

const router = Router();

router.get('/search', protect, searchUsers);
router.get('/username/:username', getUserByUsername);
router.get('/:id', getUserProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/avatar', protect, updateAvatar);

export default router;
