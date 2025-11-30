import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { AudioState, AudioFileRecord, AudioCatalog } from "../api/types";
import {
  createSound,
  cleanupSound,
  getNextTrack,
  getPreviousTrack,
  createInitialAudioState,
} from "../utils/audioUtils";

interface UseAudioPlayerProps {
  catalog: AudioCatalog | undefined;
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
export function useAudioPlayer({
  catalog,
}: UseAudioPlayerProps): UseAudioPlayerReturn {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
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
  const isNavigating = useRef<boolean>(false);

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
      console.log("handleTrackSelect", track);

      // Update URL to reflect the selected track
      isNavigating.current = true;
      navigate(`/track/${track.id}`);
      // Reset flag after navigation completes
      setTimeout(() => { isNavigating.current = false; }, 0);

      if (
        audioState.selectedTrack &&
        track.id === audioState.selectedTrack.id
      ) {
        console.log("same track, skipping");
        setAudioState((state) => {
          return {
            ...state,
            position: 0,
          };
        });
      }
      console.log("old:", audioState.selectedTrack.id);
      console.log("new:", track.id);

      setAudioState((prev) => {
        console.log("cleaning up and recreating sound", prev);
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
            // Handle single track loop
            setAudioState((state) => {
              if (state.loop === "single" && state.sound) {
                // Restart the same track
                state.sound.seek(0);
                state.sound.play();
                return {
                  ...state,
                  position: 0,
                };
              }

              // Check if there's a next track to play
              if (catalog) {
                const nextTrack = getNextTrack(
                  state.selectedTrack,
                  catalog,
                  state.shuffle,
                  state.loop,
                );
                console.log("onend setting to next track", nextTrack);
                if (nextTrack) {
                  // Auto-play next track
                  handleTrackSelect(nextTrack);
                  return state;
                } else {
                  // Last track finished (or no shuffle options), stop playback
                  return {
                    ...state,
                    isPlaying: false,
                  };
                }
              } else {
                // No catalog, just stop
                return {
                  ...state,
                  isPlaying: false,
                };
              }
            });
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
    [catalog, audioState.selectedTrack],
  );

  /**
   * Plays the next track in the catalog
   */
  const playNext = useCallback(() => {
    if (!catalog) return;
    const nextTrack = getNextTrack(
      audioState.selectedTrack,
      catalog,
      audioState.shuffle,
      audioState.loop,
    );
    console.log("next track", nextTrack);
    if (nextTrack) {
      handleTrackSelect(nextTrack);
    }
  }, [audioState.selectedTrack, audioState.shuffle, audioState.loop, catalog]);

  /**
   * Plays the previous track in the catalog
   * If current position is less than 3 seconds, restart the current song instead
   * If on the first song and no loop mode, restart the first song
   */
  const playPrev = useCallback(() => {
    if (!catalog) return;

    // Check if we're more than 3 seconds into the current track
    const currentPosition = audioState.position || 0;
    if (currentPosition > 3) {
      // Restart the current track
      if (audioState.sound && audioState.selectedTrack) {
        audioState.sound.seek(0);
        setAudioState((prev) => ({
          ...prev,
          position: 0,
        }));
      }
    } else {
      // Go to previous track
      const prevTrack = getPreviousTrack(
        audioState.selectedTrack,
        catalog,
        audioState.shuffle,
        audioState.loop,
      );
      if (prevTrack) {
        handleTrackSelect(prevTrack);
      } else {
        // No previous track available (first song without loop), restart current track
        if (audioState.sound && audioState.selectedTrack) {
          audioState.sound.seek(0);
          setAudioState((prev) => ({
            ...prev,
            position: 0,
          }));
        }
      }
    }
  }, [
    audioState.selectedTrack,
    audioState.shuffle,
    audioState.loop,
    audioState.position,
    audioState.sound,
    catalog,
    handleTrackSelect,
  ]);

  /**
   * Initialize from URL or default to first track when catalog loads
   */
  useEffect(() => {
    if (!catalog || !catalog.songs || catalog.songs.length === 0) {
      return;
    }

    // Only initialize once when we don't have a selected track yet
    if (audioState.selectedTrack) {
      return;
    }

    let trackToLoad = catalog.songs[0]; // Default to first track

    if (trackId) {
      // Try to load track from URL path parameter
      const track = catalog.songs.find((s) => s.id === trackId);
      if (track) {
        trackToLoad = track;
      }
    }

    // Initialize with the selected track
    const initialState = createInitialAudioState(
      { songs: [trackToLoad] } as AudioCatalog,
      {
        onLoad: (duration) => {
          setAudioState((prev) => ({
            ...prev,
            duration,
          }));
        },
        onEnd: () => {
          // Handle single track loop
          setAudioState((state) => {
            if (state.loop === "single" && state.sound) {
              // Restart the same track
              state.sound.seek(0);
              state.sound.play();
              return {
                ...state,
                position: 0,
              };
            }

            // Check if there's a next track to play
            const nextTrack = getNextTrack(
              state.selectedTrack,
              catalog,
              state.shuffle,
              state.loop,
            );
            if (nextTrack) {
              // Auto-play next track
              handleTrackSelect(nextTrack);
              return state;
            } else {
              // Last track finished, stop playback
              return {
                ...state,
                isPlaying: false,
              };
            }
          });
        },
      },
    );

    setAudioState((prev) => ({
      ...prev,
      ...initialState,
    }));
  }, [catalog, trackId, audioState.selectedTrack, handleTrackSelect]);

  /**
   * Handle URL changes (browser back/forward navigation)
   */
  useEffect(() => {
    // Skip if we're currently navigating (prevents circular calls)
    if (isNavigating.current) {
      return;
    }

    if (!catalog || !catalog.songs || catalog.songs.length === 0) {
      return;
    }

    // Skip if no track is selected yet (initialization will handle it)
    if (!audioState.selectedTrack) {
      return;
    }

    // If URL has a track ID and it's different from current track
    if (trackId && trackId !== audioState.selectedTrack.id) {
      const track = catalog.songs.find((s) => s.id === trackId);
      if (track) {
        // Load the track from URL path parameter
        handleTrackSelect(track);
      }
    }
  }, [trackId, catalog, audioState.selectedTrack, handleTrackSelect]);

    useEffect(() => {
    return () => {
      cleanupSound(audioState.sound);
      stopPositionTracking();
    };

    }, [])
  /**
   * Start/stop position tracking based on playback state
   */
  useEffect(() => {
    if (audioState.sound && audioState.isPlaying) {
      startPositionTracking();
    } else {
      stopPositionTracking();
    }

  }, [
    audioState.sound,
    audioState.isPlaying,
    startPositionTracking,
    stopPositionTracking,
  ]);

  return {
    audioState,
    setAudioState,
    handleTrackSelect,
    playNext,
    playPrev,
  };
}
