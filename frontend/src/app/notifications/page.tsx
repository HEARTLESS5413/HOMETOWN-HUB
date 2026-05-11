'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationAPI } from '@/lib/api';
import { Notification } from '@/types';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { Bell, Check, CheckCheck, MessageSquare, Heart, Calendar, Users, Megaphone, Loader2 } from 'lucide-react';

const typeIcons: Record<string, typeof Bell> = {
  post: MessageSquare, comment: MessageSquare, like: Heart, event: Calendar,
  community: Users, announcement: Megaphone, system: Bell, follow: Users,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch {} finally { setLoading(false); }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 pb-24 lg:pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">{unreadCount} new</span>}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="glass-card p-4"><div className="flex items-center gap-3"><div className="skeleton w-10 h-10 rounded-xl" /><div className="flex-1 space-y-2"><div className="skeleton w-3/4 h-3" /><div className="skeleton w-1/2 h-2" /></div></div></div>)}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16"><Bell className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" /><h3 className="font-semibold mb-2">No notifications yet</h3><p className="text-sm text-[var(--text-muted)]">You&apos;ll see updates here when there&apos;s activity.</p></div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <motion.div key={n._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  className={`glass-card p-4 flex items-start gap-3 cursor-pointer transition-all hover:bg-[var(--bg-card-hover)] ${!n.isRead ? 'border-l-2 border-l-indigo-500' : 'opacity-70'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!n.isRead ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[var(--bg-card-hover)] text-[var(--text-muted)]'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{n.title}</div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1">{formatRelativeTime(n.createdAt)}</div>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 pulse-dot" />}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
