'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { postAPI, communityAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Post, Community } from '@/types';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import {
  Heart, MessageSquare, Bookmark, Share2, MoreHorizontal, Pin,
  Image as ImageIcon, BarChart3, Megaphone, Send, Loader2, TrendingUp, Users
} from 'lucide-react';

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const { user } = useAuthStore();
  const isLiked = user ? post.likes.includes(user.id || user._id || '') : false;
  const isBookmarked = user ? post.bookmarks.includes(user.id || user._id || '') : false;
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmark = async () => {
    try {
      await postAPI.toggleBookmark(post._id);
      setBookmarked(!bookmarked);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            {post.author.profilePicture ? <img src={post.author.profilePicture} alt="" className="w-12 h-12 rounded-xl object-cover" /> : getInitials(post.author.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[var(--text-primary)] hover:text-orange-500 transition-colors cursor-pointer">{post.author.name}</span>
              {post.isPinned && <Pin className="w-3.5 h-3.5 text-orange-500" />}
              {post.type === 'announcement' && <Megaphone className="w-3.5 h-3.5 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-lg" />
          ))}
        </div>
      )}

      {/* Poll */}
      {post.type === 'poll' && post.pollOptions.length > 0 && (
        <div className="space-y-2">
          {post.pollOptions.map((opt, i) => {
            const totalVotes = post.pollOptions.reduce((sum, o) => sum + o.votes.length, 0);
            const pct = totalVotes > 0 ? (opt.votes.length / totalVotes) * 100 : 0;
            return (
              <button key={i} className="w-full text-left p-3 rounded-xl border border-[var(--border-color)] hover:border-orange-500/40 relative overflow-hidden transition-all group">
                <div className="absolute inset-0 bg-orange-500/10 transition-all" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between text-sm font-medium">
                  <span>{opt.text}</span>
                  <span className="text-[var(--text-muted)]">{Math.round(pct)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-red-400'}`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
            <span>{post.likeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-orange-400 transition-all">
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-orange-400 transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <button onClick={handleBookmark} className={`p-2 rounded-lg transition-all ${bookmarked ? 'text-orange-500 bg-orange-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-orange-400'}`}>
          <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-orange-500' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'announcement' | 'poll'>('text');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFeed();
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const res = await communityAPI.getAll({ limit: '50' });
      setCommunities(res.data.data.communities);
      if (res.data.data.communities.length > 0) setSelectedCommunity(res.data.data.communities[0]._id);
    } catch {}
  };

  const loadFeed = async (p = 1) => {
    try {
      setLoading(true);
      const res = await postAPI.getFeed({ page: p.toString(), limit: '10' });
      if (p === 1) setPosts(res.data.data.posts);
      else setPosts(prev => [...prev, ...res.data.data.posts]);
      setHasMore(res.data.data.pagination.page < res.data.data.pagination.pages);
      setPage(p);
    } catch {} finally { setLoading(false); }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedCommunity) return;
    setPosting(true);
    try {
      const res = await postAPI.create({ community: selectedCommunity, content: newPostContent, type: postType });
      setPosts([res.data.data.post, ...posts]);
      setNewPostContent('');
    } catch {} finally { setPosting(false); }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await postAPI.toggleLike(postId);
      setPosts(posts.map(p => p._id === postId ? { ...p, likeCount: res.data.data.likeCount, likes: res.data.data.liked ? [...p.likes, 'me'] : p.likes.filter((l: string) => l !== 'me') } : p));
    } catch {}
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-4 pb-24 lg:pb-4">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>

        {/* Post Composer */}
        <div className="glass-card p-6 mb-6 border-0 shadow-lg shadow-orange-500/5">
          <div className="flex items-center gap-3 mb-4">
            {communities.length > 0 && (
              <select value={selectedCommunity} onChange={(e) => setSelectedCommunity(e.target.value)} className="input-field !py-2 text-sm !rounded-lg max-w-[200px] font-medium bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-orange-500/50 transition-colors">
                {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            )}
            <div className="flex items-center gap-1 ml-auto bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
              {(['text', 'announcement', 'poll'] as const).map(t => (
                <button key={t} onClick={() => setPostType(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${postType === t ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                  {t === 'text' ? 'Post' : t === 'announcement' ? 'Alert' : 'Poll'}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's happening in your community?"
            className="input-field !rounded-xl resize-none min-h-[80px] text-sm"
            rows={3}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-orange-500/10 text-[var(--text-muted)] hover:text-orange-500 transition-colors border border-[var(--border-color)]"><ImageIcon className="w-5 h-5" /></button>
              <button className="p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-orange-500/10 text-[var(--text-muted)] hover:text-orange-500 transition-colors border border-[var(--border-color)]"><BarChart3 className="w-5 h-5" /></button>
            </div>
            <button onClick={handleCreatePost} disabled={posting || !newPostContent.trim()} className="btn-primary !py-2.5 !px-6 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/20" style={{ background: 'linear-gradient(135deg, #ea580c, #fb923c)' }}>
              {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Post Update</>}
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {loading && posts.length === 0 ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-5 space-y-3">
                <div className="flex items-center gap-3"><div className="skeleton w-10 h-10 rounded-xl" /><div className="space-y-2"><div className="skeleton w-24 h-3" /><div className="skeleton w-16 h-2" /></div></div>
                <div className="skeleton w-full h-4" /><div className="skeleton w-3/4 h-4" />
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-3 text-[var(--text-primary)]">Your feed is quiet</h3>
              <p className="text-base text-[var(--text-secondary)] max-w-sm mx-auto mb-6 leading-relaxed">
                Connect with your roots. Join communities from your hometown or city to see local updates and stories here.
              </p>
              <button onClick={() => window.location.href = '/discover'} className="btn-secondary !px-8 font-medium border-orange-500/30 hover:bg-orange-500/10 text-orange-500">
                Discover Communities
              </button>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} onLike={handleLike} />)
          )}
        </div>

        {hasMore && posts.length > 0 && (
          <button onClick={() => loadFeed(page + 1)} className="btn-secondary w-full mt-4 text-sm" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Load More'}
          </button>
        )}
      </div>
    </AppLayout>
  );
}
