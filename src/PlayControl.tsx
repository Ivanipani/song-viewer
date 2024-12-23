import { Box, Button, Slider, Typography } from "@mui/material";
import { useEffect } from "react";
import { AudioState } from "./api/types";

interface PlayControlProps {
  audioState: AudioState;
  setAudioState: any;
  playNext: () => void;
  playPrev: () => void;
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

    console.log(
      "isPlaying",
      isPlaying,
      "sound.playing()",
      sound.playing(),
      "sound.state()",
      sound.state()
    );
    const isCurrentlyPlaying = sound.playing();
    if (isPlaying && !isCurrentlyPlaying) {
      sound.play();
    } else if (!isPlaying && isCurrentlyPlaying) {
      sound.pause();
    }
  }, [props.audioState?.isPlaying, props.audioState?.sound]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
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
          sx={{ width: "90%", height: "10px" }}
        />
        <Typography variant="subtitle2">
          {formatTime(props.audioState?.duration ?? 0)}
        </Typography>
      </Box>
      <Box>
        <Button>Shuffle</Button>
        <Button onClick={props.playPrev}>Prev</Button>

        <Button
          onClick={togglePlay}
          sx={{
            backgroundColor: props.audioState?.isPlaying
              ? "#ff4444"
              : "#4444ff",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {props.audioState?.isPlaying ? "■ Stop" : "▶ Play"}
        </Button>
        <Button onClick={props.playNext}>Next</Button>
        <Button>Loop</Button>
      </Box>
    </Box>
  );
};
