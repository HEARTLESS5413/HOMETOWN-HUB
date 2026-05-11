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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {post.author.profilePicture ? <img src={post.author.profilePicture} alt="" className="w-10 h-10 rounded-xl object-cover" /> : getInitials(post.author.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{post.author.name}</span>
              {post.isPinned && <Pin className="w-3 h-3 text-indigo-400" />}
              {post.type === 'announcement' && <Megaphone className="w-3 h-3 text-yellow-400" />}
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
              <button key={i} className="w-full text-left p-3 rounded-xl border border-[var(--border-color)] hover:border-indigo-500/30 relative overflow-hidden transition-all">
                <div className="absolute inset-0 bg-indigo-500/10 transition-all" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between text-sm">
                  <span>{opt.text}</span>
                  <span className="text-[var(--text-muted)]">{Math.round(pct)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-1">
          <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${isLiked ? 'text-red-400 bg-red-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400' : ''}`} />
            <span>{post.likeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-all">
            <MessageSquare className="w-4 h-4" />
            <span>{post.commentCount}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <button onClick={handleBookmark} className={`p-1.5 rounded-lg transition-all ${bookmarked ? 'text-indigo-400 bg-indigo-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}>
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-indigo-400' : ''}`} />
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
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            {communities.length > 0 && (
              <select value={selectedCommunity} onChange={(e) => setSelectedCommunity(e.target.value)} className="input-field !py-2 text-sm !rounded-lg max-w-[200px]">
                {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            )}
            <div className="flex items-center gap-1 ml-auto">
              {(['text', 'announcement', 'poll'] as const).map(t => (
                <button key={t} onClick={() => setPostType(t)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${postType === t ? 'bg-indigo-500/20 text-indigo-400' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}>
                  {t === 'text' ? 'Post' : t === 'announcement' ? '📢' : '📊'}
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
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)]"><ImageIcon className="w-5 h-5" /></button>
              <button className="p-2 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)]"><BarChart3 className="w-5 h-5" /></button>
            </div>
            <button onClick={handleCreatePost} disabled={posting || !newPostContent.trim()} className="btn-primary !py-2 !px-5 text-sm flex items-center gap-2">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Post</>}
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
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No posts yet</h3>
              <p className="text-sm text-[var(--text-muted)]">Join some communities and create your first post!</p>
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
