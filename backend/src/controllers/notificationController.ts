import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { getPagination } from '../utils/helpers';

export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, limit } = getPagination(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 20);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user!._id }).populate('sender', 'name username profilePicture').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ recipient: req.user!._id }),
      Notification.countDocuments({ recipient: req.user!._id, isRead: false }),
    ]);
    res.json({ success: true, data: { notifications, unreadCount, pagination: { total, page: Math.floor(skip / limit) + 1, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user!._id }, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany({ recipient: req.user!._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user!._id, isRead: false });
    res.json({ success: true, data: { count } });
  } catch (error) { next(error); }
};
