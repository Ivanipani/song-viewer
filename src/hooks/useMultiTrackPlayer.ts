import { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { TrackStem } from "../api/types";

interface TrackState {
  stem: TrackStem;
  sound: Howl | null;
  muted: boolean;
  solo: boolean;
  loading: boolean;
  error: string | null;
}

interface MultiTrackState {
  tracks: Map<string, TrackState>;
  isPlaying: boolean;
  position: number;
  duration: number;
  loading: boolean;
}

interface UseMultiTrackPlayerProps {
  tracks: TrackStem[];
  trackId: string;
}

interface UseMultiTrackPlayerReturn {
  state: MultiTrackState;
  play: () => void;
  pause: () => void;
  seek: (position: number) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  setVolume: (trackId: string, volume: number) => void;
}

const MEDIA_API_URL = import.meta.env.VITE_MEDIA_API_URL || "http://localhost:5001/media";

/**
 * Custom hook for managing multi-track audio playback
 * Handles solo/mute logic and synchronized playback across multiple tracks
 */
export function useMultiTrackPlayer({
  tracks,
  trackId,
}: UseMultiTrackPlayerProps): UseMultiTrackPlayerReturn {
  const [state, setState] = useState<MultiTrackState>({
    tracks: new Map(),
    isPlaying: false,
    position: 0,
    duration: 0,
    loading: true,
  });

  const positionInterval = useRef<number | null>(null);
  const soundsInitialized = useRef<boolean>(false);

  /**
   * Calculate effective mute state based on solo/mute logic
   * If ANY track is soloed: only soloed tracks are audible
   * If NO tracks are soloed: only muted tracks are silent
   */
  const getEffectiveMuteState = useCallback(
    (trackState: TrackState, allTracks: Map<string, TrackState>): boolean => {
      const anySolo = Array.from(allTracks.values()).some((t) => t.solo);

      if (anySolo) {
        // If any track is soloed, this track is muted unless it's also soloed
        return !trackState.solo || trackState.muted;
      }

      // No solo tracks, just use the muted state
      return trackState.muted;
    },
    []
  );

  /**
   * Apply solo/mute state to all tracks
   */
  const applyMuteStates = useCallback((tracks: Map<string, TrackState>) => {
    tracks.forEach((trackState) => {
      if (trackState.sound) {
        const effectiveMute = getEffectiveMuteState(trackState, tracks);
        trackState.sound.mute(effectiveMute);
      }
    });
  }, [getEffectiveMuteState]);

  /**
   * Initialize audio for all tracks
   */
  useEffect(() => {
    if (soundsInitialized.current || tracks.length === 0) return;

    soundsInitialized.current = true;
    const newTracks = new Map<string, TrackState>();
    let maxDuration = 0;

    // Set a timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      setState((prev) => {
        const hasUnloadedTracks = Array.from(prev.tracks.values()).some((t) => t.loading);
        if (hasUnloadedTracks) {
          console.warn('Some tracks took too long to load, marking as loaded anyway');
          const updatedTracks = new Map(prev.tracks);
          updatedTracks.forEach((trackState, id) => {
            if (trackState.loading) {
              updatedTracks.set(id, {
                ...trackState,
                loading: false,
                error: 'Loading timeout',
              });
            }
          });
          return {
            ...prev,
            tracks: updatedTracks,
            loading: false,
          };
        }
        return prev;
      });
    }, 10000); // 10 second timeout

    tracks.forEach((stem) => {
      // Prefer OGG for better Web Audio API compatibility
      const audioFile = stem.audio_files.find((f) => f.format === "ogg") ||
                        stem.audio_files.find((f) => f.format === "mp3") ||
                        stem.audio_files[0];

      if (!audioFile) {
        newTracks.set(stem.id, {
          stem,
          sound: null,
          muted: stem.muted,
          solo: stem.solo,
          loading: false,
          error: "No audio file available",
        });
        return;
      }

      const url = `${MEDIA_API_URL}/${trackId}/${audioFile.url}`;

      const sound = new Howl({
        src: [url],
        preload: true,
        onload: function() {
          const duration = sound.duration();
          if (duration > maxDuration) {
            maxDuration = duration;
          }

          setState((prev) => {
            const newTracks = new Map(prev.tracks);
            const trackState = newTracks.get(stem.id);
            if (trackState) {
              // Create a new TrackState object instead of mutating
              newTracks.set(stem.id, {
                ...trackState,
                loading: false,
                error: null,
              });
            }
            return {
              ...prev,
              tracks: newTracks,
              duration: Math.max(prev.duration, duration),
              loading: Array.from(newTracks.values()).some((t) => t.loading),
            };
          });
        },
        onloaderror: function(_id, error) {
          console.error(`Failed to load track ${stem.id}:`, error);
          setState((prev) => {
            const newTracks = new Map(prev.tracks);
            const trackState = newTracks.get(stem.id);
            if (trackState) {
              // Create a new TrackState object instead of mutating
              newTracks.set(stem.id, {
                ...trackState,
                loading: false,
                error: "Failed to load audio",
              });
            }
            return {
              ...prev,
              tracks: newTracks,
              loading: Array.from(newTracks.values()).some((t) => t.loading),
            };
          });
        },
      });

      newTracks.set(stem.id, {
        stem,
        sound,
        muted: stem.muted,
        solo: stem.solo,
        loading: true,
        error: null,
      });
    });

    setState({
      tracks: newTracks,
      isPlaying: false,
      position: 0,
      duration: maxDuration,
      loading: true,
    });

    // Cleanup on unmount
    return () => {
      clearTimeout(loadTimeout);
      soundsInitialized.current = false;
      newTracks.forEach((trackState) => {
        if (trackState.sound) {
          trackState.sound.unload();
        }
      });
    };
  }, [tracks, trackId]);


  /**
   * Start position tracking
   */
  const startPositionTracking = useCallback(() => {
    if (positionInterval.current) return;

    positionInterval.current = window.setInterval(() => {
      setState((prev) => {
        // Get position from first available sound
        const firstTrack = Array.from(prev.tracks.values()).find((t) => t.sound);
        if (!firstTrack?.sound) return prev;

        return {
          ...prev,
          position: firstTrack.sound.seek() as number || 0,
        };
      });
    }, 100); // Update more frequently for smoother UI
  }, []);

  /**
   * Stop position tracking
   */
  const stopPositionTracking = useCallback(() => {
    if (positionInterval.current) {
      window.clearInterval(positionInterval.current);
      positionInterval.current = null;
    }
  }, []);

  /**
   * Play all tracks simultaneously
   */
  const play = useCallback(() => {
    setState((prev) => {
      prev.tracks.forEach((trackState) => {
        if (trackState.sound && !trackState.sound.playing()) {
          trackState.sound.play();
        }
      });

      return {
        ...prev,
        isPlaying: true,
      };
    });

    startPositionTracking();
  }, [startPositionTracking]);

  /**
   * Pause all tracks
   */
  const pause = useCallback(() => {
    setState((prev) => {
      prev.tracks.forEach((trackState) => {
        if (trackState.sound) {
          trackState.sound.pause();
        }
      });

      return {
        ...prev,
        isPlaying: false,
      };
    });

    stopPositionTracking();
  }, [stopPositionTracking]);

  /**
   * Seek to position in all tracks
   */
  const seek = useCallback((position: number) => {
    setState((prev) => {
      prev.tracks.forEach((trackState) => {
        if (trackState.sound) {
          trackState.sound.seek(position);
        }
      });

      return {
        ...prev,
        position,
      };
    });
  }, []);

  /**
   * Toggle mute for a specific track
   */
  const toggleMute = useCallback((trackId: string) => {
    setState((prev) => {
      const newTracks = new Map(prev.tracks);
      const trackState = newTracks.get(trackId);

      if (trackState) {
        // Create new TrackState object instead of mutating
        newTracks.set(trackId, {
          ...trackState,
          muted: !trackState.muted,
        });
      }

      // Apply mute states after toggling
      applyMuteStates(newTracks);

      return {
        ...prev,
        tracks: newTracks,
      };
    });
  }, [applyMuteStates]);

  /**
   * Toggle solo for a specific track
   */
  const toggleSolo = useCallback((trackId: string) => {
    setState((prev) => {
      const newTracks = new Map(prev.tracks);
      const trackState = newTracks.get(trackId);

      if (trackState) {
        // Create new TrackState object instead of mutating
        newTracks.set(trackId, {
          ...trackState,
          solo: !trackState.solo,
        });
      }

      // Apply mute states after toggling
      applyMuteStates(newTracks);

      return {
        ...prev,
        tracks: newTracks,
      };
    });
  }, [applyMuteStates]);

  /**
   * Set volume for a specific track
   */
  const setVolume = useCallback((trackId: string, volume: number) => {
    setState((prev) => {
      const trackState = prev.tracks.get(trackId);

      if (trackState?.sound) {
        trackState.sound.volume(volume);
      }

      return prev;
    });
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopPositionTracking();
    };
  }, [stopPositionTracking]);

  return {
    state,
    play,
    pause,
    seek,
    toggleMute,
    toggleSolo,
    setVolume,
  };
}
