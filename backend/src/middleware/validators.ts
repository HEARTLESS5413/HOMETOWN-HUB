import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

/**
 * Generic validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      res.status(400).json({ success: false, message: messages });
      return;
    }
    next();
  };
};

// ─── Auth Validators ──────────────────────────────────────────────────

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  username: Joi.string().trim().lowercase().min(3).max(30).pattern(/^[a-z0-9_]+$/).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required(),
  city: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  hometown: Joi.string().trim().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).max(128).required(),
});

// ─── User Validators ────────────────────────────────────────────────

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  bio: Joi.string().max(300).allow('').optional(),
  mobile: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  village: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  country: Joi.string().trim().optional(),
  hometown: Joi.string().trim().optional(),
  interests: Joi.array().items(Joi.string().trim()).optional(),
  occupation: Joi.string().trim().optional(),
  education: Joi.string().trim().optional(),
  socialLinks: Joi.object({
    twitter: Joi.string().uri().allow('').optional(),
    linkedin: Joi.string().uri().allow('').optional(),
    instagram: Joi.string().uri().allow('').optional(),
    facebook: Joi.string().uri().allow('').optional(),
    website: Joi.string().uri().allow('').optional(),
  }).optional(),
});

// ─── Community Validators ────────────────────────────────────────────

export const createCommunitySchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().min(10).max(1000).required(),
  city: Joi.string().trim().optional(),
  village: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  category: Joi.string()
    .valid('hometown', 'city', 'village', 'education', 'professional', 'cultural', 'sports', 'social', 'religious', 'other')
    .required(),
  privacy: Joi.string().valid('public', 'private').default('public'),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  rules: Joi.array().items(Joi.string().trim()).optional(),
});

// ─── Post Validators ────────────────────────────────────────────────

export const createPostSchema = Joi.object({
  community: Joi.string().required(),
  content: Joi.string().trim().min(1).max(5000).required(),
  type: Joi.string().valid('text', 'image', 'announcement', 'poll').default('text'),
  images: Joi.array().items(Joi.string()).optional(),
  pollOptions: Joi.array()
    .items(Joi.object({ text: Joi.string().trim().required() }))
    .when('type', { is: 'poll', then: Joi.array().min(2).max(6).required() }),
});

// ─── Comment Validators ─────────────────────────────────────────────

export const createCommentSchema = Joi.object({
  post: Joi.string().required(),
  content: Joi.string().trim().min(1).max(1000).required(),
  parentComment: Joi.string().optional().allow(null),
});

// ─── Event Validators ───────────────────────────────────────────────

export const createEventSchema = Joi.object({
  community: Joi.string().required(),
  title: Joi.string().trim().min(3).max(150).required(),
  description: Joi.string().trim().min(10).max(3000).required(),
  date: Joi.date().iso().required(),
  endDate: Joi.date().iso().optional(),
  time: Joi.string().required(),
  location: Joi.string().trim().required(),
  maxParticipants: Joi.number().integer().min(1).optional(),
  category: Joi.string()
    .valid('meetup', 'festival', 'workshop', 'charity', 'sports', 'cultural', 'social', 'other')
    .default('social'),
  banner: Joi.string().optional(),
});

// ─── Report Validators ──────────────────────────────────────────────

export const createReportSchema = Joi.object({
  targetType: Joi.string().valid('post', 'comment', 'user', 'community').required(),
  targetId: Joi.string().required(),
  reason: Joi.string()
    .valid('spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate', 'other')
    .required(),
  description: Joi.string().max(500).optional(),
});
