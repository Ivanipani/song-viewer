import { Box } from "@mui/material";
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
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "space-between",
        maxWidth: "30%",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flex: 1,
          overflowY: "auto",
          padding: 2,
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
        <Box sx={{ flex: 0 }}>
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
