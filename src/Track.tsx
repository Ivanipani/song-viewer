import { Box, Typography } from "@mui/material";
import { AudioFileRecord } from "./api/types";

interface TrackProps {
  audio: AudioFileRecord;
  selectedTrack: AudioFileRecord | null;
  setSelectedTrack: (audio: AudioFileRecord) => any;
}

export const Track = (props: TrackProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        width: "100%",
        backgroundColor:
          props?.selectedTrack?.id === props.audio.id
            ? "rgba(25, 118, 210, 0.08)"
            : "transparent",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "rgba(25, 118, 210, 0.04)",
        },
        "&:active": {
          transform: "scale(0.995)",
        },
      }}
      onDoubleClick={() => {
        console.log("onDoubleClick", props.audio);
        props.setSelectedTrack(props.audio);
      }}
    >
      <Typography variant="h4">{props.audio.title}</Typography>
    </Box>
  );
};
