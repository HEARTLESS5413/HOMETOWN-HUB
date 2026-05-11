import { Router } from 'express';
import { createPost, getCommunityPosts, getUserFeed, toggleLike, toggleBookmark, deletePost, pinPost, reportPost, votePoll } from '../controllers/postController';
import { protect } from '../middleware/auth';
import { validate, createPostSchema } from '../middleware/validators';

const router = Router();

router.post('/', protect, validate(createPostSchema), createPost);
router.get('/feed', protect, getUserFeed);
router.get('/community/:id', getCommunityPosts);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/pin', protect, pinPost);
router.post('/:id/report', protect, reportPost);
router.post('/:id/vote', protect, votePoll);

export default router;
