'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AUDIO_SETTINGS } from '@/lib/constants';

// Extend Window interface for webkit audio context
interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export interface AudioState {
  id: string;
  url: string;
  name: string;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  volume: number;
  error?: string;
}

interface AudioStore {
  // State
  activeSamples: Map<string, AudioState>;
  globalVolume: number;
  isMuted: boolean;
  
  // Actions
  loadSample: (id: string, url: string, name: string) => Promise<void>;
  playSample: (id: string) => Promise<void>;
  pauseSample: (id: string) => void;
  stopSample: (id: string) => void;
  stopAllSamples: () => void;
  setVolume: (id: string, volume: number) => void;
  setGlobalVolume: (volume: number) => void;
  toggleMute: () => void;
  updateCurrentTime: (id: string, currentTime: number) => void;
  removeSample: (id: string) => void;
  
  // Getters
  getSample: (id: string) => AudioState | undefined;
  isAnyPlaying: () => boolean;
  getPlayingSamples: () => AudioState[];
}

// Audio elements map to manage actual audio instances
const audioElements = new Map<string, HTMLAudioElement>();

// Audio context for advanced audio processing (currently disabled to avoid CORS issues)
let audioContext: AudioContext | null = null;
const audioNodes = new Map<string, {
  source: MediaElementAudioSourceNode;
  gainNode: GainNode;
}>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initAudioContext = () => {
  if (!audioContext) {
    const windowWithWebkit = window as WindowWithWebkit;
    audioContext = new (window.AudioContext || windowWithWebkit.webkitAudioContext || AudioContext)();
  }
  return audioContext;
};

const createAudioElement = (id: string, url: string): HTMLAudioElement => {
  const audio = new Audio(url);
  audio.preload = AUDIO_SETTINGS.PRELOAD_STRATEGY;
  
  // Attach to DOM (hidden) - some browsers require this for audio to play
  if (typeof document !== 'undefined') {
    audio.setAttribute('data-sample-id', id);
    (audio as HTMLElement).style.display = 'none';
    document.body.appendChild(audio);
  }
  
  console.log(`Creating basic HTML5 audio element for ${id} with URL:`, url);
  
  audioElements.set(id, audio);
  return audio;
};

export const useAudioStore = create<AudioStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    activeSamples: new Map(),
    globalVolume: AUDIO_SETTINGS.DEFAULT_VOLUME,
    isMuted: false,

    // Load sample into memory
    loadSample: async (id: string, url: string, name: string) => {
      const { activeSamples } = get();
      
      // If already exists and is the same URL, don't reload
      const existing = activeSamples.get(id);
      if (existing && existing.url === url) {
        return;
      }

      // Create initial state
      const initialState: AudioState = {
        id,
        url,
        name,
        duration: 0,
        isPlaying: false,
        isLoading: true,
        currentTime: 0,
        volume: AUDIO_SETTINGS.DEFAULT_VOLUME,
      };

      set((state) => ({
        activeSamples: new Map(state.activeSamples.set(id, initialState))
      }));

      try {
        const audio = createAudioElement(id, url);

        // Wait for metadata to load
        await new Promise<void>((resolve, reject) => {
          const onLoadedMetadata = () => {
            console.log(`Audio metadata loaded successfully for ${id}:`, {
              duration: audio.duration,
              readyState: audio.readyState,
              networkState: audio.networkState
            });
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('error', onError);
            resolve();
          };

          const onError = (event: Event) => {
            console.error(`Audio loading failed for ${id}:`, {
              error: audio.error,
              networkState: audio.networkState,
              readyState: audio.readyState,
              src: audio.src,
              event
            });
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('error', onError);
            reject(new Error(`Failed to load audio: ${audio.error?.message || 'Unknown error'}`));
          };

          audio.addEventListener('loadedmetadata', onLoadedMetadata);
          audio.addEventListener('error', onError);
          
          // Add timeout to prevent hanging
          setTimeout(() => {
            if (audio.readyState === 0) {
              console.warn(`Audio loading timeout for ${id}, checking if playable anyway`);
              // Sometimes audio can play without metadata loaded
              if (audio.src && url) {
                resolve();
              } else {
                reject(new Error('Audio loading timeout'));
              }
            }
          }, 10000); // 10 second timeout
        });

        // Set up event listeners
        audio.addEventListener('timeupdate', () => {
          get().updateCurrentTime(id, audio.currentTime);
        });

        audio.addEventListener('ended', () => {
          get().stopSample(id);
        });

        audio.addEventListener('error', () => {
          set((state) => ({
            activeSamples: new Map(state.activeSamples.set(id, {
              ...initialState,
              isLoading: false,
              error: 'Failed to load audio'
            }))
          }));
        });

        // Update state with loaded audio info
        set((state) => ({
          activeSamples: new Map(state.activeSamples.set(id, {
            ...initialState,
            duration: audio.duration,
            isLoading: false,
          }))
        }));

      } catch (error) {
        console.error(`Failed to load sample ${id}:`, error);
        set((state) => ({
          activeSamples: new Map(state.activeSamples.set(id, {
            ...initialState,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }))
        }));
      }
    },

    // Play sample
    playSample: async (id: string) => {
      const { activeSamples, globalVolume, isMuted } = get();
      const sample = activeSamples.get(id);
      const audio = audioElements.get(id);

      if (!sample || !audio) {
        console.warn(`Cannot play sample ${id}: missing sample or audio element`);
        return;
      }

      console.log(`Attempting to play sample ${id}:`, {
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
        duration: audio.duration,
        currentTime: audio.currentTime,
        paused: audio.paused,
        muted: audio.muted,
        volume: audio.volume
      });

      try {
        // Set volume before playing
        const targetVolume = isMuted ? 0 : sample.volume * globalVolume;
        audio.volume = targetVolume;
        audio.muted = false; // Ensure audio is not muted
        console.log(`Set volume for ${id} to:`, audio.volume, 'muted:', audio.muted);

        // Reset current time if at the end
        if (audio.currentTime >= audio.duration && audio.duration > 0) {
          audio.currentTime = 0;
        }

        // Play audio and handle the promise properly
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log(`Audio playback started successfully for ${id}`);
          
          // Update state only after successful play
          set((state) => ({
            activeSamples: new Map(state.activeSamples.set(id, {
              ...sample,
              isPlaying: true,
              error: undefined
            }))
          }));
        } else {
          // Fallback for older browsers
          console.log(`Play promise undefined for ${id}, assuming playback started`);
          set((state) => ({
            activeSamples: new Map(state.activeSamples.set(id, {
              ...sample,
              isPlaying: true,
              error: undefined
            }))
          }));
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Playback failed';
        console.error(`Playback failed for ${id}:`, {
          error: errorMessage,
          errorDetails: error,
          audioSrc: audio.src,
          readyState: audio.readyState,
          networkState: audio.networkState,
          paused: audio.paused,
          muted: audio.muted,
          volume: audio.volume
        });
        
        // Specific error handling for common issues
        if (errorMessage.includes('NotAllowedError') || errorMessage.includes('not allowed')) {
          console.warn('Playback blocked by browser autoplay policy. User interaction required.');
        }
        
        set((state) => ({
          activeSamples: new Map(state.activeSamples.set(id, {
            ...sample,
            isPlaying: false,
            error: errorMessage
          }))
        }));
      }
    },

    // Pause sample
    pauseSample: (id: string) => {
      const { activeSamples } = get();
      const sample = activeSamples.get(id);
      const audio = audioElements.get(id);

      if (!sample || !audio) return;

      audio.pause();

      set((state) => ({
        activeSamples: new Map(state.activeSamples.set(id, {
          ...sample,
          isPlaying: false
        }))
      }));
    },

    // Stop sample
    stopSample: (id: string) => {
      const { activeSamples } = get();
      const sample = activeSamples.get(id);
      const audio = audioElements.get(id);

      if (!sample || !audio) return;

      audio.pause();
      audio.currentTime = 0;

      set((state) => ({
        activeSamples: new Map(state.activeSamples.set(id, {
          ...sample,
          isPlaying: false,
          currentTime: 0
        }))
      }));
    },

    // Stop all samples
    stopAllSamples: () => {
      const { activeSamples } = get();
      
      activeSamples.forEach((_, id) => {
        const audio = audioElements.get(id);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      const newSamples = new Map();
      activeSamples.forEach((sample, id) => {
        newSamples.set(id, {
          ...sample,
          isPlaying: false,
          currentTime: 0
        });
      });

      set({ activeSamples: newSamples });
    },

    // Set individual sample volume
    setVolume: (id: string, volume: number) => {
      const { activeSamples, globalVolume, isMuted } = get();
      const sample = activeSamples.get(id);
      const audio = audioElements.get(id);
      const audioNode = audioNodes.get(id);

      if (!sample) return;

      const clampedVolume = Math.max(0, Math.min(1, volume));

      if (audio) {
        audio.volume = isMuted ? 0 : clampedVolume * globalVolume;
      }

      // Skip Web Audio API volume control for now
      if (audioNode) {
        audioNode.gainNode.gain.value = isMuted ? 0 : clampedVolume * globalVolume;
      }

      set((state) => ({
        activeSamples: new Map(state.activeSamples.set(id, {
          ...sample,
          volume: clampedVolume
        }))
      }));
    },

    // Set global volume
    setGlobalVolume: (volume: number) => {
      const { activeSamples, isMuted } = get();
      const clampedVolume = Math.max(0, Math.min(1, volume));

      // Update all audio elements
      activeSamples.forEach((sample, id) => {
        const audio = audioElements.get(id);
        const audioNode = audioNodes.get(id);

        if (audio) {
          audio.volume = isMuted ? 0 : sample.volume * clampedVolume;
        }

        if (audioNode) {
          audioNode.gainNode.gain.value = isMuted ? 0 : sample.volume * clampedVolume;
        }
      });

      set({ globalVolume: clampedVolume });
    },

    // Toggle mute
    toggleMute: () => {
      const { activeSamples, globalVolume, isMuted } = get();
      const newMuteState = !isMuted;

      // Update all audio elements
      activeSamples.forEach((sample, id) => {
        const audio = audioElements.get(id);
        const audioNode = audioNodes.get(id);

        if (audio) {
          audio.volume = newMuteState ? 0 : sample.volume * globalVolume;
        }

        if (audioNode) {
          audioNode.gainNode.gain.value = newMuteState ? 0 : sample.volume * globalVolume;
        }
      });

      set({ isMuted: newMuteState });
    },

    // Update current time
    updateCurrentTime: (id: string, currentTime: number) => {
      const { activeSamples } = get();
      const sample = activeSamples.get(id);

      if (!sample) return;

      set((state) => ({
        activeSamples: new Map(state.activeSamples.set(id, {
          ...sample,
          currentTime
        }))
      }));
    },

    // Remove sample from store and cleanup
    removeSample: (id: string) => {
      const { activeSamples } = get();
      const audio = audioElements.get(id);
      const audioNode = audioNodes.get(id);

      // Cleanup audio element
      if (audio) {
        audio.pause();
        audio.src = '';
        
        // Remove from DOM if attached
        if (typeof document !== 'undefined' && audio.parentNode) {
          audio.parentNode.removeChild(audio);
        }
        
        audioElements.delete(id);
      }

      // Cleanup audio nodes
      if (audioNode) {
        try {
          audioNode.source.disconnect();
          audioNode.gainNode.disconnect();
        } catch {
          // Node might already be disconnected
        }
        audioNodes.delete(id);
      }

      // Remove from store
      const newSamples = new Map(activeSamples);
      newSamples.delete(id);
      set({ activeSamples: newSamples });
    },

    // Get sample by ID
    getSample: (id: string) => {
      const { activeSamples } = get();
      return activeSamples.get(id);
    },

    // Check if any sample is playing
    isAnyPlaying: () => {
      const { activeSamples } = get();
      return Array.from(activeSamples.values()).some(sample => sample.isPlaying);
    },

    // Get all playing samples
    getPlayingSamples: () => {
      const { activeSamples } = get();
      return Array.from(activeSamples.values()).filter(sample => sample.isPlaying);
    }
  }))
);

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
      // Remove from DOM if attached
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
      }
    });
    audioElements.clear();
    audioNodes.clear();
  });
}