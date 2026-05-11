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
        <div className="glass-card overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-indigo-600/50 to-purple-600/50" />
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-[var(--bg-card)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {profile.profilePicture ? <img src={profile.profilePicture} alt="" className="w-24 h-24 rounded-2xl object-cover" /> : getInitials(profile.name)}
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <p className="text-sm text-[var(--text-muted)]">@{profile.username}</p>
              </div>
              {isOwnProfile && (
                <button onClick={() => setEditing(!editing)} className="btn-secondary !py-2 !px-3 text-sm flex items-center gap-1">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="input-field text-sm resize-none" rows={2} placeholder="Bio" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={editForm.occupation} onChange={e => setEditForm({ ...editForm, occupation: e.target.value })} className="input-field text-sm !py-2" placeholder="Occupation" />
                  <input value={editForm.education} onChange={e => setEditForm({ ...editForm, education: e.target.value })} className="input-field text-sm !py-2" placeholder="Education" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditing(false)} className="btn-secondary !py-1.5 !px-3 text-xs">Cancel</button>
                  <button onClick={handleSave} className="btn-primary !py-1.5 !px-3 text-xs">Save</button>
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
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
            <div className="text-lg font-bold">{profile.contributionPoints}</div>
            <div className="text-xs text-[var(--text-muted)]">Points</div>
          </div>
          <div className="glass-card p-4 text-center">
            <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-lg font-bold">{profile.level}</div>
            <div className="text-xs text-[var(--text-muted)]">Level</div>
          </div>
          <div className="glass-card p-4 text-center">
            <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold">{profile.joinedCommunities?.length || 0}</div>
            <div className="text-xs text-[var(--text-muted)]">Communities</div>
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
                <div key={c._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{c.name?.[0] || 'C'}</div>
                  <div><div className="text-sm font-medium">{c.name}</div><div className="text-[10px] text-[var(--text-muted)]">{c.memberCount} members</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
