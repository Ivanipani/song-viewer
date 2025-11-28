import { Box, Slider, Text, Title, ActionIcon } from "@mantine/core";
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
              color="white"
            />
            <Text size="sm">{formatTime(props.audioState?.duration ?? 0)}</Text>
          </Box>
        );
    };
    //   const toggleLoopState = () => {
    //     let newLoopState: "single" | "all" | "none" = "none";
    //     if (props.audioState.loop === "single") {
    //       newLoopState = "all";
    //     } else if (props.audioState.loop === "all") {
    //       newLoopState = "none";
    //     } else {
    //       newLoopState = "single";
    //     }
    //     props.setAudioState((prev: AudioState) => ({
    //       ...prev,
    //       loop: newLoopState,
    //     }));
    //   };

    //   const toggleShuffle = () => {
    //     props.setAudioState((prev: AudioState) => ({
    //       ...prev,
    //       shuffle: !prev.shuffle,
    //     }));
    //   };
    //   const getLoopIcon = () => {
    //     if (props.audioState.loop === "single") {
    //       return <LoopIcon />;
    //     } else if (props.audioState.loop === "all") {
    //       return <RepeatOneIcon />;
    //     } else {
    //       return <DoNotDisturbIcon />;
    //     }
    //   };
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
          return props.audioState.loop !== "none" ? "blue" : "gray";
        };

        return (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <ActionIcon
              onClick={toggleLoop}
              variant="subtle"
              color={getLoopColor()}
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
              <ActionIcon onClick={props.playPrev} variant="subtle">
                <IconPlayerSkipBack />
              </ActionIcon>

              <ActionIcon onClick={togglePlay} variant="subtle">
                {props.audioState?.isPlaying ? (
                  <IconPlayerPause />
                ) : (
                  <IconPlayerPlay />
                )}
              </ActionIcon>
              <ActionIcon onClick={props.playNext} variant="subtle">
                <IconPlayerSkipForward />
              </ActionIcon>
            </Box>

            <ActionIcon
              onClick={toggleShuffle}
              variant="subtle"
              color={props.audioState?.shuffle ? "blue" : "gray"}
            >
              <IconArrowsShuffle />
            </ActionIcon>
          </Box>
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
                borderTop: "1px solid var(--mantine-color-dark-4)",
            }}
        >
            {nowPlaying()}
            {progressBar()}
            {controls()}
        </Box>
    );
};
