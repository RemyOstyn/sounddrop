'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
  variant?: 'default' | 'compact';
}

const STORAGE_KEY = 'sounddrop-preferred-view';

export function ViewToggle({
  view,
  onViewChange,
  className,
  variant = 'default'
}: ViewToggleProps) {
  // Persist view preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'grid' || saved === 'list')) {
      onViewChange(saved);
    }
  }, [onViewChange]);

  const handleViewChange = (newView: 'grid' | 'list') => {
    onViewChange(newView);
    localStorage.setItem(STORAGE_KEY, newView);
  };

  if (variant === 'compact') {
    return (
      <CompactViewToggle
        view={view}
        onViewChange={handleViewChange}
        className={className}
      />
    );
  }

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="relative glass rounded-lg p-1 border border-white/10">
        <motion.div
          className="absolute inset-y-1 bg-white/10 rounded-md"
          layout
          animate={{
            x: view === 'grid' ? 0 : 36,
            width: 36
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        <div className="relative flex">
          <ViewToggleButton
            isActive={view === 'grid'}
            onClick={() => handleViewChange('grid')}
            icon={<LayoutGrid size={16} />}
            label="Grid"
          />
          
          <ViewToggleButton
            isActive={view === 'list'}
            onClick={() => handleViewChange('list')}
            icon={<List size={16} />}
            label="List"
          />
        </div>
      </div>
      
      {/* Label */}
      <div className="text-xs text-white/60 ml-3">
        View: <span className="text-white/80 capitalize">{view}</span>
      </div>
    </div>
  );
}

function ViewToggleButton({
  isActive,
  onClick,
  icon,
  label
}: {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative z-10 flex items-center justify-center w-9 h-9 rounded-md transition-colors duration-200',
        isActive 
          ? 'text-white' 
          : 'text-white/50 hover:text-white/70'
      )}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${label.toLowerCase()} view`}
      title={`${label} view`}
    >
      {icon}
    </motion.button>
  );
}

function CompactViewToggle({
  view,
  onViewChange,
  className
}: {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={() => onViewChange(view === 'grid' ? 'list' : 'grid')}
      className={cn(
        'p-2 rounded-lg glass glass-hover border border-white/10 transition-colors duration-200',
        'text-white/70 hover:text-white',
        className
      )}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch to ${view === 'grid' ? 'list' : 'grid'} view`}
    >
      <motion.div
        key={view}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {view === 'grid' ? <List size={16} /> : <Grid3X3 size={16} />}
      </motion.div>
    </motion.button>
  );
}

// Hook for managing view state
export function useViewToggle(initialView: 'grid' | 'list' = 'grid') {
  const [view, setView] = useState<'grid' | 'list'>(initialView);

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'grid' || saved === 'list')) {
      setView(saved);
    }
  }, []);

  const toggleView = () => {
    const newView = view === 'grid' ? 'list' : 'grid';
    setView(newView);
    localStorage.setItem(STORAGE_KEY, newView);
  };

  const setViewAndPersist = (newView: 'grid' | 'list') => {
    setView(newView);
    localStorage.setItem(STORAGE_KEY, newView);
  };

  return {
    view,
    toggleView,
    setView: setViewAndPersist,
    isGridView: view === 'grid',
    isListView: view === 'list'
  };
}