import { create } from 'zustand';
import { User } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('lokconnect_token') : null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user, token } = res.data.data;
    localStorage.setItem('lokconnect_token', token);
    localStorage.setItem('lokconnect_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  register: async (data) => {
    const res = await authAPI.register(data);
    const { user, token } = res.data.data;
    localStorage.setItem('lokconnect_token', token);
    localStorage.setItem('lokconnect_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('lokconnect_token');
    localStorage.removeItem('lokconnect_user');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('lokconnect_token');
      if (!token) { set({ isLoading: false }); return; }
      
      const res = await authAPI.getMe();
      const user = res.data.data.user;
      
      // Update cache
      localStorage.setItem('lokconnect_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      // If it's specifically an unauthorized error, clear the session
      if (error?.response?.status === 401) {
        localStorage.removeItem('lokconnect_token');
        localStorage.removeItem('lokconnect_user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      } else {
        // If it's a network timeout (e.g., Render server spinning up) or 500 error,
        // DO NOT log the user out. Fallback to cached user data.
        const cachedUserStr = localStorage.getItem('lokconnect_user');
        const token = localStorage.getItem('lokconnect_token');
        
        if (cachedUserStr && token) {
          try {
            const cachedUser = JSON.parse(cachedUserStr);
            set({ user: cachedUser, token, isAuthenticated: true, isLoading: false });
          } catch {
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      }
    }
  },

  setUser: (user) => set({ user }),
}));
