'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Play, Pause, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (file: File, name: string) => void;
  disabled?: boolean;
  className?: string;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export function AudioRecorder({ onRecordingComplete, disabled = false, className }: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
        setError(null);
      } catch {
        setHasPermission(false);
        setError('Microphone access denied. Please allow microphone access to record audio.');
      }
    };

    checkPermission();
  }, []);

  // Timer effect
  useEffect(() => {
    if (state.isRecording && !state.isPaused) {
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRecording, state.isPaused]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        setState(prev => ({
          ...prev,
          audioBlob: blob,
          audioUrl: url,
          isRecording: false,
          isPaused: false,
        }));

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every 1s
      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
      }));

    } catch {
      setError('Failed to start recording. Please check microphone permissions.');
      setHasPermission(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [state.isRecording]);

  const discardRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
    });

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [state.audioUrl]);

  const playRecording = useCallback(() => {
    if (state.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [state.audioUrl, isPlaying]);

  const saveRecording = useCallback(() => {
    if (state.audioBlob) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Recording-${timestamp}`;
      
      // Convert webm blob to a File object
      const file = new File([state.audioBlob], `${fileName}.webm`, {
        type: 'audio/webm',
        lastModified: Date.now(),
      });

      onRecordingComplete(file, fileName);
      discardRecording();
    }
  }, [state.audioBlob, onRecordingComplete, discardRecording]);

  if (hasPermission === false) {
    return (
      <div className={cn('p-6 text-center bg-red-500/10 border border-red-500/20 rounded-lg', className)}>
        <MicOff size={32} className="mx-auto text-red-400 mb-3" />
        <h3 className="font-medium text-red-400 mb-2">Microphone Access Required</h3>
        <p className="text-sm text-red-300 mb-4">
          {error || 'Please allow microphone access to record audio.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className={cn('p-6 text-center bg-white/5 border border-white/10 rounded-lg', className)}>
        <Mic size={32} className="mx-auto text-white/60 mb-3 animate-pulse" />
        <p className="text-sm text-white/60">Checking microphone access...</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-white/5 border border-white/20 rounded-lg p-6', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white flex items-center space-x-2">
            <Mic size={18} className="text-purple-400" />
            <span>Record Audio</span>
          </h3>
          {state.duration > 0 && (
            <div className="text-sm text-white/60">
              {formatTime(state.duration)}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!state.isRecording && !state.audioBlob ? (
            /* Initial State */
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.button
                onClick={startRecording}
                disabled={disabled}
                className={cn(
                  'w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
              >
                <Mic size={32} className="text-white" />
              </motion.button>
              <p className="text-sm text-white/60 mt-4">
                Tap to start recording
              </p>
            </motion.div>
          ) : state.isRecording ? (
            /* Recording State */
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4"
              >
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Mic size={32} className="text-white" />
                </motion.div>
              </motion.div>
              
              <div className="space-y-2">
                <p className="text-white font-medium">Recording...</p>
                <p className="text-red-400 text-sm">{formatTime(state.duration)}</p>
              </div>

              <Button
                onClick={stopRecording}
                variant="outline"
                className="mt-4 border-white/20 hover:bg-white/10"
              >
                <Square size={16} className="mr-2" />
                Stop Recording
              </Button>
            </motion.div>
          ) : (
            /* Playback State */
            <motion.div
              key="playback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-3">
                <Button
                  onClick={playRecording}
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:bg-white/10"
                >
                  {isPlaying ? (
                    <Pause size={16} className="mr-2" />
                  ) : (
                    <Play size={16} className="mr-2" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                
                <span className="text-sm text-white/60">
                  {formatTime(state.duration)}
                </span>
              </div>

              <div className="flex items-center justify-center space-x-3">
                <Button
                  onClick={discardRecording}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={16} className="mr-2" />
                  Discard
                </Button>
                
                <Button
                  onClick={saveRecording}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Check size={16} className="mr-2" />
                  Add to Upload
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden audio element for playback */}
        {state.audioUrl && (
          <audio
            ref={audioRef}
            src={state.audioUrl}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        )}
      </div>
    </div>
  );
}