'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventAPI, communityAPI } from '@/lib/api';
import { Event, Community } from '@/types';
import { formatDate, getCountdownText } from '@/lib/utils';
import { Calendar, MapPin, Users, Clock, Plus, Loader2, Timer, ChevronRight } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ community: '', title: '', description: '', date: '', time: '', location: '', category: 'social', maxParticipants: '' });

  useEffect(() => {
    loadEvents();
    loadUpcoming();
    loadCommunities();
  }, []);

  const loadEvents = async () => {
    try { setLoading(true); const res = await eventAPI.getAll(); setEvents(res.data.data.events); } catch {} finally { setLoading(false); }
  };

  const loadUpcoming = async () => {
    try { const res = await eventAPI.getUpcoming(); setUpcoming(res.data.data.events); } catch {}
  };

  const loadCommunities = async () => {
    try { const res = await communityAPI.getAll({ limit: '50' }); setCommunities(res.data.data.communities); } catch {}
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const data = { ...form, maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined };
      await eventAPI.create(data);
      setShowCreate(false);
      setForm({ community: '', title: '', description: '', date: '', time: '', location: '', category: 'social', maxParticipants: '' });
      loadEvents(); loadUpcoming();
    } catch {} finally { setCreating(false); }
  };

  const handleRSVP = async (id: string) => {
    try { await eventAPI.rsvp(id); loadEvents(); loadUpcoming(); } catch {}
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 pb-24 lg:pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Events</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Create Event</button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-5 mb-6">
            <h3 className="font-semibold mb-4">Create New Event</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <select value={form.community} onChange={e => setForm({ ...form, community: e.target.value })} className="input-field text-sm !py-2.5">
                <option value="">Select Community</option>
                {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field text-sm !py-2.5" placeholder="Event Title" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field text-sm !py-2.5" />
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input-field text-sm !py-2.5" />
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field text-sm !py-2.5" placeholder="Location" />
              <input value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} className="input-field text-sm !py-2.5" placeholder="Max Participants (optional)" type="number" />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field text-sm !py-2.5">
                {['meetup', 'festival', 'workshop', 'charity', 'sports', 'cultural', 'social', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-sm resize-none md:col-span-2" rows={3} placeholder="Description" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowCreate(false)} className="btn-secondary !py-2 !px-4 text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary !py-2 !px-4 text-sm">{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Event'}</button>
            </div>
          </motion.div>
        )}

        {/* Upcoming Events */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4"><Timer className="w-5 h-5 text-indigo-400" /> Upcoming</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {upcoming.slice(0, 4).map(event => (
                <motion.div key={event._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 card-hover">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white text-xs">
                        <span className="font-bold text-sm">{new Date(event.date).getDate()}</span>
                        <span className="text-[10px]">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{event.title}</h3>
                        <div className="text-xs text-[var(--text-muted)]">{(event.community as any)?.name}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getCountdownText(event.date)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.participantCount}</span>
                    </div>
                    <button onClick={() => handleRSVP(event._id)} className="btn-primary !py-1.5 !px-3 text-xs">RSVP</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <h2 className="text-lg font-semibold mb-4">All Events</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="glass-card p-5"><div className="skeleton w-full h-4 mb-2" /><div className="skeleton w-2/3 h-3" /></div>)}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16"><Calendar className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" /><h3 className="font-semibold mb-2">No events yet</h3><p className="text-sm text-[var(--text-muted)]">Create the first event for your community!</p></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {events.map(event => (
              <div key={event._id} className="glass-card p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex flex-col items-center justify-center text-indigo-400 text-xs">
                    <span className="font-bold">{new Date(event.date).getDate()}</span>
                    <span className="text-[10px]">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{event.title}</h3>
                    <div className="text-xs text-[var(--text-muted)]">{event.time} · {event.location}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px]">{event.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">{event.participantCount} attending</span>
                  <button onClick={() => handleRSVP(event._id)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">RSVP <ChevronRight className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
