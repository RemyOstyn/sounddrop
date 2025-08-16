'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, FolderOpen, Image as ImageIcon, Camera } from 'lucide-react';
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

interface CreateLibrarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess: (library: LibraryWithDetails) => void;
}

export function CreateLibrarySheet({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: CreateLibrarySheetProps) {
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { uploadIcon } = useUpload();
  const { createLibrary, updateLibrary } = useLibraries();

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

      // Create library first (without icon)
      const library = await createLibrary({
        name: data.name,
        description: data.description || undefined,
        categoryId: data.categoryId,
        iconUrl: undefined,
      });

      if (!library) {
        console.error('Failed to create library');
        return;
      }

      // Reset form and close sheet
      form.reset();
      removeIcon();
      onOpenChange(false);
      onSuccess(library);

      // Upload icon in background if selected
      if (iconFile) {
        uploadIcon(iconFile).then((iconUrl) => {
          if (iconUrl) {
            updateLibrary(library.id, { iconUrl });
          }
        }).catch((error) => {
          console.error('Icon upload failed:', error);
        });
      }

    } catch (error) {
      console.error('Library creation error:', error);
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
      <DialogContent 
        showCloseButton={false}
        className={cn(
          // Override base dialog styles for mobile
          "!fixed !inset-x-0 !bottom-0 !top-auto !left-auto !right-auto",
          "!translate-x-0 !translate-y-0 !transform-none",
          "!max-w-none !w-full !max-h-[85vh]",
          "!p-0 !gap-0 !m-0",
          "bg-gradient-to-br from-slate-900/95 to-gray-900/95 backdrop-blur-xl border-white/20 text-white",
          "rounded-t-2xl rounded-b-none border-b-0",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          "overflow-hidden flex flex-col",
          // Desktop styles
          "sm:!relative sm:!h-auto sm:!max-h-[80vh] sm:!max-w-lg sm:!inset-auto",
          "sm:!top-[50%] sm:!left-[50%] sm:!translate-x-[-50%] sm:!translate-y-[-50%]",
          "sm:!rounded-lg sm:!border"
        )}
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <FolderOpen size={20} />
              <span>Create Library</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white/60 hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 min-h-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Icon Upload - Mobile Optimized */}
              <div className="space-y-2">
                <Label>Library Icon (Optional)</Label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div
                      className={cn(
                        'w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center',
                        iconPreview
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-white/20 bg-white/5'
                      )}
                    >
                      {iconPreview ? (
                        <Image
                          src={iconPreview}
                          alt="Library icon preview"
                          width={80}
                          height={80}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="text-white/60" />
                      )}
                    </div>
                    {iconPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={removeIcon}
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleIconSelect}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <span>
                          <Camera size={16} className="mr-2" />
                          Choose Photo
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-white/60 mt-1">
                      PNG, JPG, WEBP up to 2MB
                    </p>
                  </div>
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
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-base"
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
                        <SelectTrigger className="bg-white/10 border-white/20 text-white text-base">
                          <SelectValue placeholder="Select a category" className="placeholder:text-white/50" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900/95 border-white/20 text-white">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="hover:bg-white/10 focus:bg-white/10 text-base">
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
                        className="bg-white/10 border-white/20 resize-none text-white placeholder:text-white/50 text-base"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t border-white/10 p-6">
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 to-pink-500 flex-1"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}