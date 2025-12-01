/**
 * Audio player control panel component.
 *
 * Parent components: PlayerIndex, TrackViewer, TrackPlayer
 *
 * Responsibilities:
 * - Displays currently playing track info (title, artist)
 * - Shows and controls playback position with seekable slider
 * - Provides play/pause, skip forward/back controls
 * - Manages shuffle and loop modes (none/all/single)
 * - Handles keyboard shortcuts (spacebar for play/pause)
 *
 * Data received from parent:
 * - audioState: AudioState - complete audio playback state
 *   Contains: selectedTrack, sound, isPlaying, position, duration, loop, shuffle
 * - setAudioState: updater function to modify audioState
 * - playNext/playPrev: callbacks to skip tracks (implemented in useAudioPlayer)
 * - showTrackPlayer: callback to show full player view (mobile only)
 *
 * State management:
 * - Reads audioState to display current track and playback status
 * - Updates audioState to control playback (play/pause, seek, shuffle, loop)
 * - Syncs play/pause state with Howl sound instance via useEffect
 *
 * No data ownership - all state managed by parent's useAudioPlayer hook.
 * No network calls - operates on already-loaded audio.
 */
import { Box, Slider, Text, Group, Title, ActionIcon } from "@mantine/core";
import { useEffect } from "react";
import { AudioState } from "../../api/types";
import {
  IconPlayerSkipBack,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipForward,
  IconArrowsShuffle,
  IconRepeat,
  IconRepeatOnce,
} from "@tabler/icons-react";
import classes from './PlayControl.module.css';

const formatTime = (seconds: number) => {
  const roundedSeconds = Math.round(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = Math.round(roundedSeconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface PlayControlProps {
  audioState: AudioState;
  setAudioState: Function;
  playNext: () => void;
  playPrev: () => void;
  showTrackPlayer: () => void;
}
export const PlayControl = (props: PlayControlProps) => {
    const togglePlay = () => {
        props.setAudioState((prev: AudioState) => ({
            ...prev,
            isPlaying: !prev.isPlaying,
        }));
    };

    const toggleShuffle = () => {
      props.setAudioState((prev: AudioState) => ({
        ...prev,
        shuffle: !prev.shuffle,
      }));
    };

    const toggleLoop = () => {
      props.setAudioState((prev: AudioState) => {
        let newLoop: "single" | "all" | "none" = "none";
        if (prev.loop === "none") {
          newLoop = "all";
        } else if (prev.loop === "all") {
          newLoop = "single";
        } else {
          newLoop = "none";
        }
        return {
          ...prev,
          loop: newLoop,
        };
      });
    };

    useEffect(() => {
        const { sound, isPlaying } = props.audioState;
        if (!sound) return;

        const isCurrentlyPlaying = sound.playing();
        if (isPlaying && !isCurrentlyPlaying) {
            sound.play();
        } else if (!isPlaying && isCurrentlyPlaying) {
            sound.pause();
        }
    }, [props.audioState?.isPlaying, props.audioState?.sound]);

    // Add keyboard event listener
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === "Space") {
                event.preventDefault(); // Prevent space from scrolling the page
                props.setAudioState((prev: AudioState) => {
                    if (!prev.sound) return prev;
                    return { ...prev, isPlaying: !prev.isPlaying };
                });
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    const progressBar = () => {
        return (
          <Box
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text size="sm">{formatTime(props.audioState?.position ?? 0)}</Text>
            <Slider
              min={0}
              max={props.audioState?.duration ?? 100}
              step={1}
              value={props.audioState?.position ?? 0}
              onChange={(value) => {
                props.setAudioState((prev: AudioState) => ({
                  ...prev,
                  position: value,
                }));
              }}
              onChangeEnd={(value) => {
                if (!props.audioState.sound) return;
                props.audioState.sound.seek(value as number);
              }}
              className={classes.slider}
              label={null}
              color="coolSteel.5"
            />
            <Text size="sm">{formatTime(props.audioState?.duration ?? 0)}</Text>
          </Box>
        );
    };
    const controls = () => {
        const getLoopIcon = () => {
          if (props.audioState.loop === "single") {
            return <IconRepeatOnce />;
          } else if (props.audioState.loop === "all") {
            return <IconRepeat />;
          } else {
            return <IconRepeat />;
          }
        };

        const getLoopColor = () => {
          return props.audioState.loop !== "none" ? "coolSteel" : "coolGray";
        };

        return (
          <Group justify="space-between">
            <ActionIcon
              onClick={toggleLoop}
              variant="subtle"
              color={getLoopColor()}
              size="lg"
              style={{ margin: "0 4px" }}
            >
              {getLoopIcon()}
            </ActionIcon>

            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <ActionIcon
                onClick={props.playPrev}
                variant="subtle"
                size="lg"
                style={{ margin: "0 4px" }}
              >
                <IconPlayerSkipBack />
              </ActionIcon>

              <ActionIcon
                onClick={togglePlay}
                variant="subtle"
                size="lg"
                style={{ margin: "0 4px" }}
              >
                {props.audioState?.isPlaying ? (
                  <IconPlayerPause />
                ) : (
                  <IconPlayerPlay />
                )}
              </ActionIcon>
              <ActionIcon
                onClick={props.playNext}
                variant="subtle"
                size="lg"
                style={{ margin: "0 4px" }}
              >
                <IconPlayerSkipForward />
              </ActionIcon>
            </Box>

            <ActionIcon
              onClick={toggleShuffle}
              variant="subtle"
              color={props.audioState?.shuffle ? "coolSteel" : "coolGray"}
              size="lg"
              style={{ margin: "0 4px" }}
            >
              <IconArrowsShuffle />
            </ActionIcon>
          </Group>
        );
    };
    const nowPlaying = () => {
        return (
            <Box style={{ alignSelf: "flex-start" }}>
                <Title order={6}>
                    {props.audioState?.selectedTrack?.title}
                </Title>
                <Text size="sm">
                    {props.audioState?.selectedTrack?.artist}
                </Text>
            </Box>
        );
    };

    return (
        <Box
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingInline: "1rem",
                paddingBlock: "0.5rem",
                borderTop: "1px solid light-dark(var(--mantine-color-coolSlate-3), var(--mantine-color-coolGray-7))",
            }}
        >
            {nowPlaying()}
            {progressBar()}
            {controls()}
        </Box>
    );
};
