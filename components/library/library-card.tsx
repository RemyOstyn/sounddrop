'use client';

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  MoreVertical, 
  Music, 
  Users, 
  Edit3, 
  Trash2, 
  Upload,
  Lock,
  Globe
} from 'lucide-react';
import { LibraryWithDetails } from '@/types/database';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface LibraryCardProps {
  library: LibraryWithDetails;
  view?: 'grid' | 'list';
  showActions?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpload?: () => void;
  className?: string;
}

function LibraryCardComponent({
  library,
  view = 'grid',
  showActions = true,
  onClick,
  onEdit,
  onDelete,
  onUpload,
  className,
}: LibraryCardProps) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  
  const isOwner = user?.id === library.userId;
  const canEdit = isOwner && showActions;
  
  if (view === 'list') {
    return (
      <Card className={cn('group hover:bg-white/5 transition-colors', className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {library.iconUrl && !imageError ? (
                <Image
                  src={library.iconUrl}
                  alt={library.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Music size={24} className="text-purple-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 
                    className="font-semibold text-white truncate cursor-pointer hover:text-purple-400 transition-colors"
                    onClick={onClick}
                  >
                    {library.name}
                  </h3>
                  
                  {library.description && (
                    <p className="text-sm text-white/60 truncate mt-1">
                      {library.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2 text-xs text-white/60">
                    <div className="flex items-center space-x-1">
                      <Music size={12} />
                      <span>{library._count.samples} samples</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users size={12} />
                      <span>{library.user.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {library.isPublic ? (
                        <>
                          <Globe size={12} />
                          <span>Public</span>
                        </>
                      ) : (
                        <>
                          <Lock size={12} />
                          <span>Private</span>
                        </>
                      )}
                    </div>
                    
                    <span className="px-2 py-1 bg-white/10 rounded text-xs">
                      {library.category.name}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onUpload && (
                        <>
                          <DropdownMenuItem onClick={onUpload}>
                            <Upload size={16} className="mr-2" />
                            Upload Sample
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                          <Edit3 size={16} className="mr-2" />
                          Edit Library
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={onDelete}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete Library
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Card className="group bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 overflow-hidden">
        <CardContent className="p-0">
          {/* Icon Container */}
          <div 
            className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center cursor-pointer relative overflow-hidden"
            onClick={onClick}
          >
            {library.iconUrl && !imageError ? (
              <Image
                src={library.iconUrl}
                alt={library.name}
                fill
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <Music size={48} className="text-purple-400" />
            )}
            
            {/* Overlay with actions for owners */}
            {canEdit && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="secondary">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    {onUpload && (
                      <>
                        <DropdownMenuItem onClick={onUpload}>
                          <Upload size={16} className="mr-2" />
                          Upload Sample
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit3 size={16} className="mr-2" />
                        Edit Library
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={onDelete}
                        className="text-red-400 focus:text-red-400"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete Library
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 
              className="font-semibold text-white truncate cursor-pointer hover:text-purple-400 transition-colors"
              onClick={onClick}
            >
              {library.name}
            </h3>
            
            {library.description && (
              <p className="text-sm text-white/60 line-clamp-2 mt-1">
                {library.description}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-1 text-xs text-white/60">
                <Music size={12} />
                <span>{library._count.samples} samples</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {library.isPublic ? (
                  <Globe size={12} className="text-green-400" />
                ) : (
                  <Lock size={12} className="text-yellow-400" />
                )}
                
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                  {library.category.name}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 mt-2 text-xs text-white/60">
              <Users size={12} />
              <span>by {library.user.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Export with memo for performance optimization
export const LibraryCard = memo(LibraryCardComponent);