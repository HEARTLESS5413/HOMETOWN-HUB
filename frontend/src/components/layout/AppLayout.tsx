'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import {
  Home, Users, Calendar, Bell, Search, Settings, LogOut, Menu, X,
  MapPin, Sun, Moon, User, BarChart3, Compass, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInitials } from '@/lib/utils';
import CreateCommunityModal from '@/components/modals/CreateCommunityModal';

const navItems = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/communities', icon: Users, label: 'Communities' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/notifications', icon: Bell, label: 'Alerts' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, loadUser, logout } = useAuthStore();
  const { theme, toggleTheme, mobileMenuOpen, setMobileMenuOpen, setCreateCommunityModalOpen } = useUIStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center animate-pulse shadow-lg shadow-orange-500/20">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="text-[var(--text-muted)]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 glass-card !rounded-none border-t-0 border-x-0">
        <div className="h-full max-w-[1400px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-[var(--text-secondary)]">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/feed" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text hidden sm:block font-serif">LokConnect</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input type="text" placeholder="Search communities, people, events..." className="input-field !py-2 !pl-10 text-sm !rounded-xl" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-secondary)]">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/notifications" className="relative p-2 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-secondary)]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full pulse-dot" />
            </Link>
            <Link href={`/profile/${user.username}`} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                ) : getInitials(user.name)}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Mobile Menu ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 h-full bg-[var(--bg-primary)] border-r border-[var(--border-color)] p-4 pt-20">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? 'bg-orange-500/10 text-orange-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
                {user.role === 'platformAdmin' && (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard' ? 'bg-orange-500/10 text-orange-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}>
                    <BarChart3 className="w-5 h-5" /> Dashboard
                  </Link>
                )}
              </nav>
              
              <button 
                onClick={() => { setMobileMenuOpen(false); setCreateCommunityModalOpen(true); }} 
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}
              >
                <Plus className="w-5 h-5" /> Create Community
              </button>

              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-4 w-full">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex pt-16">
        {/* ─── Sidebar (Desktop) ──────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-64px)] sticky top-16 border-r border-[var(--border-color)] p-4">
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === item.href ? 'bg-orange-500/10 text-orange-500 glow' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            {user.role === 'platformAdmin' && (
              <Link href="/dashboard"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard' ? 'bg-orange-500/10 text-orange-500' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'}`}>
                <BarChart3 className="w-5 h-5" /> Admin Dashboard
              </Link>
            )}
          </nav>

          <button 
            onClick={() => setCreateCommunityModalOpen(true)} 
            className="btn-primary w-full my-4 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}
          >
            <Plus className="w-5 h-5" /> Create Community
          </button>

          {/* User card */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.name}</div>
                <div className="text-xs text-[var(--text-muted)] truncate">@{user.username}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">⚡ {user.contributionPoints} pts</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium">{user.level}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-2">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </aside>

        {/* ─── Main Content ──────────────────────────────────── */}
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>

      {/* ─── Mobile Bottom Nav ───────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-card !rounded-none !rounded-t-2xl border-b-0 border-x-0">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${pathname === item.href ? 'text-orange-500' : 'text-[var(--text-muted)]'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Global Modals */}
      <CreateCommunityModal />
    </div>
  );
}
