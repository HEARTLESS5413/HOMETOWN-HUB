'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MapPin, Tag, Shield, Loader2, Image as ImageIcon } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'hometown', 'city', 'village', 'education', 'professional',
  'cultural', 'sports', 'social', 'religious', 'other'
];

export default function CreateCommunityModal() {
  const { createCommunityModalOpen, setCreateCommunityModalOpen } = useUIStore();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'hometown',
    privacy: 'public',
    city: '',
    state: '',
    tags: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!createCommunityModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.post('/communities', {
        ...form,
        tags: tagsArray
      });
      setCreateCommunityModalOpen(false);
      router.push(`/communities/${res.data.data.community.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCreateCommunityModalOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-gradient-to-r from-[rgba(234,88,12,0.1)] to-transparent">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] font-serif">Create a Community</h2>
            <button
              onClick={() => setCreateCommunityModalOpen(false)}
              className="p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <form id="create-community-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" /> Community Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Jaipur Royals, Tech Enthusiasts"
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this community about?"
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="input-field cursor-pointer appearance-none bg-[var(--bg-card)]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-500" /> Privacy
                  </label>
                  <select
                    value={form.privacy}
                    onChange={e => setForm({ ...form, privacy: e.target.value })}
                    className="input-field cursor-pointer appearance-none bg-[var(--bg-card)]"
                  >
                    <option value="public">Public (Anyone can join and view)</option>
                    <option value="private">Private (Approval required)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" /> City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-500" /> Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. food, culture, history"
                  className="input-field"
                />
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateCommunityModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-community-form"
              disabled={loading}
              className="btn-primary min-w-[120px] flex justify-center"
              style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Community'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
