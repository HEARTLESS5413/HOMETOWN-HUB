'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, MapPin, Calendar, Shield, MessageSquare, TrendingUp,
  Sparkles, Globe, Heart, Star, ArrowRight, ChevronRight,
  Zap, Trophy, Bell, Search, Palette, Wind, RefreshCw
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceFieldBackground (no SSR — p5.js needs browser)
const ForceFieldBackground = dynamic(
  () => import('@/components/effects/ForceFieldBackground').then(mod => mod.ForceFieldBackground),
  { ssr: false }
);

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const }
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const }
  }),
};

const stats = [
  { label: 'Communities', value: '10K+', icon: Users },
  { label: 'Active Users', value: '500K+', icon: Globe },
  { label: 'Events Organized', value: '25K+', icon: Calendar },
  { label: 'Cities Connected', value: '1000+', icon: MapPin },
];

const features = [
  { icon: Users, title: 'Community Spaces', desc: 'Create and join hometown communities. Connect with people who share your roots.', color: 'from-violet-500 to-indigo-500' },
  { icon: MessageSquare, title: 'Social Feed', desc: 'Share posts, announcements, and polls. Engage through likes, comments, and bookmarks.', color: 'from-blue-500 to-cyan-500' },
  { icon: Calendar, title: 'Event Management', desc: 'Organize local meetups, festivals, and workshops. RSVP and countdown to events.', color: 'from-emerald-500 to-teal-500' },
  { icon: Shield, title: 'Moderation Tools', desc: 'Community-driven moderation with admin dashboards and abuse reporting.', color: 'from-amber-500 to-orange-500' },
  { icon: Bell, title: 'Real-time Alerts', desc: 'Never miss updates with instant notifications for posts, events, and mentions.', color: 'from-pink-500 to-rose-500' },
  { icon: Trophy, title: 'Gamification', desc: 'Earn badges, contribution points, and climb community leaderboards.', color: 'from-purple-500 to-fuchsia-500' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Community Admin, Jaipur Connects', text: 'LokConnect helped us organize 50+ events for our hometown community. The engagement is incredible!', avatar: '👩‍💼' },
  { name: 'Rahul Verma', role: 'Member, Kerala Roots', text: 'I found people from my village living in Mumbai. We now meet every month thanks to LokConnect.', avatar: '👨‍💻' },
  { name: 'Anita Patel', role: 'Moderator, Gujarat Network', text: 'The moderation tools are amazing. Managing 5000+ members feels effortless.', avatar: '👩‍🔬' },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [forceFieldParams, setForceFieldParams] = useState({
    hue: 250,
    forceStrength: 12,
    magnifierRadius: 160,
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const randomizeField = useCallback(() => {
    setForceFieldParams({
      hue: Math.floor(Math.random() * 360),
      forceStrength: Math.floor(Math.random() * 20 + 5),
      magnifierRadius: Math.floor(Math.random() * 120 + 100),
    });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden noise-overlay">
      {/* ─── Navigation ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
      >
        <div
          className="max-w-7xl mx-auto glass-card px-6 py-3 flex items-center justify-between"
          style={{ opacity: Math.min(1, 0.7 + scrollY / 500) }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-shimmer">LokConnect</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium">Features</a>
            <a href="#communities" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium">Communities</a>
            <a href="#testimonials" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm !py-2 !px-5">Log In</Link>
            <Link href="/register" className="btn-primary text-sm !py-2 !px-5">Get Started</Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Section with Force Field ───────────────────────── */}
      <section className="hero-force-field">
        {/* Interactive Particle Background */}
        <div className="force-field-layer">
          <ForceFieldBackground
            hue={forceFieldParams.hue}
            saturation={90}
            spacing={10}
            density={2.0}
            minStroke={2}
            maxStroke={6}
            forceStrength={forceFieldParams.forceStrength}
            magnifierRadius={forceFieldParams.magnifierRadius}
            friction={0.9}
            restoreSpeed={0.05}
          />
        </div>

        {/* Gradient overlay to blend force field into sections below */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        </div>

        {/* Floating orbs for extra depth */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full bg-indigo-600/8 blur-[100px] animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-600/6 blur-[120px] animate-float-delayed" />
        </div>

        {/* Hero Content */}
        <div className="content-layer flex flex-col items-center justify-center min-h-screen px-4 pointer-events-none">
          <div className="text-center space-y-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="badge-pill mb-8 pointer-events-auto">
                <Sparkles className="w-4 h-4" />
                <span>Your Digital Hometown Ecosystem</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-9xl font-extrabold leading-[0.9] tracking-tight"
            >
              <span className="text-white text-glow-white block">Connect With</span>
              <span className="gradient-text-shimmer block mt-2">Your Roots</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
            >
              Join a hyperlocal network of communities from your city, village, or hometown.
              Share updates, organize events, and preserve your culture — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
            >
              <Link href="/register" className="btn-primary text-lg !py-4 !px-8 flex items-center gap-2 group">
                Join LokConnect
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="btn-secondary text-lg !py-4 !px-8 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Explore Features
              </a>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pointer-events-auto"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="glass-card-hero p-4 text-center">
                  <stat.icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ─── Interactive Force Field Controls ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="control-strip flex items-center gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-widest font-medium">
                <Palette className="w-3 h-3" /> Hue
              </div>
              <input
                type="range" min="0" max="360"
                value={forceFieldParams.hue}
                onChange={(e) => setForceFieldParams({ ...forceFieldParams, hue: parseInt(e.target.value) })}
                className="w-20"
              />
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-widest font-medium">
                <Wind className="w-3 h-3" /> Force
              </div>
              <input
                type="range" min="1" max="30"
                value={forceFieldParams.forceStrength}
                onChange={(e) => setForceFieldParams({ ...forceFieldParams, forceStrength: parseInt(e.target.value) })}
                className="w-20"
              />
            </div>

            <button
              onClick={randomizeField}
              className="p-2.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors border border-white/10 group"
              title="Randomize"
            >
              <RefreshCw className="w-4 h-4 text-white/60 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 scroll-indicator">
          <div className="w-6 h-10 border-2 border-white/15 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/30 rounded-full" />
          </div>
        </div>
      </section>

      {/* ─── Features Section ───────────────────────────────────── */}
      <section id="features" className="py-28 px-4 relative">
        <div className="section-divider mb-20" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="badge-pill mb-6 mx-auto">
              <Zap className="w-4 h-4" /> Powerful Features
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Build Community</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              From social feeds to event management, LokConnect provides the complete toolkit for hyperlocal networking.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                custom={i}
                className="glass-card p-6 card-hover group cursor-pointer relative overflow-hidden"
              >
                {/* Subtle gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                    style={{ background: `linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))` }}
                  >
                    <feature.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">{feature.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Community Showcase ──────────────────────────────────── */}
      <section id="communities" className="py-28 px-4 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold mb-4">
              Thriving <span className="gradient-text">Communities</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              Thousands of communities are already connecting, sharing, and growing together.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Jaipur Connects', members: '2.5K', category: 'City', level: '🥇', banner: 'from-pink-500 to-orange-400' },
              { name: 'Kerala Roots', members: '1.8K', category: 'State', level: '🥇', banner: 'from-green-500 to-emerald-400' },
              { name: 'Varanasi Heritage', members: '1.2K', category: 'Cultural', level: '🥈', banner: 'from-indigo-500 to-blue-400' },
            ].map((community, i) => (
              <motion.div
                key={community.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                custom={i}
                className="glass-card overflow-hidden card-hover"
              >
                <div className={`h-32 bg-gradient-to-r ${community.banner} relative`}>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg-card)]" />
                </div>
                <div className="p-5 -mt-8 relative">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex items-center justify-center text-2xl mb-3 shadow-lg">
                    {community.level}
                  </div>
                  <h3 className="font-semibold text-lg">{community.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {community.members}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {community.category}</span>
                  </div>
                  <button className="btn-primary w-full mt-4 !py-2 text-sm">Join Community</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">Community Leaders</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                custom={i}
                className="glass-card p-6 card-hover"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array(5).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center text-lg">{t.avatar}</div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────────────── */}
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-purple-600/4 to-transparent" />
        <div className="section-divider mb-20" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-4xl md:text-6xl font-bold mb-6">
            Ready to <span className="gradient-text-shimmer">Reconnect?</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Join thousands of communities and rediscover the power of local connections.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link href="/register" className="btn-primary text-lg !py-4 !px-10 inline-flex items-center gap-2 group">
              Start Your Journey
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-color)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold gradient-text">LokConnect</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">Your digital hometown ecosystem. Connecting communities, one click at a time.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Platform</h4>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <div><Link href="/communities" className="hover:text-[var(--text-primary)] transition-colors">Communities</Link></div>
                <div><Link href="/events" className="hover:text-[var(--text-primary)] transition-colors">Events</Link></div>
                <div><Link href="/discover" className="hover:text-[var(--text-primary)] transition-colors">Discover</Link></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <div><a href="#" className="hover:text-[var(--text-primary)] transition-colors">About</a></div>
                <div><a href="#" className="hover:text-[var(--text-primary)] transition-colors">Blog</a></div>
                <div><a href="#" className="hover:text-[var(--text-primary)] transition-colors">Careers</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <div><a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a></div>
                <div><a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms</a></div>
                <div><a href="#" className="hover:text-[var(--text-primary)] transition-colors">Security</a></div>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--border-color)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-muted)]">© 2026 LokConnect. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              <span>for communities</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
