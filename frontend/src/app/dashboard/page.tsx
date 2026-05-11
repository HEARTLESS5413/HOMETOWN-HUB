'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { AdminStats } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Users, TrendingUp, MessageSquare, Calendar, AlertTriangle, BarChart3, Activity, Award, Loader2 } from 'lucide-react';

const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'platformAdmin') {
      router.push('/feed');
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try { const res = await adminAPI.getStats(); setStats(res.data.data); } catch {} finally { setLoading(false); }
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div></AppLayout>;
  if (!stats) return <AppLayout><div className="text-center py-16"><h2 className="text-xl font-bold">Unable to load dashboard</h2></div></AppLayout>;

  const statCards = [
    { label: 'Total Users', value: stats.overview.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Users', value: stats.overview.activeUsers, icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Communities', value: stats.overview.totalCommunities, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Posts', value: stats.overview.totalPosts, icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Events', value: stats.overview.totalEvents, icon: Calendar, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Pending Reports', value: stats.overview.pendingReports, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'New Users (30d)', value: stats.overview.newUsersThisMonth, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Posts This Week', value: stats.overview.newPostsThisWeek, icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-4 pb-24 lg:pb-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-indigo-400" /> Admin Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => (
            <div key={s.label} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
              </div>
              <div className="text-2xl font-bold">{s.value.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Growth Line Chart */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4">Growth Trend (7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#16163a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={false} name="New Users" />
                  <Line type="monotone" dataKey="posts" stroke="#a855f7" strokeWidth={2} dot={false} name="New Posts" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4">Community Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
                    {stats.categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#16163a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12 }} />
                  <Legend formatter={(v: string) => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Communities */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Top Communities</h3>
          <div className="space-y-3">
            {stats.topCommunities.map((c, i) => (
              <div key={c.slug} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all">
                <span className="text-lg font-bold text-[var(--text-muted)] w-6">#{i + 1}</span>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{c.name[0]}</div>
                <div className="flex-1"><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-[var(--text-muted)]">{c.memberCount} members</div></div>
                <span className="text-lg">{c.level === 'gold' ? '🥇' : c.level === 'silver' ? '🥈' : '🥉'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
