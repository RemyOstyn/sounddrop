'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudioDropzone, AudioFileList } from '@/components/upload/audio-dropzone';
import { UploadProgress } from '@/components/upload/upload-progress';
import { useAuth } from '@/hooks/use-auth';
import { useLibraries } from '@/hooks/use-libraries';
import { useUpload } from '@/hooks/use-upload';
import { formatRateLimitReset } from '@/lib/upload-utils';
import { toast } from 'sonner';

interface AudioFile {
  file: File;
  name: string;
  duration?: number;
  error?: string;
}

interface UploadItem {
  id: string;
  audioFile: AudioFile;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: { loaded: number; total: number; percentage: number } | null;
  error?: string;
  sampleId?: string;
}

export default function UploadPage() {
  const { user, userName } = useAuth();
  const { libraries, fetchLibraries } = useLibraries();
  const { isUploading, error, uploadAudio, rateLimitInfo } = useUpload();
  
  const [selectedLibrary, setSelectedLibrary] = useState<string>('');
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [activeTab, setActiveTab] = useState<'select' | 'upload'>('select');

  // Fetch user libraries on mount (single call)
  // Note: In development, React.StrictMode may cause this to run twice - this is expected behavior
  useEffect(() => {
    if (user?.id) {
      fetchLibraries({ userId: user.id });
    }
  }, [user?.id]); // Only run when user is available

  const userLibraries = libraries; // In real implementation, filter by current user

  const handleFilesAdded = useCallback((files: AudioFile[]) => {
    setAudioFiles(prev => [...prev, ...files]);
    
    if (files.length > 0) {
      setActiveTab('upload');
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpdateFileName = useCallback((index: number, name: string) => {
    setAudioFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, name } : file
    ));
  }, []);

  const handleStartUpload = useCallback(async () => {
    if (!selectedLibrary || audioFiles.length === 0) {
      toast.error('Please select a library and add audio files');
      return;
    }

    // Check rate limit
    if (rateLimitInfo?.isLimited) {
      toast.error(`Upload limit exceeded. Try again in ${formatRateLimitReset(rateLimitInfo.resetTime)}`);
      return;
    }

    // Create upload items
    const newUploads: UploadItem[] = audioFiles
      .filter(file => !file.error)
      .map(audioFile => ({
        id: `${audioFile.file.name}-${Date.now()}-${Math.random()}`,
        audioFile,
        status: 'pending' as const,
        progress: null,
      }));

    setUploads(newUploads);

    // Upload files sequentially to respect rate limits
    for (let i = 0; i < newUploads.length; i++) {
      const uploadItem = newUploads[i];
      
      // Update status to uploading
      setUploads(prev => prev.map(item => 
        item.id === uploadItem.id 
          ? { ...item, status: 'uploading' as const }
          : item
      ));

      try {
        const result = await uploadAudio(
          uploadItem.audioFile.file,
          uploadItem.audioFile.name,
          selectedLibrary
        );

        if (result) {
          // Success
          setUploads(prev => prev.map(item => 
            item.id === uploadItem.id 
              ? { 
                  ...item, 
                  status: 'success' as const,
                  progress: { loaded: item.audioFile.file.size, total: item.audioFile.file.size, percentage: 100 }
                }
              : item
          ));
          
          toast.success(`${uploadItem.audioFile.name} uploaded successfully`);
        } else {
          // Error should be handled by the hook
          setUploads(prev => prev.map(item => 
            item.id === uploadItem.id 
              ? { ...item, status: 'error' as const, error: error || 'Upload failed' }
              : item
          ));
        }
      } catch {
        setUploads(prev => prev.map(item => 
          item.id === uploadItem.id 
            ? { ...item, status: 'error' as const, error: 'Upload failed' }
            : item
        ));
      }

      // Small delay between uploads to be nice to the server
      if (i < newUploads.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Clear audio files after upload attempt
    setAudioFiles([]);
  }, [selectedLibrary, audioFiles, rateLimitInfo, uploadAudio, error]);

  const validAudioFiles = audioFiles.filter(file => !file.error);
  const completedUploads = uploads.filter(u => u.status === 'success').length;
  const failedUploads = uploads.filter(u => u.status === 'error').length;

  return (
    <div className="min-h-screen pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
              <Upload size={24} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Upload Audio</h1>
              <p className="text-white/60">
                {userName}, share your sounds with the community
              </p>
            </div>
          </div>

          {/* Rate Limit Info */}
          {rateLimitInfo && (
            <div className={`flex items-center space-x-6 text-sm ${
              rateLimitInfo.isLimited ? 'text-red-400' : 'text-white/60'
            }`}>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{rateLimitInfo.remaining} uploads remaining</span>
              </div>
              {rateLimitInfo.isLimited && (
                <span>Resets in {formatRateLimitReset(rateLimitInfo.resetTime)}</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'select' | 'upload')}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="select" className="flex items-center space-x-2">
                <Music size={16} />
                <span>Select Files</span>
                {validAudioFiles.length > 0 && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {validAudioFiles.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="upload" disabled={validAudioFiles.length === 0}>
                <Upload size={16} className="mr-2" />
                Upload
                {uploads.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                    {uploads.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-6">
              {/* Library Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Music size={20} />
                    <span>Select Library</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userLibraries.length > 0 ? (
                    <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
                      <SelectTrigger className="bg-white/5 border-white/20">
                        <SelectValue placeholder="Choose a library for your samples" />
                      </SelectTrigger>
                      <SelectContent>
                        {userLibraries.map((library) => (
                          <SelectItem key={library.id} value={library.id}>
                            <div className="flex items-center space-x-2">
                              <span>{library.name}</span>
                              <span className="text-xs text-white/60">
                                ({library._count.samples} samples)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-center py-8">
                      <Music size={32} className="mx-auto text-white/60 mb-4" />
                      <p className="text-white/80 mb-2">No libraries found</p>
                      <p className="text-white/60 text-sm">
                        Create a library first to organize your samples
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.href = '/my-libraries'}
                      >
                        Create Library
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* File Upload */}
              <AudioDropzone
                onFilesAdded={handleFilesAdded}
                disabled={!selectedLibrary || rateLimitInfo?.isLimited}
              />

              {/* Selected Files */}
              {audioFiles.length > 0 && (
                <AudioFileList
                  files={audioFiles}
                  onRemoveFile={handleRemoveFile}
                  onUpdateName={handleUpdateFileName}
                />
              )}

              {/* Upload Button */}
              {validAudioFiles.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setActiveTab('upload')}
                    className="bg-gradient-to-r from-green-500 to-blue-500"
                  >
                    Continue to Upload
                    <Upload size={16} className="ml-2" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              {/* Upload Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Upload Summary</h3>
                    <div className="flex space-x-4 text-sm">
                      {uploads.length > 0 && (
                        <>
                          <span className="flex items-center space-x-1 text-green-400">
                            <CheckCircle size={14} />
                            <span>{completedUploads} completed</span>
                          </span>
                          {failedUploads > 0 && (
                            <span className="flex items-center space-x-1 text-red-400">
                              <AlertCircle size={14} />
                              <span>{failedUploads} failed</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Files:</span>
                      <span className="text-white ml-2">{validAudioFiles.length}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Library:</span>
                      <span className="text-white ml-2">
                        {userLibraries.find(lib => lib.id === selectedLibrary)?.name || 'Not selected'}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Status:</span>
                      <span className="text-white ml-2">
                        {uploads.length === 0 ? 'Ready' : `${completedUploads}/${uploads.length}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Progress */}
              {uploads.length > 0 ? (
                <div className="space-y-4">
                  {uploads.map((upload) => (
                    <UploadProgress
                      key={upload.id}
                      fileName={upload.audioFile.name}
                      fileSize={upload.audioFile.file.size}
                      progress={upload.progress}
                      status={upload.status}
                      error={upload.error}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    onClick={handleStartUpload}
                    disabled={!selectedLibrary || validAudioFiles.length === 0 || isUploading}
                    className="bg-gradient-to-r from-green-500 to-blue-500"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Upload size={20} className="animate-pulse mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={20} className="mr-2" />
                        Start Upload ({validAudioFiles.length} files)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}