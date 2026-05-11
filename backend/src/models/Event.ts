import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  time: string;
  location: string;
  organizer: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  banner?: string;
  maxParticipants?: number;
  participants: mongoose.Types.ObjectId[];
  participantCount: number;
  category: string;
  isActive: boolean;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: { type: Date },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    banner: { type: String, default: '' },
    maxParticipants: { type: Number },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    participantCount: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['meetup', 'festival', 'workshop', 'charity', 'sports', 'cultural', 'social', 'other'],
      default: 'social',
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
eventSchema.index({ community: 1, date: -1 });
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<IEvent>('Event', eventSchema);
