import { Request, Response, NextFunction } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import Notification from '../models/Notification';
import User from '../models/User';
import { getPagination, getPointsForAction } from '../utils/helpers';

export const createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { post, content, parentComment } = req.body;
    const postDoc = await Post.findById(post);
    if (!postDoc) { res.status(404).json({ success: false, message: 'Post not found' }); return; }

    const comment = await Comment.create({ author: req.user!._id, post, content, parentComment: parentComment || null });
    await comment.populate('author', 'name username profilePicture level');

    postDoc.commentCount += 1;
    await postDoc.save();

    await User.findByIdAndUpdate(req.user!._id, { $inc: { contributionPoints: getPointsForAction('create_comment') } });

    if (postDoc.author.toString() !== req.user!._id.toString()) {
      await Notification.create({ recipient: postDoc.author, sender: req.user!._id, type: 'comment', title: 'New Comment', message: `${req.user!.name} commented on your post`, link: `/communities/${postDoc.community}` });
    }

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) { next(error); }
};

export const getPostComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, limit } = getPagination(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 20);
    const [comments, total] = await Promise.all([
      Comment.find({ post: req.params.id, isActive: true, parentComment: null })
        .populate('author', 'name username profilePicture level')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Comment.countDocuments({ post: req.params.id, isActive: true, parentComment: null }),
    ]);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id, isActive: true })
          .populate('author', 'name username profilePicture level')
          .sort({ createdAt: 1 }).limit(5);
        return { ...comment.toObject(), replies };
      })
    );

    res.json({ success: true, data: { comments: commentsWithReplies, pagination: { total, page: Math.floor(skip / limit) + 1, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) { res.status(404).json({ success: false, message: 'Comment not found' }); return; }
    if (comment.author.toString() !== req.user!._id.toString() && req.user!.role !== 'platformAdmin') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    comment.isActive = false;
    await comment.save();
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) { next(error); }
};

export const toggleCommentLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) { res.status(404).json({ success: false, message: 'Comment not found' }); return; }
    const userId = req.user!._id;
    const isLiked = comment.likes.some(id => id.toString() === userId.toString());
    if (isLiked) { comment.likes = comment.likes.filter(id => id.toString() !== userId.toString()); comment.likeCount -= 1; }
    else { comment.likes.push(userId); comment.likeCount += 1; }
    await comment.save();
    res.json({ success: true, data: { liked: !isLiked, likeCount: comment.likeCount } });
  } catch (error) { next(error); }
};
