import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lokconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('lokconnect_token');
      localStorage.removeItem('lokconnect_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: Record<string, string>) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ─── User API ─────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  getByUsername: (username: string) => api.get(`/users/username/${username}`),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
  updateAvatar: (url: string) => api.put('/users/avatar', { profilePicture: url }),
  search: (params: Record<string, string>) => api.get('/users/search', { params }),
};

// ─── Community API ────────────────────────────────────────────────────
export const communityAPI = {
  create: (data: Record<string, unknown>) => api.post('/communities', data),
  getAll: (params?: Record<string, string>) => api.get('/communities', { params }),
  getBySlug: (slug: string) => api.get(`/communities/${slug}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/communities/${id}`, data),
  join: (id: string) => api.post(`/communities/${id}/join`),
  leave: (id: string) => api.post(`/communities/${id}/leave`),
  getMembers: (id: string) => api.get(`/communities/${id}/members`),
  getTrending: () => api.get('/communities/trending'),
};

// ─── Post API ─────────────────────────────────────────────────────────
export const postAPI = {
  create: (data: Record<string, unknown>) => api.post('/posts', data),
  getCommunityPosts: (id: string, params?: Record<string, string>) => api.get(`/posts/community/${id}`, { params }),
  getFeed: (params?: Record<string, string>) => api.get('/posts/feed', { params }),
  toggleLike: (id: string) => api.post(`/posts/${id}/like`),
  toggleBookmark: (id: string) => api.post(`/posts/${id}/bookmark`),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  pinPost: (id: string) => api.post(`/posts/${id}/pin`),
  votePoll: (id: string, optionIndex: number) => api.post(`/posts/${id}/vote`, { optionIndex }),
};

// ─── Comment API ──────────────────────────────────────────────────────
export const commentAPI = {
  create: (data: { post: string; content: string; parentComment?: string }) => api.post('/comments', data),
  getPostComments: (postId: string, params?: Record<string, string>) => api.get(`/comments/post/${postId}`, { params }),
  delete: (id: string) => api.delete(`/comments/${id}`),
  toggleLike: (id: string) => api.post(`/comments/${id}/like`),
};

// ─── Event API ────────────────────────────────────────────────────────
export const eventAPI = {
  create: (data: Record<string, unknown>) => api.post('/events', data),
  getAll: (params?: Record<string, string>) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.put(`/events/${id}`, data),
  rsvp: (id: string) => api.post(`/events/${id}/rsvp`),
  getUpcoming: () => api.get('/events/upcoming'),
};

// ─── Notification API ─────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (params?: Record<string, string>) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// ─── Admin API ────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  suspendUser: (id: string) => api.put(`/admin/users/${id}/suspend`),
  getReports: (params?: Record<string, string>) => api.get('/admin/reports', { params }),
  handleReport: (id: string, data: { status: string; reviewNote?: string }) => api.put(`/admin/reports/${id}`, data),
  suspendCommunity: (id: string) => api.put(`/admin/communities/${id}/suspend`),
};
