'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Mic, FolderOpen, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './audio-recorder';
import { AudioFileList } from './audio-dropzone';
import { validateAudioFile, getAudioFileInfo, generateSampleNameFromFile } from '@/lib/audio-utils';
import { AUDIO_ACCEPT } from '@/types/upload';
import { cn } from '@/lib/utils';

interface AudioFile {
  file: File;
  name: string;
  duration?: number;
  error?: string;
}

interface MobileAudioUploadProps {
  onFilesAdded: (files: AudioFile[]) => void;
  files: AudioFile[];
  onRemoveFile: (index: number) => void;
  onUpdateFileName: (index: number, name: string) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function MobileAudioUpload({
  onFilesAdded,
  files,
  onRemoveFile,
  onUpdateFileName,
  maxFiles = 100,
  disabled = false,
  className,
}: MobileAudioUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    setIsProcessing(true);
    const audioFiles: AudioFile[] = [];
    const fileArray = Array.from(fileList);

    for (const file of fileArray.slice(0, maxFiles - files.length)) {
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
  }, [onFilesAdded, maxFiles, files.length]);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = Object.keys(AUDIO_ACCEPT).join(',');
    input.capture = 'user'; // Suggests using device camera/microphone if available
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        processFiles(target.files);
      }
    };
    
    input.click();
  }, [processFiles]);

  const handleRecordingComplete = useCallback((file: File, name: string) => {
    const audioFile: AudioFile = {
      file,
      name,
    };
    
    // Process the recording to get duration
    getAudioFileInfo(file)
      .then((info) => {
        audioFile.duration = info.duration;
        onFilesAdded([audioFile]);
      })
      .catch(() => {
        onFilesAdded([audioFile]);
      });
    
    setShowRecorder(false);
  }, [onFilesAdded]);

  const canAddMore = files.length < maxFiles;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Options */}
      <div className="space-y-3">
        {/* Choose Files Button */}
        <motion.button
          onClick={handleFileSelect}
          disabled={disabled || isProcessing || !canAddMore}
          className={cn(
            'w-full p-4 rounded-xl border-2 border-dashed transition-all',
            'bg-purple-500/10 border-purple-500/50 hover:bg-purple-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          whileHover={!disabled && canAddMore ? { scale: 1.02 } : {}}
          whileTap={!disabled && canAddMore ? { scale: 0.98 } : {}}
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Music size={24} className="text-purple-400" />
                </motion.div>
              ) : (
                <FolderOpen size={24} className="text-purple-400" />
              )}
            </div>
            <div className="text-left flex-1">
              <h3 className="font-medium text-white">
                {isProcessing ? 'Processing Files...' : 'Choose Audio Files'}
              </h3>
              <p className="text-sm text-white/60">
                {isProcessing 
                  ? 'Extracting metadata...' 
                  : `Select from your device (${files.length}/${maxFiles})`
                }
              </p>
            </div>
            <Upload size={20} className="text-white/60" />
          </div>
        </motion.button>

        {/* Record Audio Button */}
        {!showRecorder ? (
          <motion.button
            onClick={() => setShowRecorder(true)}
            disabled={disabled || !canAddMore}
            className={cn(
              'w-full p-4 rounded-xl border-2 border-dashed transition-all',
              'bg-red-500/10 border-red-500/50 hover:bg-red-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            whileHover={!disabled && canAddMore ? { scale: 1.02 } : {}}
            whileTap={!disabled && canAddMore ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Mic size={24} className="text-red-400" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-medium text-white">Record Audio</h3>
                <p className="text-sm text-white/60">
                  Record directly with your microphone
                </p>
              </div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            </div>
          </motion.button>
        ) : (
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            disabled={disabled}
          />
        )}

        {!canAddMore && (
          <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              Maximum {maxFiles} files reached
            </p>
          </div>
        )}
      </div>

      {/* File Format Info */}
      <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
        <div className="flex items-center justify-center space-x-1 p-2 bg-white/5 rounded">
          <Music size={12} />
          <span>MP3, WAV, OGG, MP4</span>
        </div>
        <div className="flex items-center justify-center space-x-1 p-2 bg-white/5 rounded">
          <Upload size={12} />
          <span>Up to 50MB per file</span>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <AudioFileList
          files={files}
          onRemoveFile={onRemoveFile}
          onUpdateName={onUpdateFileName}
        />
      )}

      {/* Close Recorder Button */}
      {showRecorder && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecorder(false)}
            className="border-white/20 hover:bg-white/10"
          >
            Close Recorder
          </Button>
        </div>
      )}
    </div>
  );
}