'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function LogoutPage() {
  const router = useRouter();
  const { signOut, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const performSignOut = async () => {
      if (isAuthenticated) {
        await signOut();
      }
      
      // Redirect to home after a brief delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    };

    performSignOut();
  }, [isAuthenticated, signOut, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-md mx-auto"
      >
        {/* Icon */}
        <motion.div
          className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center"
          animate={isLoading ? {
            rotate: [0, 360],
          } : {
            scale: [1, 1.1, 1],
          }}
          transition={isLoading ? {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          } : {
            duration: 0.6,
            delay: 0.2,
          }}
        >
          {isLoading ? (
            <LogOut size={32} className="text-purple-400" />
          ) : (
            <CheckCircle size={32} className="text-green-400" />
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h1 className="text-2xl font-bold text-white">
            {isLoading ? 'Signing out...' : 'Signed out successfully'}
          </h1>
          <p className="text-white/60">
            {isLoading 
              ? 'We\'re securely signing you out'
              : 'You\'ve been signed out. Redirecting to home page...'
            }
          </p>
        </motion.div>

        {/* Progress indicator */}
        {!isLoading && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"
          />
        )}

        {/* Manual redirect button */}
        {!isLoading && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => router.push('/')}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Go to home page now →
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}