// ─── User Types ───────────────────────────────────────────────────────
export interface User {
  id: string;
  _id?: string;
  name: string;
  username: string;
  email: string;
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
  joinedCommunities: Community[];
  createdAt: string;
}

// ─── Community Types ──────────────────────────────────────────────────
export interface CommunityMember {
  user: User;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
}

export interface Community {
  _id: string;
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
  creator: User;
  members: CommunityMember[];
  memberCount: number;
  level: 'bronze' | 'silver' | 'gold';
  isActive: boolean;
  createdAt: string;
}

// ─── Post Types ───────────────────────────────────────────────────────
export interface PollOption {
  text: string;
  votes: string[];
}

export interface Post {
  _id: string;
  author: User;
  community: Community;
  content: string;
  images: string[];
  type: 'text' | 'image' | 'announcement' | 'poll';
  pollOptions: PollOption[];
  likes: string[];
  likeCount: number;
  commentCount: number;
  shares: number;
  bookmarks: string[];
  isPinned: boolean;
  createdAt: string;
}

// ─── Comment Types ────────────────────────────────────────────────────
export interface Comment {
  _id: string;
  author: User;
  post: string;
  content: string;
  parentComment?: string;
  likes: string[];
  likeCount: number;
  replies?: Comment[];
  createdAt: string;
}

// ─── Event Types ──────────────────────────────────────────────────────
export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  organizer: User;
  community: Community;
  banner?: string;
  maxParticipants?: number;
  participants: User[];
  participantCount: number;
  category: string;
  createdAt: string;
}

// ─── Notification Types ───────────────────────────────────────────────
export interface Notification {
  _id: string;
  recipient: string;
  sender?: User;
  type: 'post' | 'comment' | 'like' | 'event' | 'community' | 'follow' | 'announcement' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse {
  data?: {
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  } & T;
}

// ─── Admin Types ──────────────────────────────────────────────────────
export interface AdminStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalCommunities: number;
    totalPosts: number;
    totalEvents: number;
    pendingReports: number;
    newUsersThisMonth: number;
    newPostsThisWeek: number;
  };
  growthData: { date: string; users: number; posts: number }[];
  topCommunities: { name: string; memberCount: number; level: string; slug: string }[];
  categoryDistribution: { name: string; value: number }[];
}
