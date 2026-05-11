import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env';

/**
 * Generate JWT token for a user
 */
export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Generate a random token for password reset
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a reset token for storage
 */
export const hashResetToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Toxic word filter — basic spam/abuse detection
 */
const TOXIC_WORDS = [
  'spam', 'scam', 'fake', 'abuse',
  // Add more as needed — this is a configurable list
];

export const containsToxicContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return TOXIC_WORDS.some((word) => lowerText.includes(word));
};

/**
 * Calculate contribution points for an action
 */
export const getPointsForAction = (action: string): number => {
  const pointMap: Record<string, number> = {
    create_post: 5,
    create_comment: 2,
    like_post: 1,
    create_event: 10,
    join_community: 3,
    create_community: 15,
    rsvp_event: 2,
  };
  return pointMap[action] || 0;
};

/**
 * Generate a slug from a string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Paginate query helper
 */
export const getPagination = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: Math.min(limit, 50) };
};
