'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Music, Shield, Heart, Sparkles } from 'lucide-react';
import { LoginButton } from '@/components/auth/login-button';
import { useAuth } from '@/hooks/use-auth';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized } = useAuth();
  
  const redirectTo = searchParams.get('redirectTo') || '/';
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, redirectTo, router]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-black to-pink-900/50" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
          animate={{
            background: [
              'linear-gradient(0deg, rgba(147,51,234,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              'linear-gradient(90deg, rgba(147,51,234,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              'linear-gradient(180deg, rgba(147,51,234,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              'linear-gradient(270deg, rgba(147,51,234,0.1) 0%, rgba(236,72,153,0.1) 100%)',
              'linear-gradient(0deg, rgba(147,51,234,0.1) 0%, rgba(236,72,153,0.1) 100%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Music size={24} className="text-white" />
              </div>
              <span className="text-3xl font-bold text-gradient">SoundDrop</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight">
                Your Sound
                <br />
                <span className="text-gradient">Universe</span>
                <br />
                Awaits
              </h1>
              <p className="text-xl text-white/70 max-w-md leading-relaxed">
                Discover, play, and organize the world&apos;s most creative audio samples. 
                Join thousands of creators sharing their sounds.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Heart, text: 'Save your favorite samples' },
                { icon: Shield, text: 'Secure Google authentication' },
                { icon: Sparkles, text: 'Create custom libraries' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3 text-white/80"
                >
                  <feature.icon size={20} className="text-purple-400" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Music size={20} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">SoundDrop</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="text-white/60">
              Sign in to access your favorites and libraries
            </p>
          </div>

          {/* Error/Message Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
            >
              {decodeURIComponent(error)}
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm"
            >
              {decodeURIComponent(message)}
            </motion.div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            <LoginButton
              size="lg"
              redirectTo={redirectTo}
              className="w-full"
            />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-white/60">
                  Secure authentication with Google
                </span>
              </div>
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-white/50 text-center">
              By signing in, you agree to our terms of service and privacy policy. 
              We&apos;ll never share your data without permission.
            </p>
          </div>

          {/* Bottom Link */}
          <div className="text-center pt-8">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              ← Continue browsing without signing in
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}