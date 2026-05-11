'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { communityAPI } from '@/lib/api';
import { Community } from '@/types';
import { Users, MapPin, Plus, Search, Filter, TrendingUp, Crown, Loader2 } from 'lucide-react';

const categories = ['all', 'hometown', 'city', 'village', 'education', 'professional', 'cultural', 'sports', 'social', 'religious'];

function CommunityCard({ community }: { community: Community }) {
  const levelEmoji = community.level === 'gold' ? '🥇' : community.level === 'silver' ? '🥈' : '🥉';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden card-hover">
      <div className="h-24 bg-gradient-to-r from-indigo-600/40 to-purple-600/40 relative">
        {community.banner && <img src={community.banner} alt="" className="w-full h-full object-cover" />}
        <div className="absolute top-2 right-2 text-lg">{levelEmoji}</div>
      </div>
      <div className="p-4 -mt-6 relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-[var(--bg-card)] flex items-center justify-center text-white text-lg font-bold mb-2">
          {community.logo ? <img src={community.logo} alt="" className="w-12 h-12 rounded-xl object-cover" /> : community.name[0]}
        </div>
        <Link href={`/communities/${community.slug}`}>
          <h3 className="font-semibold text-sm hover:text-indigo-400 transition-colors">{community.name}</h3>
        </Link>
        <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{community.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {community.memberCount}</span>
          {community.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {community.city}</span>}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-medium">{community.category}</span>
          {community.privacy === 'private' && <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-medium">Private</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [trending, setTrending] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', category: 'hometown', city: '', privacy: 'public', tags: '' });
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async () => {
    setCreating(true);
    try {
      const data = { ...createForm, tags: createForm.tags.split(',').map(t => t.trim()).filter(Boolean) };
      await communityAPI.create(data);
      setShowCreate(false);
      setCreateForm({ name: '', description: '', category: 'hometown', city: '', privacy: 'public', tags: '' });
      loadCommunities();
    } catch {} finally { setCreating(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadCommunities(); };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-4 pb-24 lg:pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Communities</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>

        {/* Create Community Form */}
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-5 mb-6">
            <h3 className="font-semibold mb-4">Create New Community</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="input-field text-sm !py-2.5" placeholder="Community Name" />
              <input value={createForm.city} onChange={e => setCreateForm({ ...createForm, city: e.target.value })} className="input-field text-sm !py-2.5" placeholder="City / Village" />
              <select value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} className="input-field text-sm !py-2.5">
                {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <select value={createForm.privacy} onChange={e => setCreateForm({ ...createForm, privacy: e.target.value })} className="input-field text-sm !py-2.5">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <input value={createForm.tags} onChange={e => setCreateForm({ ...createForm, tags: e.target.value })} className="input-field text-sm !py-2.5 md:col-span-2" placeholder="Tags (comma separated)" />
              <textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="input-field text-sm resize-none md:col-span-2" rows={3} placeholder="Description (min 10 chars)" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowCreate(false)} className="btn-secondary !py-2 !px-4 text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Community'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field !pl-10 !py-2.5 text-sm" placeholder="Search communities..." />
          </form>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${category === c ? 'bg-indigo-500/20 text-indigo-400' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Trending */}
        {trending.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><TrendingUp className="w-5 h-5 text-indigo-400" /> Trending</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {trending.slice(0, 5).map(c => (
                <Link key={c._id} href={`/communities/${c.slug}`} className="glass-card p-4 min-w-[200px] card-hover">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{c.name[0]}</div>
                    <div>
                      <div className="font-medium text-sm">{c.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{c.memberCount} members</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Community Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden"><div className="skeleton h-24" /><div className="p-4 space-y-2"><div className="skeleton w-20 h-4" /><div className="skeleton w-full h-3" /><div className="skeleton w-1/2 h-3" /></div></div>
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-16"><Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" /><h3 className="font-semibold mb-2">No communities found</h3><p className="text-sm text-[var(--text-muted)]">Try a different search or create your own!</p></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map(c => <CommunityCard key={c._id} community={c} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
