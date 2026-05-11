import { Request, Response, NextFunction } from 'express';
import Community from '../models/Community';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { generateSlug, getPagination, getPointsForAction } from '../utils/helpers';
import mongoose from 'mongoose';

export const createCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, city, village, state, category, privacy, tags, rules } = req.body;
    let slug = generateSlug(name);
    const existingSlug = await Community.findOne({ slug });
    if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;

    const community = await Community.create({
      name, slug, description, city, village, state, category, privacy,
      tags: tags || [], rules: rules || [],
      creator: req.user!._id,
      members: [{ user: req.user!._id, role: 'admin', joinedAt: new Date() }],
      memberCount: 1,
    });

    await User.findByIdAndUpdate(req.user!._id, {
      $push: { joinedCommunities: community._id },
      $inc: { contributionPoints: getPointsForAction('create_community') },
    });

    await ActivityLog.create({ user: req.user!._id, action: 'create_community', targetType: 'community', targetId: community._id });
    res.status(201).json({ success: true, data: { community } });
  } catch (error) { next(error); }
};

export const getCommunities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, limit } = getPagination(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 12);
    const filter: Record<string, unknown> = { isActive: true, isSuspended: false };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.city) filter.city = { $regex: req.query.city, $options: 'i' };
    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { description: { $regex: req.query.q, $options: 'i' } },
      ];
    }
    const [communities, total] = await Promise.all([
      Community.find(filter).populate('creator', 'name username profilePicture').select('-members -pendingRequests').skip(skip).limit(limit).sort({ memberCount: -1 }),
      Community.countDocuments(filter),
    ]);
    res.json({ success: true, data: { communities, pagination: { total, page: Math.floor(skip / limit) + 1, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

export const getCommunityBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const community = await Community.findOne({ slug: req.params.slug, isActive: true })
      .populate('creator', 'name username profilePicture')
      .populate('members.user', 'name username profilePicture level badges');
    if (!community) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    res.json({ success: true, data: { community } });
  } catch (error) { next(error); }
};

export const updateCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    const isAdmin = community.members.some(m => m.user.toString() === req.user!._id.toString() && m.role === 'admin');
    if (!isAdmin && req.user!.role !== 'platformAdmin') { res.status(403).json({ success: false, message: 'Not authorized' }); return; }
    const updates: Record<string, unknown> = {};
    ['name', 'description', 'banner', 'logo', 'rules', 'tags', 'privacy'].forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const updated = await Community.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, data: { community: updated } });
  } catch (error) { next(error); }
};

export const joinCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    const isMember = community.members.some(m => m.user.toString() === req.user!._id.toString());
    if (isMember) { res.status(400).json({ success: false, message: 'Already a member' }); return; }
    if (community.privacy === 'private') {
      community.pendingRequests.push(req.user!._id);
      await community.save();
      res.json({ success: true, message: 'Membership request sent' });
      return;
    }
    community.members.push({ user: req.user!._id, role: 'member', joinedAt: new Date() });
    community.memberCount += 1;
    await community.save();
    await User.findByIdAndUpdate(req.user!._id, { $push: { joinedCommunities: community._id }, $inc: { contributionPoints: getPointsForAction('join_community') } });
    await ActivityLog.create({ user: req.user!._id, action: 'join_community', targetType: 'community', targetId: community._id });
    res.json({ success: true, message: 'Joined community' });
  } catch (error) { next(error); }
};

export const leaveCommunity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    const idx = community.members.findIndex(m => m.user.toString() === req.user!._id.toString());
    if (idx === -1) { res.status(400).json({ success: false, message: 'Not a member' }); return; }
    if (community.creator.toString() === req.user!._id.toString()) { res.status(400).json({ success: false, message: 'Creator cannot leave' }); return; }
    community.members.splice(idx, 1);
    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();
    await User.findByIdAndUpdate(req.user!._id, { $pull: { joinedCommunities: community._id } });
    res.json({ success: true, message: 'Left community' });
  } catch (error) { next(error); }
};

export const getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.user', 'name username profilePicture level badges contributionPoints')
      .select('members memberCount');
    if (!community) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    res.json({ success: true, data: { members: community.members, total: community.memberCount } });
  } catch (error) { next(error); }
};

export const getTrending = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const communities = await Community.find({ isActive: true, isSuspended: false })
      .populate('creator', 'name username').select('-members -pendingRequests').sort({ memberCount: -1 }).limit(10);
    res.json({ success: true, data: { communities } });
  } catch (error) { next(error); }
};

export const approveMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    const isAdmin = community.members.some(m => m.user.toString() === req.user!._id.toString() && ['admin', 'moderator'].includes(m.role));
    if (!isAdmin) { res.status(403).json({ success: false, message: 'Not authorized' }); return; }
    const pIdx = community.pendingRequests.findIndex(id => id.toString() === req.params.userId);
    if (pIdx === -1) { res.status(400).json({ success: false, message: 'No pending request' }); return; }
    community.pendingRequests.splice(pIdx, 1);
    community.members.push({ user: new mongoose.Types.ObjectId(req.params.userId as string) as any, role: 'member', joinedAt: new Date() });
    community.memberCount += 1;
    await community.save();
    await User.findByIdAndUpdate(req.params.userId, { $push: { joinedCommunities: community._id } });
    res.json({ success: true, message: 'Member approved' });
  } catch (error) { next(error); }
};
