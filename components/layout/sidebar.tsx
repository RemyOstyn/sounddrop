'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  TrendingUp, 
  Search, 
  Heart, 
  FolderOpen, 
  Upload,
  ChevronRight,
  Music,
  Volume2,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { SearchCommand } from './search-command';
import { useAuth } from '@/hooks/use-auth';
import { UserMenu } from '@/components/auth/user-menu';
import { LoginButton } from '@/components/auth/login-button';
import { AuthLoading } from '@/components/auth/auth-loading';

interface SidebarProps {
  className?: string;
}

const mainNavItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: TrendingUp, label: 'Trending', href: '/trending' },
];

const userNavItems = [
  { icon: Heart, label: 'Favorites', href: '/favorites', protected: true },
  { icon: FolderOpen, label: 'My Libraries', href: '/my-libraries', protected: true },
  { icon: Upload, label: 'Upload', href: '/upload', protected: true },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('categories');

  // Close search on route change
  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);


  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 z-40',
          'glass border-r border-white/10',
          'flex flex-col overflow-hidden',
          'min-w-64 max-w-64', // Ensure consistent width
          className
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Music size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">SoundDrop</span>
          </Link>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg glass-hover text-white/70 hover:text-white transition-colors duration-200"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Search samples...</span>
            <div className="px-2 py-1 bg-white/10 rounded text-xs font-medium">
              ⌘K
            </div>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1">
          {/* Main Navigation */}
          <div className="px-4 space-y-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          {/* Categories */}
          <div className="mt-6">
            <SidebarSection
              title="Categories"
              isExpanded={expandedSection === 'categories'}
              onToggle={() => setExpandedSection(
                expandedSection === 'categories' ? null : 'categories'
              )}
            >
              <div className="space-y-1">
                {DEFAULT_CATEGORIES.map((category) => (
                  <NavItem
                    key={category.slug}
                    icon={(() => {
                      // Dynamic icon import would be better, but for now we'll use Volume2
                      return Volume2;
                    })()}
                    label={category.name}
                    href={`/category/${category.slug}`}
                    isActive={pathname === `/category/${category.slug}`}
                    isSubItem
                  />
                ))}
              </div>
            </SidebarSection>
          </div>

          {/* User Navigation */}
          <div className="mt-6">
            <SidebarSection title="My Sounds" isExpanded={true}>
              <div className="space-y-1">
                {userNavItems.map((item) => (
                  <NavItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    isActive={pathname === item.href}
                    isSubItem
                    protected={item.protected}
                    isAuthenticated={isAuthenticated}
                    isInitialized={isInitialized}
                  />
                ))}
              </div>
            </SidebarSection>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Auth Section */}
          {!isInitialized ? (
            <AuthLoading />
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <LoginButton variant="outline" size="sm" className="w-full justify-center" />
          )}

          {/* Settings (Future) */}
          <button className="w-full flex items-center space-x-3 p-3 rounded-lg glass-hover text-white/70 hover:text-white transition-colors duration-200 opacity-50 cursor-not-allowed">
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      </aside>

      {/* Search Modal */}
      <SearchCommand 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen}
      />

      {/* Keyboard shortcut listener */}
      <KeyboardShortcuts onSearch={() => setIsSearchOpen(true)} />
    </>
  );
}

function NavItem({
  icon: Icon,
  label,
  href,
  isActive,
  isSubItem = false,
  protected: isProtected = false,
  isAuthenticated = false,
  isInitialized = false
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
  isActive: boolean;
  isSubItem?: boolean;
  protected?: boolean;
  isAuthenticated?: boolean;
  isInitialized?: boolean;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (isProtected && !isAuthenticated) {
      e.preventDefault();
      window.location.href = `/login?redirectTo=${encodeURIComponent(href)}`;
    }
  };

  if (isProtected && !isAuthenticated) {
    return (
      <button onClick={handleClick} className="block w-full text-left">
        <motion.div
          className={cn(
            'group relative flex items-center space-x-3 p-2.5 rounded-lg transition-all duration-200',
            isSubItem ? 'ml-2 pl-3' : '',
            isProtected && !isInitialized 
              ? 'text-white/30 cursor-wait'
              : isProtected && !isAuthenticated
              ? 'text-white/50 hover:text-white/70 hover:bg-white/5 cursor-pointer'
              : isActive 
              ? 'glass-active text-white bg-white/10' 
              : 'text-white/70 hover:text-white hover:bg-white/5'
          )}
          whileHover={isProtected && !isAuthenticated ? { x: 1 } : { x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div
              className="absolute left-0 top-1/2 w-1 h-6 bg-gradient-primary rounded-r"
              layoutId="activeTab"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}

          <Icon 
            size={16} 
            className={cn(
              'transition-colors duration-200',
              isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
            )} 
          />
          <span className="font-medium flex-1">{label}</span>

          {/* Protected badge and auth status */}
          {isProtected && (
            <div className="flex items-center space-x-2">
              {!isInitialized ? (
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-30 animate-pulse" />
              ) : !isAuthenticated ? (
                <div className="text-xs text-white/40 font-medium">Login</div>
              ) : (
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-60" />
              )}
            </div>
          )}

          {/* Hover glow */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg opacity-50" />
          )}
        </motion.div>
      </button>
    );
  }

  return (
    <Link href={href} className="block w-full text-left">
      <motion.div
        className={cn(
          'group relative flex items-center space-x-3 p-2.5 rounded-lg transition-all duration-200',
          isSubItem ? 'ml-2 pl-3' : '',
          isProtected && !isInitialized 
            ? 'text-white/30 cursor-wait'
            : isProtected && !isAuthenticated
            ? 'text-white/50 hover:text-white/70 hover:bg-white/5 cursor-pointer'
            : isActive 
            ? 'glass-active text-white bg-white/10' 
            : 'text-white/70 hover:text-white hover:bg-white/5'
        )}
        whileHover={isProtected && !isAuthenticated ? { x: 1 } : { x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 w-1 h-6 bg-gradient-primary rounded-r"
            layoutId="activeTab"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        <Icon 
          size={16} 
          className={cn(
            'transition-colors duration-200',
            isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
          )} 
        />
        <span className="font-medium flex-1">{label}</span>

        {/* Protected badge and auth status */}
        {isProtected && (
          <div className="flex items-center space-x-2">
            {!isInitialized ? (
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-30 animate-pulse" />
            ) : !isAuthenticated ? (
              <div className="text-xs text-white/40 font-medium">Login</div>
            ) : (
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-60" />
            )}
          </div>
        )}

        {/* Hover glow */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg opacity-50" />
        )}
      </motion.div>
    </Link>
  );
}

function SidebarSection({
  title,
  children,
  isExpanded,
  onToggle
}: {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="px-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors duration-200"
      >
        {title}
        {onToggle && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={12} />
          </motion.div>
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeyboardShortcuts({ onSearch }: { onSearch: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearch]);

  return null;
}