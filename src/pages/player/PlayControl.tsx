import { Box, Slider, Typography, IconButton, Paper } from "@mui/material";
import { useEffect } from "react";
import { AudioState } from "../../api/types";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
// import LoopIcon from "@mui/icons-material/Loop";
// import RepeatOneIcon from "@mui/icons-material/RepeatOne";
// import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";

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
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">
              {formatTime(props.audioState?.position ?? 0)}
            </Typography>
            <Slider
              min={0}
              max={props.audioState?.duration ?? 100}
              step={1}
              value={props.audioState?.position ?? 0}
              onChange={(_, value) => {
                props.setAudioState((prev: AudioState) => ({
                  ...prev,
                  position: value,
                }));
              }}
              onChangeCommitted={(_, value) => {
                if (!props.audioState.sound) return;
                props.audioState.sound.seek(value as number);
              }}
              sx={{
                width: "90%",
                height: "5px",
                color: "white",
                marginInline: "10px",
                "& .MuiSlider-thumb": {
                  display: "none",
                  height: "10px",
                  width: "10px",
                },
                "&:hover": {
                  opacity: 0.8,
                },
                "&:hover .MuiSlider-thumb": {
                  display: "block",
                  boxShadow: "none",
                },
              }}
            />
            <Typography variant="subtitle2">
              {formatTime(props.audioState?.duration ?? 0)}
            </Typography>
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
                {/* <IconButton onClick={toggleShuffle}>
          <ShuffleIcon
            sx={{ color: props.audioState?.shuffle ? "green" : "white" }}
          />
        </IconButton> */}
                <IconButton onClick={props.playPrev}>
                    <SkipPreviousIcon />
                </IconButton>

                <IconButton
                    onClick={togglePlay}
                    sx={{
                        color: "white",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "4px",
                    }}
                >
                    {props.audioState?.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={props.playNext}>
                    <SkipNextIcon />
                </IconButton>
                {/* <IconButton onClick={toggleLoopState}>{getLoopIcon()}</IconButton> */}
            </Box>
        );
    };
    const nowPlaying = () => {
        return (
            <Box sx={{ alignSelf: "flex-start" }}>
                <Typography variant="h6">
                    {props.audioState?.selectedTrack?.title}
                </Typography>
                <Typography variant="subtitle2">
                    {props.audioState?.selectedTrack?.artist}
                </Typography>
            </Box>
        );
    };

    return (
        <Paper
            sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                flex: 1,
                paddingInline: 2,
                paddingBlock: 1,
            }}
            onClick={props.showTrackPlayer}
        >
            {nowPlaying()}
            {progressBar()}
            {controls()}
        </Paper>
    );
};
