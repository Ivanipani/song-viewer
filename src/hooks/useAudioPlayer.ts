import { useState, useEffect, useRef, useCallback } from "react";
import { AudioState, AudioFileRecord, AudioCatalog } from "../api/types";
import {
  createSound,
  cleanupSound,
  getNextTrack,
  getPreviousTrack,
  createInitialAudioState,
} from "../utils/audioUtils";

interface UseAudioPlayerProps {
  catalog: AudioCatalog;
}

interface UseAudioPlayerReturn {
  audioState: AudioState;
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
  handleTrackSelect: (track: AudioFileRecord) => void;
  playNext: () => void;
  playPrev: () => void;
}

/**
 * Custom hook for managing audio player state and controls
 * @param catalog - The audio catalog containing all tracks
 * @returns Audio player state and control functions
 */
export function useAudioPlayer({ catalog }: UseAudioPlayerProps): UseAudioPlayerReturn {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    selectedTrack: null,
    sound: null,
    position: 0,
    duration: 0,
    loop: "none",
    shuffle: false,
  });

  const positionInterval = useRef<number | null>(null);

  /**
   * Starts tracking the audio position
   */
  const startPositionTracking = useCallback(() => {
    if (positionInterval.current) return;

    positionInterval.current = window.setInterval(() => {
      setAudioState((prev) => {
        if (!prev.sound) return prev;
        return {
          ...prev,
          position: prev.sound.seek() || 0,
        };
      });
    }, 1000);
  }, []);

  /**
   * Stops tracking the audio position
   */
  const stopPositionTracking = useCallback(() => {
    if (positionInterval.current) {
      window.clearInterval(positionInterval.current);
      positionInterval.current = null;
    }
  }, []);

  /**
   * Handles track selection and playback
   */
  const handleTrackSelect = useCallback(
    (track: AudioFileRecord) => {
      setAudioState((prev) => {
        // Clean up previous sound
        cleanupSound(prev.sound);

        // Create new sound instance with callbacks
        const newSound = createSound(track.url, {
          onLoad: (duration) => {
            setAudioState((state) => ({
              ...state,
              duration,
            }));
          },
          onEnd: () => {
            setAudioState((state) => ({
              ...state,
              isPlaying: false,
            }));
          },
        });

        return {
          ...prev,
          selectedTrack: track,
          sound: newSound,
          isPlaying: true,
          position: 0,
          duration: newSound.duration(),
        };
      });
    },
    []
  );

  /**
   * Plays the next track in the catalog
   */
  const playNext = useCallback(() => {
    const nextTrack = getNextTrack(audioState.selectedTrack, catalog);
    if (nextTrack) {
      handleTrackSelect(nextTrack);
    }
  }, [audioState.selectedTrack, catalog, handleTrackSelect]);

  /**
   * Plays the previous track in the catalog
   */
  const playPrev = useCallback(() => {
    const prevTrack = getPreviousTrack(audioState.selectedTrack, catalog);
    if (prevTrack) {
      handleTrackSelect(prevTrack);
    }
  }, [audioState.selectedTrack, catalog, handleTrackSelect]);

  /**
   * Initialize audio state with first track when catalog loads
   */
  useEffect(() => {
    if (catalog && catalog.songs.length > 0) {
      const initialState = createInitialAudioState(catalog, {
        onLoad: (duration) => {
          setAudioState((prev) => ({
            ...prev,
            duration,
          }));
        },
        onEnd: () => {
          setAudioState((prev) => ({
            ...prev,
            isPlaying: false,
          }));
        },
      });

      setAudioState((prev) => ({
        ...prev,
        ...initialState,
      }));
    }

    return () => {
      setAudioState((prev) => {
        cleanupSound(prev.sound);
        return prev;
      });
      stopPositionTracking();
    };
  }, [catalog, stopPositionTracking]);

  /**
   * Start/stop position tracking based on playback state
   */
  useEffect(() => {
    if (audioState.sound && audioState.isPlaying) {
      startPositionTracking();
    } else {
      stopPositionTracking();
    }
  }, [audioState.sound, audioState.isPlaying, startPositionTracking, stopPositionTracking]);

  return {
    audioState,
    setAudioState,
    handleTrackSelect,
    playNext,
    playPrev,
  };
}
