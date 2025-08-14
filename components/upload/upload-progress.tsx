'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { UploadProgress as UploadProgressType } from '@/types/upload';
import { formatFileSize } from '@/lib/audio-utils';
import { cn } from '@/lib/utils';

interface UploadProgressProps {
  fileName: string;
  fileSize: number;
  progress: UploadProgressType | null;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  className?: string;
}

function UploadProgressComponent({
  fileName,
  fileSize,
  progress,
  status,
  error,
  className,
}: UploadProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Upload size={20} className="text-white/60" />;
      case 'uploading':
        return <Loader2 size={20} className="text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
      default:
        return <Upload size={20} className="text-white/60" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  const progressPercentage = progress?.percentage || 0;
  const uploadedSize = progress?.loaded || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('w-full', className)}
    >
      <Card className={cn('border transition-colors', getStatusColor())}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white truncate">
                  {fileName}
                </h4>
                <span className="text-xs text-white/60 ml-2">
                  {formatFileSize(uploadedSize)} / {formatFileSize(fileSize)}
                </span>
              </div>
              
              {/* Progress Bar */}
              {status === 'uploading' && (
                <div className="space-y-1">
                  <Progress 
                    value={progressPercentage} 
                    className="h-2 bg-white/10"
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <span>{progressPercentage}% uploaded</span>
                    {progress && (
                      <span>
                        {((progress.loaded / 1024 / 1024) / ((Date.now() - Date.now()) / 1000 || 1)).toFixed(1)} MB/s
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Status Messages */}
              {status === 'success' && (
                <p className="text-xs text-green-400">Upload completed successfully</p>
              )}
              
              {status === 'error' && error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
              
              {status === 'pending' && (
                <p className="text-xs text-white/60">Waiting to upload...</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Export with memo for performance optimization
export const UploadProgress = memo(UploadProgressComponent);

// Batch upload progress component
interface BatchUploadProgressProps {
  uploads: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    progress: UploadProgressType | null;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
  }>;
  className?: string;
}

function BatchUploadProgressComponent({
  uploads,
  className,
}: BatchUploadProgressProps) {
  const totalFiles = uploads.length;
  const completedFiles = uploads.filter(u => u.status === 'success').length;
  const failedFiles = uploads.filter(u => u.status === 'error').length;
  const uploadingFiles = uploads.filter(u => u.status === 'uploading').length;
  
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Progress */}
      <Card className="border-white/20 bg-white/5">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Upload Progress</h3>
              <span className="text-sm text-white/60">
                {completedFiles} / {totalFiles} completed
              </span>
            </div>
            
            <Progress value={overallProgress} className="h-2 bg-white/10" />
            
            <div className="flex justify-between text-xs text-white/60">
              <span>{Math.round(overallProgress)}% complete</span>
              <div className="flex space-x-4">
                {uploadingFiles > 0 && (
                  <span className="text-blue-400">{uploadingFiles} uploading</span>
                )}
                {failedFiles > 0 && (
                  <span className="text-red-400">{failedFiles} failed</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Individual Upload Progress */}
      <div className="space-y-2">
        {uploads.map((upload) => (
          <UploadProgress
            key={upload.id}
            fileName={upload.fileName}
            fileSize={upload.fileSize}
            progress={upload.progress}
            status={upload.status}
            error={upload.error}
          />
        ))}
      </div>
    </div>
  );
}

// Export with memo for performance optimization
export const BatchUploadProgress = memo(BatchUploadProgressComponent);