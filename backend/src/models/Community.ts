import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityMember {
  user: mongoose.Types.ObjectId;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
}

export interface ICommunity extends Document {
  name: string;
  slug: string;
  description: string;
  banner?: string;
  logo?: string;
  city?: string;
  village?: string;
  state?: string;
  country?: string;
  category: string;
  rules: string[];
  tags: string[];
  privacy: 'public' | 'private';
  creator: mongoose.Types.ObjectId;
  members: ICommunityMember[];
  memberCount: number;
  pendingRequests: mongoose.Types.ObjectId[];
  isActive: boolean;
  isSuspended: boolean;
  level: 'bronze' | 'silver' | 'gold';
}

const communitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    banner: { type: String, default: '' },
    logo: { type: String, default: '' },
    city: { type: String, trim: true },
    village: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'hometown',
        'city',
        'village',
        'education',
        'professional',
        'cultural',
        'sports',
        'social',
        'religious',
        'other',
      ],
    },
    rules: [{ type: String }],
    tags: [{ type: String, lowercase: true, trim: true }],
    privacy: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['member', 'moderator', 'admin'],
          default: 'member',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    memberCount: { type: Number, default: 1 },
    pendingRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    level: {
      type: String,
      enum: ['bronze', 'silver', 'gold'],
      default: 'bronze',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
communitySchema.index({ city: 1 });
communitySchema.index({ state: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ tags: 1 });
communitySchema.index({ 'members.user': 1 });
communitySchema.index({ name: 'text', description: 'text', tags: 'text' });

// Auto-update level based on member count
communitySchema.pre('save', function (next) {
  if (this.memberCount >= 500) this.level = 'gold';
  else if (this.memberCount >= 100) this.level = 'silver';
  else this.level = 'bronze';
  next();
});

export default mongoose.model<ICommunity>('Community', communitySchema);
