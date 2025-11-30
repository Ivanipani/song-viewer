/**
 * Individual track list item component.
 *
 * Parent components: PlayerLayout (via sidebar)
 *
 * Responsibilities:
 * - Displays track title in sidebar/list
 * - Shows visual indicator when track is selected
 * - Handles click events to navigate to track detail view
 * - Loads audio for the selected track
 *
 * Data received from parent:
 * - track: AudioFileRecord - the track to display
 * - selectedTrack: AudioFileRecord | null - currently selected track (from audioState)
 * - setSelectedTrack: callback to load track audio
 * - onCloseMobile: optional callback to close mobile sidebar
 *
 * Navigation behavior:
 * - Navigates to /track/:trackId/notes when clicked
 * - Calls setSelectedTrack to load audio
 * - Closes mobile menu if onCloseMobile provided
 */
import { Box, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import { AudioFileRecord } from "../../api/types";
import classes from './Track.module.css';

interface TrackProps {
  track: AudioFileRecord;
  selectedTrack: AudioFileRecord | null;
  setSelectedTrack: (audio: AudioFileRecord) => void;
  onCloseMobile?: () => void;
}

export const Track = (props: TrackProps) => {
    const navigate = useNavigate();
    const isSelected = props?.selectedTrack?.id === props.track.id;

    const handleClick = () => {
        // Load track audio
        props.setSelectedTrack(props.track);

        // Navigate to track detail view (index route shows notes by default)
        navigate(`/track/${props.track.id}`);

        // Close mobile sidebar if handler provided
        if (props.onCloseMobile) {
            props.onCloseMobile();
        }
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
