'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { Mail, MapPin, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const ForceFieldBackground = dynamic(
  () => import('@/components/effects/ForceFieldBackground').then(mod => mod.ForceFieldBackground),
  { ssr: false }
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await authAPI.forgotPassword(email); setSent(true); } catch {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Force Field Background */}
      <div className="absolute inset-0 z-0">
        <ForceFieldBackground
          hue={200}
          saturation={70}
          spacing={14}
          density={2.0}
          minStroke={1.5}
          maxStroke={3.5}
          forceStrength={6}
          magnifierRadius={100}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white text-glow-white">Reset Password</h1>
            <p className="text-white/50 mt-2">Enter your email to receive a reset link</p>
          </div>

          <div className="glass-card-hero p-8">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-white">Check your email</h3>
                <p className="text-sm text-white/50">If an account exists with that email, we&apos;ve sent a reset link.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-white/60 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field !pl-12 !bg-white/5 !border-white/10 !text-white placeholder:!text-white/25 focus:!border-indigo-500/50"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                  </button>
                </motion.div>
              </form>
            )}
          </div>

          <p className="text-center mt-6 text-white/40 text-sm">
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center justify-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
