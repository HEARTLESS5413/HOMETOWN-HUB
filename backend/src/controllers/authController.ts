import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { generateToken, generateResetToken, hashResetToken } from '../utils/helpers';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, username, email, password, city, state, hometown } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
      });
      return;
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      city,
      state,
      hometown,
      badges: ['Early Adopter'],
      contributionPoints: 10,
    });

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'register',
      targetType: 'user',
      targetId: user._id,
      ip: req.ip,
    });

    const token = generateToken((user._id as unknown as string));

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          city: user.city,
          hometown: user.hometown,
          badges: user.badges,
          level: user.level,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: 'login',
      targetType: 'user',
      targetId: user._id,
      ip: req.ip,
    });

    const token = generateToken((user._id as unknown as string));

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          city: user.city,
          hometown: user.hometown,
          badges: user.badges,
          level: user.level,
          contributionPoints: user.contributionPoints,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id)
      .populate('joinedCommunities', 'name slug logo memberCount')
      .select('-password');

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Don't reveal if email exists
      res.json({ success: true, message: 'If this email exists, a reset link has been sent' });
      return;
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // In production, send email here
    // For now, return the token in dev mode
    res.json({
      success: true,
      message: 'If this email exists, a reset link has been sent',
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hashedToken = hashResetToken(req.params.token as string);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      return;
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = generateToken((user._id as unknown as string));

    res.json({
      success: true,
      message: 'Password reset successful',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token removal, server acknowledges)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully' });
};
