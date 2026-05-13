'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { communityAPI } from '@/lib/api';
import { Community } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { Users, MapPin, Plus, Search, Filter, TrendingUp, Crown, Loader2 } from 'lucide-react';

const categories = ['all', 'hometown', 'city', 'village', 'education', 'professional', 'cultural', 'sports', 'social', 'religious'];

function CommunityCard({ community }: { community: Community }) {
  const levelEmoji = community.level === 'gold' ? '🥇' : community.level === 'silver' ? '🥈' : '🥉';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden card-hover border-0 shadow-lg shadow-orange-500/5 group">
      <div className="h-24 bg-gradient-to-r from-orange-500/80 to-amber-500/80 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
        {community.banner && <img src={community.banner} alt="" className="w-full h-full object-cover mix-blend-overlay opacity-60" />}
        <div className="absolute top-2 right-2 text-lg drop-shadow-md">{levelEmoji}</div>
      </div>
      <div className="p-5 -mt-8 relative">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 border-4 border-[var(--bg-card)] flex items-center justify-center text-white text-xl font-bold mb-3 shadow-md group-hover:scale-105 transition-transform">
          {community.logo ? <img src={community.logo} alt="" className="w-full h-full rounded-lg object-cover" /> : community.name[0]}
        </div>
        <Link href={`/communities/${community.slug}`}>
          <h3 className="font-bold text-base hover:text-orange-500 transition-colors">{community.name}</h3>
        </Link>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">{community.description}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-muted)] font-medium border-t border-[var(--border-color)] pt-3">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {community.memberCount}</span>
          {community.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {community.city}</span>}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-semibold uppercase tracking-wider">{community.category}</span>
          {community.privacy === 'private' && <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 text-[10px] font-semibold uppercase tracking-wider">Private</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunitiesPage() {
  const { setCreateCommunityModalOpen } = useUIStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [trending, setTrending] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    loadCommunities();
    loadTrending();
  }, [category]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { limit: '20' };
      if (category !== 'all') params.category = category;
      if (search) params.q = search;
      const res = await communityAPI.getAll(params);
      setCommunities(res.data.data.communities);
    } catch {} finally { setLoading(false); }
  };

  const loadTrending = async () => {
    try {
      const res = await communityAPI.getTrending();
      setTrending(res.data.data.communities);
    } catch {}
  };



  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadCommunities(); };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-4 pb-24 lg:pb-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">Communities</h1>
          <button onClick={() => setCreateCommunityModalOpen(true)} className="btn-primary !py-2.5 !px-5 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/20" style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}>
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field !pl-12 !py-3.5 text-base shadow-lg shadow-orange-500/5 focus:shadow-orange-500/10 focus:border-orange-500/50" placeholder="Search communities..." />
          </form>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-all ${category === c ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Trending */}
        {trending.length > 0 && (
          <div className="mb-10">
            <h2 className="flex items-center gap-2 text-xl font-bold font-serif mb-4"><TrendingUp className="w-5 h-5 text-orange-500" /> Trending Now</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {trending.slice(0, 5).map(c => (
                <Link key={c._id} href={`/communities/${c.slug}`} className="glass-card p-4 min-w-[240px] card-hover border-l-4 border-l-orange-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-md">{c.name[0]}</div>
                    <div>
                      <div className="font-bold text-base text-[var(--text-primary)]">{c.name}</div>
                      <div className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{c.memberCount} members</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Community Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden"><div className="skeleton h-24" /><div className="p-4 space-y-2"><div className="skeleton w-20 h-4" /><div className="skeleton w-full h-3" /><div className="skeleton w-1/2 h-3" /></div></div>
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="glass-card p-12 text-center border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-3 text-[var(--text-primary)]">No communities found</h3>
            <p className="text-base text-[var(--text-secondary)] max-w-sm mx-auto mb-6 leading-relaxed">
              We couldn't find any communities matching your criteria. Try a different search or create your own!
            </p>
            <button onClick={() => setCreateCommunityModalOpen(true)} className="btn-secondary !px-8 font-medium border-orange-500/30 hover:bg-orange-500/10 text-orange-500">
              Create Community
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(c => <CommunityCard key={c._id} community={c} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
