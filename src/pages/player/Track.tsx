import { Box, Title } from "@mantine/core";
import { AudioFileRecord } from "../../api/types";
import classes from './Track.module.css';

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
            className={isSelected ? classes.trackSelected : classes.track}
            onClick={handleClick}
        >
            <Title order={6}>{props.track.title}</Title>
        </Box>
    );
};
