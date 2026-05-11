'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { communityAPI, postAPI } from '@/lib/api';
import { Community, Post } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import {
  Users, MapPin, Shield, Settings, Heart, MessageSquare, Bookmark,
  Share2, Crown, Send, Loader2, LogOut, UserPlus, Pin, Calendar
} from 'lucide-react';

export default function CommunityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuthStore();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'feed' | 'members' | 'about'>('feed');
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  const isMember = community?.members.some(m => (m.user as any)?._id === (user?.id || user?._id) || (m.user as any) === (user?.id || user?._id));
  const isAdmin = community?.members.some(m => ((m.user as any)?._id === (user?.id || user?._id) || (m.user as any) === (user?.id || user?._id)) && m.role === 'admin');

  useEffect(() => {
    if (slug) {
      loadCommunity();
    }
  }, [slug]);

  const loadCommunity = async () => {
    try {
      setLoading(true);
      const res = await communityAPI.getBySlug(slug);
      setCommunity(res.data.data.community);
      const postRes = await postAPI.getCommunityPosts(res.data.data.community._id);
      setPosts(postRes.data.data.posts);
    } catch {} finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!community) return;
    try {
      await communityAPI.join(community._id);
      loadCommunity();
    } catch {}
  };

  const handleLeave = async () => {
    if (!community) return;
    try {
      await communityAPI.leave(community._id);
      loadCommunity();
    } catch {}
  };

  const handlePost = async () => {
    if (!newPost.trim() || !community) return;
    setPosting(true);
    try {
      const res = await postAPI.create({ community: community._id, content: newPost, type: 'text' });
      setPosts([res.data.data.post, ...posts]);
      setNewPost('');
    } catch {} finally { setPosting(false); }
  };

  const handleLike = async (postId: string) => {
    try {
      await postAPI.toggleLike(postId);
      const postRes = await postAPI.getCommunityPosts(community!._id);
      setPosts(postRes.data.data.posts);
    } catch {}
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div></AppLayout>;
  if (!community) return <AppLayout><div className="text-center py-16"><h2 className="text-xl font-bold">Community not found</h2></div></AppLayout>;

  const levelEmoji = community.level === 'gold' ? '🥇' : community.level === 'silver' ? '🥈' : '🥉';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-24 lg:pb-4">
        {/* Banner */}
        <div className="h-48 md:h-56 bg-gradient-to-r from-indigo-600/50 to-purple-600/50 relative">
          {community.banner && <img src={community.banner} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent" />
        </div>

        {/* Community Info */}
        <div className="px-4 -mt-16 relative z-10">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-[var(--bg-primary)] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {community.logo ? <img src={community.logo} alt="" className="w-20 h-20 rounded-2xl object-cover" /> : community.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{community.name}</h1>
                <span>{levelEmoji}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{community.description}</p>
            </div>
            {isMember ? (
              <button onClick={handleLeave} className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2 text-red-400 hover:!border-red-400">
                <LogOut className="w-4 h-4" /> Leave
              </button>
            ) : (
              <button onClick={handleJoin} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Join
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-6">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {community.memberCount} members</span>
            {community.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {community.city}</span>}
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs">{community.category}</span>
            {community.privacy === 'private' && <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs flex items-center gap-1"><Shield className="w-3 h-3" /> Private</span>}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[var(--border-color)] mb-6">
            {(['feed', 'members', 'about'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === 'feed' && (
            <div className="space-y-4">
              {isMember && (
                <div className="glass-card p-4">
                  <textarea value={newPost} onChange={e => setNewPost(e.target.value)} className="input-field text-sm resize-none" rows={2} placeholder="Share something with the community..." />
                  <div className="flex justify-end mt-2">
                    <button onClick={handlePost} disabled={posting} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2">
                      {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Post</>}
                    </button>
                  </div>
                </div>
              )}
              {posts.map(post => (
                <motion.div key={post._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{getInitials(post.author?.name || 'U')}</div>
                    <div>
                      <span className="font-medium text-sm">{post.author?.name}</span>
                      <div className="text-xs text-[var(--text-muted)]">{formatRelativeTime(post.createdAt)}</div>
                    </div>
                    {post.isPinned && <Pin className="w-3 h-3 text-indigo-400 ml-auto" />}
                  </div>
                  <p className="text-sm">{post.content}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                    <button onClick={() => handleLike(post._id)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]">
                      <Heart className="w-3.5 h-3.5" /> {post.likeCount}
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]">
                      <MessageSquare className="w-3.5 h-3.5" /> {post.commentCount}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'members' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {community.members.map((m, i) => (
                <div key={i} className="glass-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials((m.user as any)?.name || 'U')}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{(m.user as any)?.name || 'User'}</div>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      {m.role === 'admin' && <Crown className="w-3 h-3 text-yellow-400" />}
                      {m.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'about' && (
            <div className="glass-card p-6 space-y-4">
              <div><h3 className="font-semibold mb-2">Description</h3><p className="text-sm text-[var(--text-secondary)]">{community.description}</p></div>
              {community.rules.length > 0 && (
                <div><h3 className="font-semibold mb-2">Rules</h3><ol className="list-decimal list-inside space-y-1 text-sm text-[var(--text-secondary)]">{community.rules.map((r, i) => <li key={i}>{r}</li>)}</ol></div>
              )}
              {community.tags.length > 0 && (
                <div><h3 className="font-semibold mb-2">Tags</h3><div className="flex flex-wrap gap-2">{community.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs">#{t}</span>)}</div></div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
