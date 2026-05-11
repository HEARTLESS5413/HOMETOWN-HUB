'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, Eye, EyeOff, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ForceFieldBackground = dynamic(
  () => import('@/components/effects/ForceFieldBackground').then(mod => mod.ForceFieldBackground),
  { ssr: false }
);

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/feed');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Force Field Background */}
      <div className="absolute inset-0 z-0">
        <ForceFieldBackground
          hue={230}
          saturation={80}
          spacing={12}
          density={2.0}
          minStroke={1.5}
          maxStroke={4}
          forceStrength={8}
          magnifierRadius={120}
        />
      </div>

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white text-glow-white">Welcome Back</h1>
            <p className="text-white/50 mt-2">Sign in to your LokConnect account</p>
          </div>

          {/* Form Card */}
          <div className="glass-card-hero p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field !pl-12 !bg-white/5 !border-white/10 !text-white placeholder:!text-white/25 focus:!border-indigo-500/50"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field !pl-12 !pr-12 !bg-white/5 !border-white/10 !text-white placeholder:!text-white/25 focus:!border-indigo-500/50"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between text-sm"
              >
                <label className="flex items-center gap-2 text-white/50">
                  <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                </button>
              </motion.div>
            </form>
          </div>

          <p className="text-center mt-6 text-white/40 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
