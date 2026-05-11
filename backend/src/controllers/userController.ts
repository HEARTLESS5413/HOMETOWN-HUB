import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { getPagination } from '../utils/helpers';

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 */
export const getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('joinedCommunities', 'name slug logo memberCount');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/username/:username
 * @desc    Get user profile by username
 */
export const getUserByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('joinedCommunities', 'name slug logo memberCount');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const allowedFields = [
      'name', 'bio', 'mobile', 'city', 'village', 'state',
      'country', 'hometown', 'interests', 'occupation',
      'education', 'socialLinks',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    // Log activity
    await ActivityLog.create({
      user: req.user!._id,
      action: 'update_profile',
      targetType: 'user',
      targetId: req.user!._id,
    });

    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/avatar
 * @desc    Update profile picture
 */
export const updateAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { profilePicture } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { profilePicture },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Avatar updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/search
 * @desc    Search users
 */
export const searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, city, hometown } = req.query;
    const { skip, limit } = getPagination(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );

    const filter: Record<string, unknown> = { isActive: true, isSuspended: false };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ];
    }
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (hometown) filter.hometown = { $regex: hometown, $options: 'i' };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name username profilePicture city hometown bio level badges')
        .skip(skip)
        .limit(limit)
        .sort({ contributionPoints: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Math.floor(skip / limit) + 1,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
