'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { userAPI } from '@/lib/api';
import { User } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { getInitials, getBadgeColor, formatDate } from '@/lib/utils';
import { MapPin, Briefcase, GraduationCap, Calendar, Trophy, Zap, Users, Edit3, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', occupation: '', education: '' });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (username) loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getByUsername(username);
      setProfile(res.data.data.user);
      setEditForm({ bio: res.data.data.user.bio || '', occupation: res.data.data.user.occupation || '', education: res.data.data.user.education || '' });
    } catch {} finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      await userAPI.updateProfile(editForm);
      setEditing(false);
      loadProfile();
    } catch {}
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div></AppLayout>;
  if (!profile) return <AppLayout><div className="text-center py-16"><h2 className="text-xl font-bold">User not found</h2></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-4 pb-24 lg:pb-4">
        {/* Profile Header */}
        <div className="glass-card overflow-hidden mb-6 border-0 shadow-xl shadow-orange-500/5">
          <div className="h-48 bg-gradient-to-r from-orange-500/80 via-amber-500/80 to-yellow-500/80 relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
          </div>
          <div className="px-8 pb-8 -mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-6">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 border-4 border-[var(--bg-card)] flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
                {profile.profilePicture ? <img src={profile.profilePicture} alt="" className="w-full h-full rounded-xl object-cover" /> : getInitials(profile.name)}
              </div>
              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">{profile.name}</h1>
                <p className="text-base text-orange-400 font-medium">@{profile.username}</p>
              </div>
              {isOwnProfile && (
                <button onClick={() => setEditing(!editing)} className="btn-secondary !py-2 !px-3 text-sm flex items-center gap-1">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4 bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border-color)]">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Edit3 className="w-5 h-5 text-orange-500" /> Edit Profile</h3>
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="input-field text-sm resize-none" rows={3} placeholder="Tell the community about yourself..." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={editForm.occupation} onChange={e => setEditForm({ ...editForm, occupation: e.target.value })} className="input-field text-sm !py-3" placeholder="Occupation (e.g. Software Engineer)" />
                  <input value={editForm.education} onChange={e => setEditForm({ ...editForm, education: e.target.value })} className="input-field text-sm !py-3" placeholder="Education (e.g. University of Delhi)" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => setEditing(false)} className="btn-secondary !py-2 !px-6 text-sm font-medium">Cancel</button>
                  <button onClick={handleSave} className="btn-primary !py-2 !px-6 text-sm font-medium" style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}>Save Changes</button>
                </div>
              </div>
            ) : (
              <>
                {profile.bio && <p className="text-sm text-[var(--text-secondary)] mb-3">{profile.bio}</p>}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                  {(profile.city || profile.hometown) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.city || profile.hometown}</span>}
                  {profile.occupation && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {profile.occupation}</span>}
                  {profile.education && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {profile.education}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {formatDate(profile.createdAt)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 flex items-center gap-4 card-hover">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{profile.contributionPoints}</div>
              <div className="text-sm text-[var(--text-muted)] font-medium">Points Earned</div>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 card-hover">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{profile.level}</div>
              <div className="text-sm text-[var(--text-muted)] font-medium">Current Level</div>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4 card-hover">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{profile.joinedCommunities?.length || 0}</div>
              <div className="text-sm text-[var(--text-muted)] font-medium">Communities Joined</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Badges</h3>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map(badge => (
                <span key={badge} className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge)}`}>{badge}</span>
              ))}
            </div>
          </div>
        )}

        {/* Communities */}
        {profile.joinedCommunities && profile.joinedCommunities.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3">Communities</h3>
            <div className="grid grid-cols-2 gap-3">
              {profile.joinedCommunities.map((c: any) => (
                <div key={c._id} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-all border border-[var(--border-color)] group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-lg font-bold shadow-md group-hover:scale-105 transition-transform">{c.name?.[0] || 'C'}</div>
                  <div><div className="text-base font-semibold text-[var(--text-primary)]">{c.name}</div><div className="text-xs text-orange-400 font-medium">{c.memberCount} members</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
