'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, FolderOpen, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
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
import { validateImageFile } from '@/lib/upload-utils';
import { createImagePreview } from '@/lib/upload-utils';
import { cn } from '@/lib/utils';

const createLibrarySchema = z.object({
  name: z.string().min(1, 'Library name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  categoryId: z.string().min(1, 'Category is required'),
});

type CreateLibraryForm = z.infer<typeof createLibrarySchema>;

interface CreateLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess?: (library: LibraryWithDetails) => void;
}

export function CreateLibraryDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: CreateLibraryDialogProps) {
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { uploadIcon } = useUpload();
  const { createLibrary } = useLibraries();

  const form = useForm<CreateLibraryForm>({
    resolver: zodResolver(createLibrarySchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
    },
  });

  const handleIconUpload = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      // You might want to show an error toast here
      console.error('Invalid icon file:', validation.error);
      return;
    }

    try {
      const preview = await createImagePreview(file);
      setIconFile(file);
      setIconPreview(preview);
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
  }, [iconPreview]);

  const onSubmit = async (data: CreateLibraryForm) => {
    try {
      setIsSubmitting(true);

      let iconUrl: string | null = null;

      // Upload icon if selected
      if (iconFile) {
        iconUrl = await uploadIcon(iconFile);
        if (!iconUrl) {
          // Upload failed, error should be handled by the hook
          return;
        }
      }

      // Create library
      const library = await createLibrary({
        name: data.name,
        description: data.description || undefined,
        categoryId: data.categoryId,
        iconUrl: iconUrl || undefined,
      });

      if (library) {
        // Reset form and close dialog
        form.reset();
        removeIcon();
        onOpenChange(false);
        onSuccess?.(library);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      removeIcon();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900/95 to-gray-900/95 backdrop-blur-xl border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderOpen size={20} />
            <span>Create New Library</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Icon Upload */}
            <div className="space-y-2">
              <Label>Library Icon (Optional)</Label>
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                  iconPreview
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-white/20 hover:border-white/40 bg-white/10'
                )}
                onDrop={handleIconDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {iconPreview ? (
                  <div className="relative">
                    <Image
                      src={iconPreview}
                      alt="Library icon preview"
                      width={80}
                      height={80}
                      className="w-20 h-20 mx-auto rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                      onClick={removeIcon}
                    >
                      <X size={12} />
                    </Button>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    Creating...
                  </>
                ) : (
                  'Create Library'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}