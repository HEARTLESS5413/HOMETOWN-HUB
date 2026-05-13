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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">Events</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20" style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}>
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-6 mb-8 border border-orange-500/20 shadow-xl shadow-orange-500/10">
            <h3 className="font-semibold text-lg mb-4 text-orange-500 flex items-center gap-2"><Calendar className="w-5 h-5" /> Create New Event</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <select value={form.community} onChange={e => setForm({ ...form, community: e.target.value })} className="input-field text-sm !py-3">
                <option value="">Select Community</option>
                {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field text-sm !py-3" placeholder="Event Title" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field text-sm !py-3" />
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input-field text-sm !py-3" />
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field text-sm !py-3" placeholder="Location" />
              <input value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} className="input-field text-sm !py-3" placeholder="Max Participants (optional)" type="number" />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field text-sm !py-3">
                {['meetup', 'festival', 'workshop', 'charity', 'sports', 'cultural', 'social', 'other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-sm resize-none md:col-span-2" rows={3} placeholder="Description" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-secondary !py-2 !px-6 text-sm font-medium">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary !py-2 !px-6 text-sm font-medium" style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}>{creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Event'}</button>
            </div>
          </motion.div>
        )}

        {/* Upcoming Events */}
        {upcoming.length > 0 && (
          <div className="mb-10">
            <h2 className="flex items-center gap-2 text-xl font-bold font-serif mb-4"><Timer className="w-5 h-5 text-orange-500" /> Upcoming</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {upcoming.slice(0, 4).map(event => (
                <motion.div key={event._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 card-hover border-t-4 border-t-orange-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex flex-col items-center justify-center text-white text-xs shadow-md">
                        <span className="font-bold text-lg leading-none">{new Date(event.date).getDate()}</span>
                        <span className="text-[10px] uppercase font-semibold tracking-wider mt-0.5">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[var(--text-primary)]">{event.title}</h3>
                        <div className="text-xs text-orange-500 font-medium">{(event.community as any)?.name}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                      <Clock className="w-3 h-3" /> {getCountdownText(event.date)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {event.participantCount} going</span>
                    </div>
                    <button onClick={() => handleRSVP(event._id)} className="btn-primary !py-1.5 !px-4 text-xs font-semibold shadow-md shadow-orange-500/20" style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}>RSVP</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <h2 className="text-xl font-bold font-serif mb-4">All Events</h2>
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">{Array(4).fill(0).map((_, i) => <div key={i} className="glass-card p-5"><div className="skeleton w-full h-4 mb-2" /><div className="skeleton w-2/3 h-3" /></div>)}</div>
        ) : events.length === 0 ? (
          <div className="glass-card p-12 text-center border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold font-serif mb-3 text-[var(--text-primary)]">No events scheduled</h3>
            <p className="text-base text-[var(--text-secondary)] max-w-sm mx-auto mb-6 leading-relaxed">
              Why not organize a cultural meetup or local gathering for your community?
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-secondary !px-8 font-medium border-orange-500/30 hover:bg-orange-500/10 text-orange-500">
              Create an Event
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map(event => (
              <div key={event._id} className="glass-card p-5 card-hover">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center text-orange-500 text-xs">
                    <span className="font-bold text-base leading-none">{new Date(event.date).getDate()}</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider mt-0.5">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">{event.title}</h3>
                    <div className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{event.time} · {event.location}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 text-[10px] font-semibold uppercase">{event.category}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">{event.participantCount} attending</span>
                  <button onClick={() => handleRSVP(event._id)} className="text-xs text-orange-500 hover:text-orange-400 font-bold flex items-center gap-1 uppercase tracking-wider">RSVP <ChevronRight className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
