import { Router } from 'express';
import { createComment, getPostComments, deleteComment, toggleCommentLike } from '../controllers/commentController';
import { protect } from '../middleware/auth';
import { validate, createCommentSchema } from '../middleware/validators';

const router = Router();

router.post('/', protect, validate(createCommentSchema), createComment);
router.get('/post/:id', getPostComments);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);

export default router;
