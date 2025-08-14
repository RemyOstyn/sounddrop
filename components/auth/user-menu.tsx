'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, FolderOpen, LogOut, Settings } from 'lucide-react'; // Removed unused 'User' import
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useUserSettings } from '@/hooks/use-user-settings';
import { getUserDisplayName, getUserInitials } from '@/lib/user-display-utils';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className }: UserMenuProps) {
  const { user, userAvatar, signOut } = useAuth();
  const { settings } = useUserSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Ensure portal mounts only on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position based on trigger button
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const menuHeight = 320; // Approximate menu height
      const menuWidth = 256; // w-64 = 16rem = 256px
      
      let top = rect.bottom + 8; // Default: below button
      let left = rect.right - menuWidth; // Default: align right edges
      
      // Vertical positioning - if not enough space below, position above
      if (rect.bottom + menuHeight > viewportHeight && rect.top > menuHeight) {
        top = rect.top - menuHeight - 8;
      }
      
      // Horizontal positioning - ensure menu stays within viewport
      if (rect.left < 300) {
        // Button is in sidebar, position menu closer to the button (right next to it)
        left = rect.right + 4; // Reduced gap from 8px to 4px
        // Align bottom of menu with bottom of button to prevent overflow
        top = rect.bottom - menuHeight;
      } else if (left < 0) {
        // Would overflow left edge
        left = 8;
      } else if (left + menuWidth > viewportWidth) {
        // Would overflow right edge
        left = viewportWidth - menuWidth - 8;
      }
      
      setMenuPosition({ top, left });
    }
  }, [isOpen]);

  if (!user) return null;

  // Get display values from database settings or fallback to email
  const userName = settings ? getUserDisplayName(settings) : (user.email?.split('@')[0] || 'User');
  const userInitials = settings ? getUserInitials(settings) : (user.email?.[0]?.toUpperCase() || '?');
  const userEmail = user.email || '';

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg glass-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={userName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-white">
              {userInitials}
            </span>
          )}
        </div>

        {/* User Name */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white truncate max-w-32">
            {userName}
          </div>
          <div className="text-xs text-white/60 truncate max-w-32">
            {userEmail}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown 
          size={16} 
          className={cn(
            'text-white/60 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </motion.button>

      {/* Dropdown Menu - Rendered via Portal */}
      {mounted && isOpen && menuPosition && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsOpen(false)}
              />

              {/* Menu */}
              <motion.div
                className="fixed z-[9999] w-64 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl overflow-hidden"
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0.95, 
                  y: -10 
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.95, 
                  y: -10 
                }}
                transition={{ duration: 0.15 }}
              >
              {/* User Info Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt={userName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium text-white">
                        {userInitials}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {userName}
                    </div>
                    <div className="text-xs text-white/60 truncate">
                      {userEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <MenuLink
                  href="/favorites"
                  icon={Heart}
                  label="Favorites"
                  onClick={() => setIsOpen(false)}
                />
                <MenuLink
                  href="/my-libraries"
                  icon={FolderOpen}
                  label="My Libraries"
                  onClick={() => setIsOpen(false)}
                />
                
                {/* Divider */}
                <div className="my-2 border-t border-white/10" />
                
                <MenuLink
                  href="/settings"
                  icon={Settings}
                  label="Settings"
                  onClick={() => setIsOpen(false)}
                />
                
                <MenuButton
                  icon={LogOut}
                  label="Sign Out"
                  onClick={handleSignOut}
                  className="text-red-400 hover:text-red-300"
                />
              </div>
            </motion.div>
          </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

interface MenuLinkProps {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
  className?: string;
}

function MenuLink({ href, icon: Icon, label, onClick, className }: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center space-x-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-150',
        className
      )}
    >
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  );
}

interface MenuButtonProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

function MenuButton({ icon: Icon, label, onClick, disabled, className }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center space-x-3 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-150 disabled:cursor-not-allowed',
        className
      )}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}