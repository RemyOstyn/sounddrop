'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { LibraryWithDetails } from '@/types/database';
import { useLibraries } from '@/hooks/use-libraries';

interface DeleteLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  library: LibraryWithDetails | null;
  onSuccess?: () => void;
}

export function DeleteLibraryDialog({
  open,
  onOpenChange,
  library,
  onSuccess,
}: DeleteLibraryDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteLibrary } = useLibraries();

  const handleDelete = async () => {
    if (!library) return;

    try {
      setIsDeleting(true);
      const success = await deleteLibrary(library.id);
      
      if (success) {
        onOpenChange(false);
        onSuccess?.();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!library) return null;

  const sampleCount = library._count.samples;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900/95 to-gray-900/95 backdrop-blur-xl border-white/20 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2 text-red-400">
            <AlertTriangle size={20} />
            <span>Delete Library</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">&quot;{library.name}&quot;</span>?
            </p>
            
            {sampleCount > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-400">Warning</p>
                    <p className="text-red-300">
                      This will permanently delete{' '}
                      <span className="font-semibold">{sampleCount}</span>{' '}
                      {sampleCount === 1 ? 'sample' : 'samples'} in this library.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-white/80">
              This action cannot be undone. All samples, favorites, and associated data will be permanently removed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Delete Library
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}