import { Request, Response, NextFunction } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import Community from '../models/Community';
import Notification from '../models/Notification';
import ActivityLog from '../models/ActivityLog';
import { getPagination, getPointsForAction, containsToxicContent } from '../utils/helpers';

export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { community, content, type, images, pollOptions } = req.body;
    // Verify membership
    const comm = await Community.findById(community);
    if (!comm) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    const isMember = comm.members.some(m => m.user.toString() === req.user!._id.toString());
    if (!isMember) { res.status(403).json({ success: false, message: 'Join community first' }); return; }
    // Spam check
    if (containsToxicContent(content)) { res.status(400).json({ success: false, message: 'Content flagged for review' }); return; }

    const post = await Post.create({ author: req.user!._id, community, content, type, images: images || [], pollOptions: pollOptions || [] });
    await post.populate('author', 'name username profilePicture level badges');
    await User.findByIdAndUpdate(req.user!._id, { $inc: { contributionPoints: getPointsForAction('create_post') } });
    await ActivityLog.create({ user: req.user!._id, action: 'create_post', targetType: 'post', targetId: post._id });
    res.status(201).json({ success: true, data: { post } });
  } catch (error) { next(error); }
};

export const getCommunityPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, limit } = getPagination(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 10);
    const filter: Record<string, unknown> = { community: req.params.id, isActive: true };
    const [posts, total] = await Promise.all([
      Post.find(filter).populate('author', 'name username profilePicture level badges').sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);
    res.json({ success: true, data: { posts, pagination: { total, page: Math.floor(skip / limit) + 1, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

export const getUserFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, limit } = getPagination(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 10);
    const user = await User.findById(req.user!._id);
    const communityIds = user?.joinedCommunities || [];
    const [posts, total] = await Promise.all([
      Post.find({ community: { $in: communityIds }, isActive: true }).populate('author', 'name username profilePicture level badges').populate('community', 'name slug logo').sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments({ community: { $in: communityIds }, isActive: true }),
    ]);
    res.json({ success: true, data: { posts, pagination: { total, page: Math.floor(skip / limit) + 1, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

export const toggleLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    const userId = req.user!._id;
    const isLiked = post.likes.some(id => id.toString() === userId.toString());
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likes.push(userId);
      post.likeCount += 1;
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({ recipient: post.author, sender: userId, type: 'like', title: 'New Like', message: `${req.user!.name} liked your post`, link: `/communities/${post.community}` });
      }
      await User.findByIdAndUpdate(userId, { $inc: { contributionPoints: getPointsForAction('like_post') } });
    }
    await post.save();
    res.json({ success: true, data: { liked: !isLiked, likeCount: post.likeCount } });
  } catch (error) { next(error); }
};

export const toggleBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    const userId = req.user!._id;
    const isBookmarked = post.bookmarks.some(id => id.toString() === userId.toString());
    if (isBookmarked) { post.bookmarks = post.bookmarks.filter(id => id.toString() !== userId.toString()); }
    else { post.bookmarks.push(userId); }
    await post.save();
    res.json({ success: true, data: { bookmarked: !isBookmarked } });
  } catch (error) { next(error); }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    if (post.author.toString() !== req.user!._id.toString() && req.user!.role !== 'platformAdmin') {
      const community = await Community.findById(post.community);
      const isMod = community?.members.some(m => m.user.toString() === req.user!._id.toString() && ['admin', 'moderator'].includes(m.role));
      if (!isMod) { res.status(403).json({ success: false, message: 'Not authorized' }); return; }
    }
    post.isActive = false;
    await post.save();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) { next(error); }
};

export const pinPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    const community = await Community.findById(post.community);
    const isMod = community?.members.some(m => m.user.toString() === req.user!._id.toString() && ['admin', 'moderator'].includes(m.role));
    if (!isMod && req.user!.role !== 'platformAdmin') { res.status(403).json({ success: false, message: 'Not authorized' }); return; }
    post.isPinned = !post.isPinned;
    await post.save();
    res.json({ success: true, data: { pinned: post.isPinned } });
  } catch (error) { next(error); }
};

export const reportPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) { res.status(404).json({ success: false, message: 'Post not found' }); return; }
    post.reportCount += 1;
    if (post.reportCount >= 5) post.isReported = true;
    await post.save();
    res.json({ success: true, message: 'Post reported' });
  } catch (error) { next(error); }
};

export const votePoll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || post.type !== 'poll') { res.status(400).json({ success: false, message: 'Invalid poll' }); return; }
    if (optionIndex < 0 || optionIndex >= post.pollOptions.length) { res.status(400).json({ success: false, message: 'Invalid option' }); return; }
    // Remove previous vote
    post.pollOptions.forEach(opt => { opt.votes = opt.votes.filter(id => id.toString() !== req.user!._id.toString()); });
    post.pollOptions[optionIndex].votes.push(req.user!._id);
    await post.save();
    res.json({ success: true, data: { pollOptions: post.pollOptions } });
  } catch (error) { next(error); }
};
