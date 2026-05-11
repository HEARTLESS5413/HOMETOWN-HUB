import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  ip?: string;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'register',
        'login',
        'create_post',
        'create_comment',
        'like_post',
        'join_community',
        'leave_community',
        'create_community',
        'create_event',
        'rsvp_event',
        'update_profile',
        'report',
      ],
    },
    targetType: {
      type: String,
      enum: ['user', 'post', 'comment', 'community', 'event'],
    },
    targetId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  {
    timestamps: true,
  }
);

// TTL index - auto-delete logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
activityLogSchema.index({ user: 1, action: 1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
