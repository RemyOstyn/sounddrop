'use client';

import { motion } from 'framer-motion';
import { LibraryWithDetails } from '@/types/database';
import { LibraryCard } from './library-card';
import { cn } from '@/lib/utils';

interface LibraryGridProps {
  libraries: LibraryWithDetails[];
  view?: 'grid' | 'list';
  showActions?: boolean;
  showCreator?: boolean;
  onLibraryClick?: (library: LibraryWithDetails) => void;
  onLibraryEdit?: (library: LibraryWithDetails) => void;
  onLibraryDelete?: (library: LibraryWithDetails) => void;
  onLibraryUpload?: (library: LibraryWithDetails) => void;
  className?: string;
}

export function LibraryGrid({
  libraries,
  view = 'grid',
  showActions = true,
  showCreator = false,
  onLibraryClick,
  onLibraryEdit,
  onLibraryDelete,
  onLibraryUpload,
  className,
}: LibraryGridProps) {
  if (libraries.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        view === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4',
        className
      )}
    >
      {libraries.map((library) => (
        <motion.div
          key={library.id}
          variants={itemVariants}
        >
          <LibraryCard
            library={library}
            view={view}
            showActions={showActions}
            showCreator={showCreator}
            onClick={() => onLibraryClick?.(library)}
            onEdit={() => onLibraryEdit?.(library)}
            onDelete={() => onLibraryDelete?.(library)}
            onUpload={() => onLibraryUpload?.(library)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}