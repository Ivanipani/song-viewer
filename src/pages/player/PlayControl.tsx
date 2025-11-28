import { Box, Slider, Text, Title, ActionIcon, Paper } from "@mantine/core";
import { useEffect } from "react";
import { AudioState } from "../../api/types";
import {
  IconPlayerSkipBack,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipForward
} from '@tabler/icons-react';
import classes from './PlayControl.module.css';

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
    const formatTime = (seconds: number) => {
        const roundedSeconds = Math.round(seconds);
        const minutes = Math.floor(roundedSeconds / 60);
        const remainingSeconds = Math.round(roundedSeconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
        return (
            <Box>
                <ActionIcon onClick={props.playPrev} variant="subtle">
                    <IconPlayerSkipBack />
                </ActionIcon>

                <ActionIcon
                    onClick={togglePlay}
                    variant="subtle"
                >
                    {props.audioState?.isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
                </ActionIcon>
                <ActionIcon onClick={props.playNext} variant="subtle">
                    <IconPlayerSkipForward />
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
        <Paper
            shadow="md"
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                flex: 1,
                paddingInline: "1rem",
                paddingBlock: "0.5rem",
            }}
            onClick={props.showTrackPlayer}
        >
            {nowPlaying()}
            {progressBar()}
            {controls()}
        </Paper>
    );
};
