import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../middleware/validators';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.post('/logout', logout);

export default router;
