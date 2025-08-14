'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  TrendingUp, 
  Search, 
  Heart, 
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface MobileNavProps {
  className?: string;
}

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: TrendingUp, label: 'Trending', href: '/trending' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: Heart, label: 'Favorites', href: '/favorites', protected: true },
  { icon: Settings, label: 'Settings', href: '/settings', protected: true },
];

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars -- TODO: Will be used when search modal is implemented

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    // TODO: Open search modal
  };

  return (
    <>
      <motion.nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 md:hidden',
          'glass border-t border-white/10',
          'safe-area-pb',
          className
        )}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        
        <div className="relative px-4 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => { // Removed unused 'index' parameter
              const isActive = pathname === item.href;
              const isSearch = item.label === 'Search';
              
              return (
                <NavItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={isActive}
                  isProtected={item.protected}
                  isAuthenticated={isAuthenticated}
                  isInitialized={isInitialized}
                  onClick={isSearch ? handleSearchClick : undefined}
                />
              );
            })}
          </div>
        </div>

        {/* Upload FAB */}
        {isInitialized && (
          <motion.button
            onClick={() => {
              if (!isAuthenticated) {
                window.location.href = '/login?redirectTo=/upload';
              } else {
                window.location.href = '/upload';
              }
            }}
            className={cn(
              "absolute -top-6 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center",
              isAuthenticated 
                ? "gradient-primary" 
                : "bg-white/20 backdrop-blur-md border border-white/20"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <Plus size={20} className="text-white" />
            
            {/* Pulse animation only when authenticated */}
            {isAuthenticated && (
              <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
            )}
          </motion.button>
        )}
      </motion.nav>

      {/* Safe area padding helper */}
      <div className="h-20 md:hidden" /> {/* Spacer for fixed nav */}
    </>
  );
}

function NavItem({
  icon: Icon,
  label,
  href,
  isActive,
  isProtected = false,
  isAuthenticated = false,
  isInitialized = false,
  onClick
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
  isActive: boolean;
  isProtected?: boolean;
  isAuthenticated?: boolean;
  isInitialized?: boolean;
  onClick?: () => void;
}) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (isProtected && !isAuthenticated) {
      window.location.href = `/login?redirectTo=${encodeURIComponent(href)}`;
    }
  };
  const content = (
    <motion.div
      className={cn(
        'relative flex flex-col items-center justify-center p-2 rounded-lg min-w-[48px] min-h-[48px]',
        'transition-colors duration-200',
        isProtected && !isInitialized 
          ? 'text-white/30'
          : isProtected && !isAuthenticated
          ? 'text-white/50 active:text-white/70'
          : isActive 
          ? 'text-white' 
          : 'text-white/60 active:text-white'
      )}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Active background */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-lg"
          layoutId="mobileActiveTab"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Icon */}
      <Icon 
        size={20} 
        className={cn(
          'transition-colors duration-200',
          isActive ? 'text-white' : 'text-white/60'
        )} 
      />

      {/* Label */}
      <span className={cn(
        'text-xs font-medium mt-1 transition-colors duration-200',
        isActive ? 'text-white' : 'text-white/60'
      )}>
        {label}
      </span>

      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          className="absolute -top-1 w-1 h-1 bg-purple-400 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        />
      )}

      {/* Protected indicator */}
      {isProtected && !isActive && (
        <div className="absolute top-1 right-1">
          {!isInitialized ? (
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-30 animate-pulse" />
          ) : !isAuthenticated ? (
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full opacity-60" />
          ) : (
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-60" />
          )}
        </div>
      )}

      {/* Ripple effect */}
      <span className="absolute inset-0 rounded-lg overflow-hidden">
        <span className="ripple" />
      </span>
    </motion.div>
  );

  if (onClick || (isProtected && !isAuthenticated)) {
    return (
      <button onClick={handleClick} className="touch-manipulation">
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className="touch-manipulation">
      {content}
    </Link>
  );
}

// Compact mobile nav for specific screens
export function CompactMobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <motion.nav
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 md:hidden',
        'glass rounded-2xl border border-white/20',
        'px-4 py-2',
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-around">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className="p-3 rounded-xl"
                whileTap={{ scale: 0.9 }}
              >
                <item.icon 
                  size={20} 
                  className={cn(
                    isActive ? 'text-white' : 'text-white/60'
                  )} 
                />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}