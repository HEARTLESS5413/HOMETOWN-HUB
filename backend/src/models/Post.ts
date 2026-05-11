import mongoose, { Document, Schema } from 'mongoose';

export interface IPollOption {
  text: string;
  votes: mongoose.Types.ObjectId[];
}

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  content: string;
  images: string[];
  type: 'text' | 'image' | 'announcement' | 'poll';
  pollOptions: IPollOption[];
  likes: mongoose.Types.ObjectId[];
  likeCount: number;
  commentCount: number;
  shares: number;
  bookmarks: mongoose.Types.ObjectId[];
  isPinned: boolean;
  isReported: boolean;
  reportCount: number;
  isActive: boolean;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    images: [{ type: String }],
    type: {
      type: String,
      enum: ['text', 'image', 'announcement', 'poll'],
      default: 'text',
    },
    pollOptions: [
      {
        text: { type: String },
        votes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPinned: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ isPinned: -1, createdAt: -1 });
postSchema.index({ content: 'text' });

export default mongoose.model<IPost>('Post', postSchema);
