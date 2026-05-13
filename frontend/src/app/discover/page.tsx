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
          <Compass className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">Discover</h1>
        </div>

        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-field !pl-12 !py-4 text-base shadow-lg shadow-orange-500/5 focus:shadow-orange-500/10 border-[var(--glass-border)] focus:border-orange-500/50" placeholder="Search communities, events, people..." />
        </form>

        <div className="flex items-center gap-2 mb-6">
          {(['communities', 'events'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all ${tab === t ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)]'}`}>
              {t === 'communities' ? <><Users className="w-4 h-4 inline mr-2" /> Communities</> : <><Calendar className="w-4 h-4 inline mr-2" /> Events</>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array(6).fill(0).map((_, i) => <div key={i} className="glass-card p-4"><div className="skeleton w-full h-20 mb-2 rounded-lg" /><div className="skeleton w-2/3 h-4 mb-1" /><div className="skeleton w-1/2 h-3" /></div>)}</div>
        ) : tab === 'communities' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(c => (
              <Link key={c._id} href={`/communities/${c.slug}`} className="glass-card overflow-hidden group card-hover flex flex-col border-0 shadow-lg shadow-orange-500/5">
                <div className="h-16 bg-gradient-to-r from-orange-500/80 to-amber-500/80 w-full relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
                </div>
                <div className="p-5 pt-0 flex-1 flex flex-col">
                  <div className="flex items-end justify-between mb-3 -mt-8 relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 border-4 border-[var(--bg-card)] flex items-center justify-center text-white text-2xl font-bold shadow-md group-hover:scale-105 transition-transform">{c.name[0]}</div>
                  </div>
                  <div className="mb-2">
                    <div className="font-bold text-lg text-[var(--text-primary)] leading-tight">{c.name}</div>
                    <div className="text-xs text-orange-400 font-medium">{c.memberCount} members</div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 flex-1">{c.description}</p>
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--border-color)]">
                    <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-500 text-xs font-semibold capitalize">{c.category}</span>
                    {c.city && <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-medium ml-auto"><MapPin className="w-3.5 h-3.5" />{c.city}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map(e => (
              <div key={e._id} className="glass-card p-5 card-hover border-l-4 border-l-orange-500">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center text-orange-500 text-sm">
                    <span className="font-bold text-lg leading-none">{new Date(e.date).getDate()}</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider mt-0.5">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div>
                    <div className="font-bold text-base text-[var(--text-primary)] mb-1">{e.title}</div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {e.participantCount} attending</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
