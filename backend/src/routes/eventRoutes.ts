import { Router } from 'express';
import { createEvent, getEvents, getEventById, rsvpEvent, getUpcoming, updateEvent } from '../controllers/eventController';
import { protect } from '../middleware/auth';
import { validate, createEventSchema } from '../middleware/validators';

const router = Router();

router.get('/upcoming', getUpcoming);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, validate(createEventSchema), createEvent);
router.put('/:id', protect, updateEvent);
router.post('/:id/rsvp', protect, rsvpEvent);

export default router;
