/**
 * Individual track list item component.
 *
 * Parent components: PlayerIndex, TrackViewer
 *
 * Responsibilities:
 * - Displays track title in sidebar/list
 * - Shows visual indicator when track is selected
 * - Handles click events to select and play track
 *
 * Data received from parent:
 * - track: AudioFileRecord - the track to display
 * - selectedTrack: AudioFileRecord | null - currently selected track (from audioState)
 * - setSelectedTrack: callback to notify parent when track is clicked
 *
 * No data ownership - purely presentational component.
 * Calls parent's setSelectedTrack which triggers audio loading in useAudioPlayer hook.
 */
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
