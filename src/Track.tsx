import { Box, Typography } from "@mui/material";
import { AudioFileRecord } from "./api/types";

interface TrackProps {
  track: AudioFileRecord;
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
        width: "100%",
        backgroundColor:
          props?.selectedTrack?.id === props.track.id
            ? "rgba(25, 118, 210, 0.25)"
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
      onClick={() => {
        props.setSelectedTrack(props.track);
      }}
    >
      <Typography variant="h6">{props.track.title}</Typography>
    </Box>
  );
};
