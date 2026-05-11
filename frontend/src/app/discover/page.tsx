'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { communityAPI, userAPI, eventAPI } from '@/lib/api';
import { Community, Event } from '@/types';
import Link from 'next/link';
import { Search, TrendingUp, Users, MapPin, Calendar, Compass, Filter } from 'lucide-react';

export default function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'communities' | 'events'>('communities');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'communities') {
        const res = await communityAPI.getAll(search ? { q: search } : undefined);
        setCommunities(res.data.data.communities);
      } else {
        const res = await eventAPI.getAll();
        setEvents(res.data.data.events);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadData(); };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 pb-24 lg:pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Compass className="w-7 h-7 text-indigo-400" />
          <h1 className="text-2xl font-bold">Discover</h1>
        </div>

        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field !pl-12 !py-3 text-sm" placeholder="Search communities, events, people..." />
        </form>

        <div className="flex items-center gap-2 mb-6">
          {(['communities', 'events'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-indigo-500/20 text-indigo-400' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}>
              {t === 'communities' ? <><Users className="w-4 h-4 inline mr-1" /> Communities</> : <><Calendar className="w-4 h-4 inline mr-1" /> Events</>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="glass-card p-4"><div className="skeleton w-full h-20 mb-2 rounded-lg" /><div className="skeleton w-2/3 h-4 mb-1" /><div className="skeleton w-1/2 h-3" /></div>)}</div>
        ) : tab === 'communities' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map(c => (
              <Link key={c._id} href={`/communities/${c.slug}`} className="glass-card p-4 card-hover">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{c.name[0]}</div>
                  <div><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-[var(--text-muted)]">{c.memberCount} members</div></div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px]">{c.category}</span>
                  {c.city && <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5"><MapPin className="w-3 h-3" />{c.city}</span>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map(e => (
              <div key={e._id} className="glass-card p-4 card-hover">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex flex-col items-center justify-center text-indigo-400 text-xs">
                    <span className="font-bold">{new Date(e.date).getDate()}</span>
                    <span className="text-[10px]">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div><div className="font-medium text-sm">{e.title}</div><div className="text-xs text-[var(--text-muted)]">{e.location} · {e.participantCount} attending</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
