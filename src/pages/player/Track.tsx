import { Box, Typography } from "@mui/material";
import { AudioFileRecord } from "../../api/types";

interface TrackProps {
  track: AudioFileRecord;
  selectedTrack: AudioFileRecord | null;
  setSelectedTrack: (audio: AudioFileRecord) => void;
}

export const Track = (props: TrackProps) => {
    const isSelected = props?.selectedTrack?.id === props.track.id;

    const handleClick = () => {
        props.setSelectedTrack(props.track);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                backgroundColor: isSelected
                    ? "rgba(25, 118, 210, 0.25)"
                    : "transparent",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                },
                "&:active": {
                    transform: "scale(0.995)",
                },
            }}
            onClick={handleClick}
        >
            <Typography variant="h6">{props.track.title}</Typography>
        </Box>
    );
};
