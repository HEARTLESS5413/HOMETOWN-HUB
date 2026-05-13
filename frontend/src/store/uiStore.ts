import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  createCommunityModalOpen: boolean;
  editProfileModalOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setCreateCommunityModalOpen: (open: boolean) => void;
  setEditProfileModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  mobileMenuOpen: false,
  createCommunityModalOpen: false,
  editProfileModalOpen: false,

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('lokconnect_theme', newTheme);
      }
      return { theme: newTheme };
    }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setCreateCommunityModalOpen: (open) => set({ createCommunityModalOpen: open }),
  setEditProfileModalOpen: (open) => set({ editProfileModalOpen: open }),
}));
