'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, Music, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validateAudioFile, getAudioFileInfo, formatFileSize, generateSampleNameFromFile } from '@/lib/audio-utils';
import { AUDIO_ACCEPT } from '@/types/upload';
import { cn } from '@/lib/utils';

interface AudioFile {
  file: File;
  name: string;
  duration?: number;
  error?: string;
}

interface AudioDropzoneProps {
  onFilesAdded: (files: AudioFile[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function AudioDropzone({
  onFilesAdded,
  maxFiles = 10,
  disabled = false,
  className,
}: AudioDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setIsProcessing(true);
    const audioFiles: AudioFile[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray.slice(0, maxFiles)) {
      const validation = validateAudioFile(file);
      
      if (validation.valid) {
        try {
          const info = await getAudioFileInfo(file);
          audioFiles.push({
            file,
            name: generateSampleNameFromFile(file.name),
            duration: info.duration,
          });
        } catch {
          audioFiles.push({
            file,
            name: generateSampleNameFromFile(file.name),
            error: 'Failed to process audio file',
          });
        }
      } else {
        audioFiles.push({
          file,
          name: generateSampleNameFromFile(file.name),
          error: validation.error,
        });
      }
    }

    onFilesAdded(audioFiles);
    setIsProcessing(false);
  }, [onFilesAdded, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled || isProcessing) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [disabled, isProcessing, processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragOver(true);
    }
  }, [disabled, isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only hide drag over if we're leaving the dropzone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [processFiles]);

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg transition-all duration-200',
        isDragOver
          ? 'border-purple-500 bg-purple-500/10 scale-105'
          : 'border-white/20 hover:border-white/40',
        disabled && 'opacity-50 cursor-not-allowed',
        isProcessing && 'pointer-events-none',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Card className="border-none bg-transparent">
        <CardContent className="p-8 text-center">
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Music size={48} className="mx-auto text-purple-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Processing Audio Files</h3>
                  <p className="text-white/60">Extracting metadata and validating files...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-6"
              >
                <motion.div
                  animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Upload 
                    size={48} 
                    className={cn(
                      'mx-auto transition-colors',
                      isDragOver ? 'text-purple-400' : 'text-white/60'
                    )} 
                  />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    {isDragOver ? 'Drop your audio files here' : 'Upload Audio Files'}
                  </h3>
                  <p className="text-white/60">
                    Drag and drop audio files or{' '}
                    <label className="text-purple-400 hover:text-purple-300 cursor-pointer">
                      browse your computer
                      <input
                        type="file"
                        multiple
                        accept={Object.keys(AUDIO_ACCEPT).join(',')}
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={disabled || isProcessing}
                      />
                    </label>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/60">
                  <div className="flex items-center justify-center space-x-1">
                    <File size={14} />
                    <span>MP3, WAV, OGG, MP4</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Upload size={14} />
                    <span>Up to 50MB per file</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <Music size={14} />
                    <span>Max {maxFiles} files</span>
                  </div>
                </div>

                {!disabled && (
                  <Button
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = Object.keys(AUDIO_ACCEPT).join(',');
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) {
                          processFiles(target.files);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload size={16} className="mr-2" />
                    Choose Files
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// Component to display selected audio files
interface AudioFileListProps {
  files: AudioFile[];
  onRemoveFile: (index: number) => void;
  onUpdateName: (index: number, name: string) => void;
  className?: string;
}

export function AudioFileList({
  files,
  onRemoveFile,
  onUpdateName,
  className,
}: AudioFileListProps) {
  if (files.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="font-medium text-white">Selected Files</h4>
      <div className="space-y-2">
        {files.map((audioFile, index) => (
          <motion.div
            key={`${audioFile.file.name}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              {audioFile.error ? (
                <AlertCircle size={20} className="text-red-400" />
              ) : (
                <Music size={20} className="text-purple-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={audioFile.name}
                onChange={(e) => onUpdateName(index, e.target.value)}
                className="w-full bg-transparent text-white text-sm font-medium truncate border-none outline-none focus:bg-white/5 rounded px-2 py-1"
                placeholder="Sample name"
              />
              
              <div className="flex items-center space-x-3 mt-1 text-xs text-white/60">
                <span>{audioFile.file.name}</span>
                <span>{formatFileSize(audioFile.file.size)}</span>
                {audioFile.duration && (
                  <span>{Math.round(audioFile.duration)}s</span>
                )}
              </div>
              
              {audioFile.error && (
                <p className="text-xs text-red-400 mt-1">{audioFile.error}</p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFile(index)}
              className="text-white/60 hover:text-red-400 flex-shrink-0"
            >
              <X size={16} />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}