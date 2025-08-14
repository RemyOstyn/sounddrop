'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface LoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  redirectTo?: string;
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const variantClasses = {
  default: 'gradient-primary text-white shadow-lg hover:shadow-xl',
  outline: 'border border-white/20 text-white hover:bg-white/5',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
};

export function LoginButton({ 
  variant = 'default', 
  size = 'md', 
  redirectTo,
  className,
  children 
}: LoginButtonProps) {
  const { signInWithGoogle, isLoading, error } = useAuth();
  const [isClicked, setIsClicked] = useState(false);

  const handleSignIn = async () => {
    if (isLoading) return;
    
    setIsClicked(true);
    try {
      await signInWithGoogle(redirectTo);
    } catch (err) {
      console.error('Sign in failed:', err);
      setIsClicked(false);
    }
  };

  const isButtonLoading = isLoading || isClicked;

  return (
    <motion.button
      onClick={handleSignIn}
      disabled={isButtonLoading}
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
        'glass-hover',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background gradient animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
        animate={{
          x: isButtonLoading ? ['0%', '100%', '0%'] : '0%',
        }}
        transition={{
          duration: 2,
          repeat: isButtonLoading ? Infinity : 0,
          ease: 'linear',
        }}
      />
      
      <div className="relative flex items-center justify-center space-x-2">
        {isButtonLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <LogIn size={16} />
        )}
        <span>
          {children || (isButtonLoading ? 'Signing in...' : 'Continue with Google')}
        </span>
      </div>

      {/* Error state indicator */}
      {error && (
        <motion.div
          className="absolute -bottom-8 left-0 right-0 text-xs text-red-400 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
        </motion.div>
      )}
    </motion.button>
  );
}