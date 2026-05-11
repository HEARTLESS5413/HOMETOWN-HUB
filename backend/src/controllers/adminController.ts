import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Community from '../models/Community';
import Post from '../models/Post';
import Event from '../models/Event';
import Report from '../models/Report';
import ActivityLog from '../models/ActivityLog';
import { getPagination } from '../utils/helpers';

export const getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, totalCommunities, totalPosts, totalEvents, pendingReports, newUsersThisMonth, newPostsThisWeek] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ lastActive: { $gte: sevenDaysAgo } }),
      Community.countDocuments({ isActive: true }),
      Post.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Post.countDocuments({ createdAt: { $gte: sevenDaysAgo }, isActive: true }),
    ]);

    // Growth data (last 7 days)
    const growthData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now); dayStart.setDate(dayStart.getDate() - i); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart); dayEnd.setHours(23, 59, 59, 999);
      const [users, posts] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Post.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
      ]);
      growthData.push({ date: dayStart.toISOString().split('T')[0], users, posts });
    }

    // Top communities
    const topCommunities = await Community.find({ isActive: true }).select('name memberCount level slug').sort({ memberCount: -1 }).limit(5);

    // Category distribution
    const categoryDist = await Community.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalUsers, activeUsers, totalCommunities, totalPosts, totalEvents, pendingReports, newUsersThisMonth, newPostsThisWeek },
        growthData, topCommunities,
        categoryDistribution: categoryDist.map(c => ({ name: c._id, value: c.count })),
      },
    });
  } catch (error) { next(error); }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, limit } = getPagination(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 20);
    const [users, total] = await Promise.all([
      User.find().select('-password -resetPasswordToken').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);
    res.json({ success: true, data: { users, pagination: { total, page: Math.floor(skip / limit) + 1, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

export const suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json({ success: true, message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'}` });
  } catch (error) { next(error); }
};

export const getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, limit } = getPagination(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 20);
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    const [reports, total] = await Promise.all([
      Report.find(filter).populate('reporter', 'name username').populate('reviewedBy', 'name username').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Report.countDocuments(filter),
    ]);
    res.json({ success: true, data: { reports, pagination: { total, page: Math.floor(skip / limit) + 1, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

export const handleReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, reviewNote } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status, reviewNote, reviewedBy: req.user!._id }, { new: true });
    if (!report) { res.status(404).json({ success: false, message: 'Report not found' }); return; }
    res.json({ success: true, data: { report } });
  } catch (error) { next(error); }
};

export const suspendCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    community.isSuspended = !community.isSuspended;
    await community.save();
    res.json({ success: true, message: `Community ${community.isSuspended ? 'suspended' : 'unsuspended'}` });
  } catch (error) { next(error); }
};
