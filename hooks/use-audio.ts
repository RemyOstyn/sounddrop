'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAudioStore } from '@/lib/stores/audio-store';

export interface UseAudioOptions {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onError?: (error: string) => void;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  autoLoad?: boolean;
}

export interface UseAudioReturn {
  // State
  isLoading: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error?: string;
  
  // Controls
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  load: () => Promise<void>;
  
  // Progress helpers
  progress: number; // 0-1
  timeLeft: number;
  formattedCurrentTime: string;
  formattedDuration: string;
  formattedTimeLeft: string;
}

const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function useAudio(
  id: string,
  url: string,
  name: string,
  options: UseAudioOptions = {}
) {
  const {
    onPlay,
    onPause,
    onStop,
    onError,
    onLoadStart,
    onLoadComplete,
    autoLoad = false
  } = options;

  const [hasTriggeredCallbacks, setHasTriggeredCallbacks] = useState(false);
  const [hasTrackedCurrentPlay, setHasTrackedCurrentPlay] = useState(false);

  const {
    loadSample,
    playSample,
    pauseSample,
    stopSample,
    setVolume,
    getSample,
    removeSample
  } = useAudioStore();

  const sample = getSample(id);

  // Auto-load if specified
  useEffect(() => {
    if (autoLoad && url && !sample) {
      onLoadStart?.();
      loadSample(id, url, name).then(() => {
        onLoadComplete?.();
      });
    }
  }, [autoLoad, url, sample, id, name, loadSample, onLoadStart, onLoadComplete]);

  // Trigger callbacks when state changes
  useEffect(() => {
    if (!sample || hasTriggeredCallbacks) return;

    if (sample.error && onError) {
      onError(sample.error);
      setHasTriggeredCallbacks(true);
    }
  }, [sample?.error, onError, hasTriggeredCallbacks]);

  useEffect(() => {
    if (!sample) return;

    if (sample.isPlaying && onPlay && !hasTrackedCurrentPlay) {
      onPlay();
      setHasTrackedCurrentPlay(true);
    } else if (!sample.isPlaying && sample.currentTime === 0 && onStop) {
      onStop();
      setHasTrackedCurrentPlay(false); // Reset for next play
    } else if (!sample.isPlaying && sample.currentTime > 0 && onPause) {
      onPause();
    }
  }, [sample?.isPlaying, sample?.currentTime, onPlay, onPause, onStop, hasTrackedCurrentPlay]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      // Only cleanup when component unmounts, not when playing state changes
      const currentSample = getSample(id);
      if (currentSample && !currentSample.isPlaying) {
        removeSample(id);
      }
    };
  }, [id, getSample, removeSample]);

  const load = useCallback(async () => {
    if (!url) return;
    
    onLoadStart?.();
    await loadSample(id, url, name);
    onLoadComplete?.();
  }, [id, url, name, loadSample, onLoadStart, onLoadComplete]);

  const play = useCallback(async () => {
    if (!sample && url) {
      await load();
    }
    await playSample(id);
  }, [sample, url, id, playSample, load]);

  const pause = useCallback(() => {
    pauseSample(id);
  }, [id, pauseSample]);

  const stop = useCallback(() => {
    stopSample(id);
  }, [id, stopSample]);

  const handleSetVolume = useCallback((volume: number) => {
    setVolume(id, volume);
  }, [id, setVolume]);

  // Calculate derived values
  const progress = sample?.duration ? sample.currentTime / sample.duration : 0;
  const timeLeft = sample ? Math.max(0, sample.duration - sample.currentTime) : 0;
  
  return {
    // State
    isLoading: sample?.isLoading ?? false,
    isPlaying: sample?.isPlaying ?? false,
    currentTime: sample?.currentTime ?? 0,
    duration: sample?.duration ?? 0,
    volume: sample?.volume ?? 0.7,
    error: sample?.error,
    
    // Controls
    play,
    pause,
    stop,
    setVolume: handleSetVolume,
    load,
    
    // Progress helpers
    progress,
    timeLeft,
    formattedCurrentTime: formatTime(sample?.currentTime ?? 0),
    formattedDuration: formatTime(sample?.duration ?? 0),
    formattedTimeLeft: formatTime(timeLeft)
  };
}

// Hook for managing multiple samples at once
export function useAudioManager() {
  const {
    activeSamples,
    globalVolume,
    isMuted,
    stopAllSamples,
    setGlobalVolume,
    toggleMute,
    isAnyPlaying,
    getPlayingSamples
  } = useAudioStore();

  const playingSamples = getPlayingSamples();
  const totalActiveSamples = activeSamples.size;

  return {
    // State
    playingSamples,
    totalActiveSamples,
    globalVolume,
    isMuted,
    isAnyPlaying: isAnyPlaying(),
    
    // Global controls
    stopAll: stopAllSamples,
    setGlobalVolume,
    toggleMute,
    
    // Utilities
    getActiveSamples: () => Array.from(activeSamples.values())
  };
}

// Hook for tracking play counts (for trending algorithm)
export function usePlayTracking() {
  const trackPlay = useCallback(async (sampleId: string) => {
    try {
      await fetch(`/api/samples/${sampleId}/play`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Failed to track play:', error);
      // Non-critical, so we don't throw
    }
  }, []);

  return { trackPlay };
}