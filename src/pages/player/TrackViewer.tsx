/**
 * Track list sidebar component (unused in current routing).
 *
 * Component hierarchy:
 * TrackViewer
 *   ├─ Track (multiple - one per song in catalog)
 *   └─ PlayControl (player controls at bottom)
 *
 * Responsibilities:
 * - Displays scrollable list of all tracks
 * - Shows PlayControl panel at bottom
 * - Handles mobile navigation to full player view
 *
 * Data received from parent:
 * - catalog: AudioCatalog - song list
 * - audioState: AudioState - from useAudioPlayer hook
 * - handleTrackSelect: callback to select/play track
 * - setAudioState: audioState updater
 * - playNext/playPrev: track navigation callbacks
 * - isMobile: boolean - responsive layout flag
 * - showTrackPlayer: boolean - whether full player is visible
 * - onShowTrackPlayer: callback to show full player
 *
 * No data ownership - all state passed from parent.
 * No network calls - operates on parent's data.
 *
 * Note: This component is currently unused in routes.ts but maintained for potential future use.
 */
import { Box } from "@mantine/core";
import { useNavigate } from "react-router";
import { AudioState, AudioFileRecord, AudioCatalog } from "../../api/types";
import { Track } from "./Track";
import { PlayControl } from "./PlayControl";

interface TrackViewerProps {
  catalog: AudioCatalog;
  audioState: AudioState;
  handleTrackSelect: (track: AudioFileRecord) => void;
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
  playNext: () => void;
  playPrev: () => void;
  isMobile: boolean;
  showTrackPlayer: boolean;
  onShowTrackPlayer: () => void;
}

export function TrackViewer({
  catalog,
  audioState,
  handleTrackSelect,
  setAudioState,
  playNext,
  playPrev,
  isMobile,
  showTrackPlayer,
  onShowTrackPlayer,
}: TrackViewerProps) {
  const navigate = useNavigate();

  const handleShowPlayer = () => {
    if (isMobile) {
      navigate('/player');
    } else {
      onShowTrackPlayer();
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "space-between",
        maxWidth: "30%",
        overflowY: "auto",
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        {catalog.songs.map((track: AudioFileRecord) => (
          <Track
            key={track.id}
            track={track}
            selectedTrack={audioState.selectedTrack}
            setSelectedTrack={handleTrackSelect}
          />
        ))}
      </Box>
      {(!isMobile || !showTrackPlayer) && (
        <Box style={{ flex: 0 }}>
          <PlayControl
            audioState={audioState}
            setAudioState={setAudioState}
            playNext={playNext}
            playPrev={playPrev}
            showTrackPlayer={handleShowPlayer}
          />
        </Box>
      )}
    </Box>
  );
}
