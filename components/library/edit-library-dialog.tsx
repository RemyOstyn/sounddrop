'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Edit3, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Category, LibraryWithDetails } from '@/types/database';
import { useUpload } from '@/hooks/use-upload';
import { useLibraries } from '@/hooks/use-libraries';
import { validateImageFile, createImagePreview } from '@/lib/upload-utils';
import { cn } from '@/lib/utils';

const editLibrarySchema = z.object({
  name: z.string().min(1, 'Library name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  categoryId: z.string().min(1, 'Category is required'),
  isPublic: z.boolean(),
});

type EditLibraryForm = z.infer<typeof editLibrarySchema>;

interface EditLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  library: LibraryWithDetails | null;
  categories: Category[];
  onSuccess?: (library: LibraryWithDetails) => void;
}

export function EditLibraryDialog({
  open,
  onOpenChange,
  library,
  categories,
  onSuccess,
}: EditLibraryDialogProps) {
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keepCurrentIcon, setKeepCurrentIcon] = useState(true);
  
  const { uploadIcon } = useUpload();
  const { updateLibrary } = useLibraries();

  const form = useForm<EditLibraryForm>({
    resolver: zodResolver(editLibrarySchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      isPublic: true,
    },
  });

  // Update form when library changes
  useEffect(() => {
    if (library) {
      form.reset({
        name: library.name,
        description: library.description || '',
        categoryId: library.categoryId,
        isPublic: library.isPublic,
      });
      setKeepCurrentIcon(true);
      setIconFile(null);
      if (iconPreview) {
        URL.revokeObjectURL(iconPreview);
        setIconPreview(null);
      }
    }
  }, [library, form, iconPreview]);

  const handleIconUpload = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.error('Invalid icon file:', validation.error);
      return;
    }

    try {
      const preview = await createImagePreview(file);
      setIconFile(file);
      setIconPreview(preview);
      setKeepCurrentIcon(false);
    } catch (error) {
      console.error('Failed to create preview:', error);
    }
  }, []);

  const handleIconDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleIconUpload(file);
    }
  }, [handleIconUpload]);

  const handleIconSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleIconUpload(file);
    }
  }, [handleIconUpload]);

  const removeIcon = useCallback(() => {
    setIconFile(null);
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
      setIconPreview(null);
    }
    setKeepCurrentIcon(false);
  }, [iconPreview]);

  const restoreCurrentIcon = useCallback(() => {
    setIconFile(null);
    if (iconPreview) {
      URL.revokeObjectURL(iconPreview);
      setIconPreview(null);
    }
    setKeepCurrentIcon(true);
  }, [iconPreview]);

  const onSubmit = async (data: EditLibraryForm) => {
    if (!library) return;

    try {
      setIsSubmitting(true);

      let iconUrl: string | null | undefined = undefined;

      // Handle icon updates
      if (iconFile) {
        // Upload new icon
        const uploadedIconUrl = await uploadIcon(iconFile, library.id);
        if (!uploadedIconUrl) {
          return; // Upload failed
        }
        iconUrl = uploadedIconUrl;
      } else if (!keepCurrentIcon) {
        // Remove current icon
        iconUrl = null;
      }
      // If keepCurrentIcon is true, we don't include iconUrl in the update

      // Create update data
      interface UpdateData {
        name: string;
        description: string | null;
        categoryId: string;
        isPublic: boolean;
        iconUrl?: string | null;
      }

      const updateData: UpdateData = {
        name: data.name,
        description: data.description || null,
        categoryId: data.categoryId,
        isPublic: data.isPublic,
      };

      // Only include iconUrl if we want to change it
      if (!keepCurrentIcon) {
        updateData.iconUrl = iconUrl;
      }

      // Update library
      const updatedLibrary = await updateLibrary(library.id, updateData);

      if (updatedLibrary) {
        onOpenChange(false);
        onSuccess?.(updatedLibrary);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  if (!library) return null;

  const currentIconUrl = library.iconUrl;
  const displayIconUrl = keepCurrentIcon ? currentIconUrl : iconPreview;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900/95 to-gray-900/95 backdrop-blur-xl border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit3 size={20} />
            <span>Edit Library</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Icon Upload */}
            <div className="space-y-2">
              <Label>Library Icon</Label>
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                  displayIconUrl
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-white/20 hover:border-white/40 bg-white/10'
                )}
                onDrop={handleIconDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {displayIconUrl ? (
                  <div className="relative">
                    <img
                      src={displayIconUrl}
                      alt="Library icon"
                      className="w-20 h-20 mx-auto rounded-lg object-cover"
                    />
                    <div className="flex justify-center space-x-1 mt-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeIcon}
                      >
                        <X size={12} className="mr-1" />
                        Remove
                      </Button>
                      {!keepCurrentIcon && currentIconUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={restoreCurrentIcon}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon size={32} className="mx-auto text-white/60" />
                    <div className="text-sm text-white/80">
                      Drop an image here or{' '}
                      <label className="text-purple-400 hover:text-purple-300 cursor-pointer">
                        browse
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleIconSelect}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-white/60">
                      PNG, JPG, WEBP up to 2MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Library Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Library Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter library name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select a category" className="placeholder:text-white/50" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-900/95 border-white/20 text-white">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="hover:bg-white/10 focus:bg-white/10">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your library..."
                      className="bg-white/10 border-white/20 resize-none text-white placeholder:text-white/50"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visibility */}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-900/95 border-white/20 text-white">
                      <SelectItem value="true" className="hover:bg-white/10 focus:bg-white/10">Public - Anyone can see and play</SelectItem>
                      <SelectItem value="false" className="hover:bg-white/10 focus:bg-white/10">Private - Only you can access</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Library'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}