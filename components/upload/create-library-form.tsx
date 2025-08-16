'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, FolderOpen, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
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
import { motion } from 'framer-motion';

const createLibrarySchema = z.object({
  name: z.string().min(1, 'Library name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  categoryId: z.string().min(1, 'Category is required'),
});

type CreateLibraryForm = z.infer<typeof createLibrarySchema>;

interface CreateLibraryFormProps {
  categories: Category[];
  onSuccess: (library: LibraryWithDetails) => void;
  onCancel: () => void;
  className?: string;
}

export function CreateLibraryFormInline({
  categories,
  onSuccess,
  onCancel,
  className
}: CreateLibraryFormProps) {
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

      // Reset form
      form.reset();
      removeIcon();
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

  const handleCancel = () => {
    form.reset();
    removeIcon();
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'bg-white/5 border border-white/20 rounded-xl p-6',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <FolderOpen size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Create New Library</h3>
            <p className="text-sm text-white/60">Set up a new collection for your samples</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="text-white/60 hover:text-white"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Icon Upload */}
          <div className="space-y-2">
            <Label>Library Icon (Optional)</Label>
            <div
              className={cn(
                'relative border-2 border-dashed rounded-lg p-4 text-center transition-colors',
                iconPreview
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-white/20 hover:border-white/40 bg-white/5'
              )}
              onDrop={handleIconDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {iconPreview ? (
                <div className="relative inline-block">
                  <Image
                    src={iconPreview}
                    alt="Library icon preview"
                    width={60}
                    height={60}
                    className="w-15 h-15 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0"
                    onClick={removeIcon}
                  >
                    <X size={10} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon size={24} className="mx-auto text-white/60" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

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
                    rows={2}
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
              onClick={handleCancel}
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
    </motion.div>
  );
}