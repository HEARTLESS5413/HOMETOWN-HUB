import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  mobile?: string;
  profilePicture?: string;
  bio?: string;
  city?: string;
  village?: string;
  state?: string;
  country?: string;
  hometown?: string;
  interests: string[];
  occupation?: string;
  education?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  role: 'user' | 'moderator' | 'communityAdmin' | 'platformAdmin';
  badges: string[];
  contributionPoints: number;
  level: string;
  isVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastActive: Date;
  joinedCommunities: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    mobile: { type: String, trim: true },
    profilePicture: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
    city: { type: String, trim: true },
    village: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    hometown: { type: String, trim: true },
    interests: [{ type: String, trim: true }],
    occupation: { type: String, trim: true },
    education: { type: String, trim: true },
    socialLinks: {
      twitter: String,
      linkedin: String,
      instagram: String,
      facebook: String,
      website: String,
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'communityAdmin', 'platformAdmin'],
      default: 'user',
    },
    badges: [{ type: String }],
    contributionPoints: { type: Number, default: 0 },
    level: { type: String, default: 'Newcomer' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastActive: { type: Date, default: Date.now },
    joinedCommunities: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ city: 1 });
userSchema.index({ hometown: 1 });
userSchema.index({ state: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update contribution level based on points
userSchema.pre('save', function (next) {
  const points = this.contributionPoints;
  if (points >= 1000) this.level = 'Legend';
  else if (points >= 500) this.level = 'Champion';
  else if (points >= 200) this.level = 'Contributor';
  else if (points >= 50) this.level = 'Active';
  else this.level = 'Newcomer';
  next();
});

export default mongoose.model<IUser>('User', userSchema);
