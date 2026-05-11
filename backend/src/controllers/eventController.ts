import { Request, Response, NextFunction } from 'express';
import Event from '../models/Event';
import Community from '../models/Community';
import User from '../models/User';
import Notification from '../models/Notification';
import ActivityLog from '../models/ActivityLog';
import { getPagination, getPointsForAction } from '../utils/helpers';

export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { community, title, description, date, endDate, time, location, maxParticipants, category, banner } = req.body;
    const comm = await Community.findById(community);
    if (!comm) { res.status(404).json({ success: false, message: 'Community not found' }); return; }
    const isMember = comm.members.some(m => m.user.toString() === req.user!._id.toString());
    if (!isMember) { res.status(403).json({ success: false, message: 'Join community first' }); return; }

    const event = await Event.create({
      title, description, date, endDate, time, location, maxParticipants, category, banner,
      organizer: req.user!._id, community,
      participants: [req.user!._id], participantCount: 1,
    });

    await User.findByIdAndUpdate(req.user!._id, { $inc: { contributionPoints: getPointsForAction('create_event') }, $addToSet: { badges: 'Event Organizer' } });
    await ActivityLog.create({ user: req.user!._id, action: 'create_event', targetType: 'event', targetId: event._id });

    // Notify community members
    const memberIds = comm.members.map(m => m.user).filter(id => id.toString() !== req.user!._id.toString());
    const notifications = memberIds.slice(0, 50).map(id => ({
      recipient: id, sender: req.user!._id, type: 'event' as const, title: 'New Event',
      message: `${req.user!.name} created "${title}" in ${comm.name}`, link: `/events/${event._id}`,
    }));
    if (notifications.length > 0) await Notification.insertMany(notifications);

    res.status(201).json({ success: true, data: { event } });
  } catch (error) { next(error); }
};

export const getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { skip, limit } = getPagination(parseInt(req.query.page as string) || 1, parseInt(req.query.limit as string) || 10);
    const filter: Record<string, unknown> = { isActive: true };
    if (req.query.community) filter.community = req.query.community;
    if (req.query.category) filter.category = req.query.category;

    const [events, total] = await Promise.all([
      Event.find(filter).populate('organizer', 'name username profilePicture').populate('community', 'name slug logo').sort({ date: 1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);
    res.json({ success: true, data: { events, pagination: { total, page: Math.floor(skip / limit) + 1, pages: Math.ceil(total / limit) } } });
  } catch (error) { next(error); }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name username profilePicture')
      .populate('community', 'name slug logo')
      .populate('participants', 'name username profilePicture');
    if (!event) { res.status(404).json({ success: false, message: 'Event not found' }); return; }
    res.json({ success: true, data: { event } });
  } catch (error) { next(error); }
};

export const rsvpEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404).json({ success: false, message: 'Event not found' }); return; }
    const userId = req.user!._id;
    const isParticipant = event.participants.some(id => id.toString() === userId.toString());

    if (isParticipant) {
      event.participants = event.participants.filter(id => id.toString() !== userId.toString());
      event.participantCount = Math.max(0, event.participantCount - 1);
    } else {
      if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
        res.status(400).json({ success: false, message: 'Event is full' }); return;
      }
      event.participants.push(userId);
      event.participantCount += 1;
      await User.findByIdAndUpdate(userId, { $inc: { contributionPoints: getPointsForAction('rsvp_event') } });
      if (event.organizer.toString() !== userId.toString()) {
        await Notification.create({ recipient: event.organizer, sender: userId, type: 'event', title: 'New RSVP', message: `${req.user!.name} is attending "${event.title}"`, link: `/events/${event._id}` });
      }
    }
    await event.save();
    res.json({ success: true, data: { attending: !isParticipant, participantCount: event.participantCount } });
  } catch (error) { next(error); }
};

export const getUpcoming = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await Event.find({ date: { $gte: new Date() }, isActive: true })
      .populate('organizer', 'name username profilePicture')
      .populate('community', 'name slug logo')
      .sort({ date: 1 }).limit(10);
    res.json({ success: true, data: { events } });
  } catch (error) { next(error); }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) { res.status(404).json({ success: false, message: 'Event not found' }); return; }
    if (event.organizer.toString() !== req.user!._id.toString() && req.user!.role !== 'platformAdmin') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    const updates: Record<string, unknown> = {};
    ['title', 'description', 'date', 'endDate', 'time', 'location', 'maxParticipants', 'category', 'banner'].forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const updated = await Event.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, data: { event: updated } });
  } catch (error) { next(error); }
};
