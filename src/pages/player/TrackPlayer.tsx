import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AudioState } from "../../api/types";
import { PlayControl } from "./PlayControl";
import { PhotoViewer } from "./PhotoViewer";

interface TrackPlayerProps {
  audioState: AudioState;
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
  playNext: () => void;
  playPrev: () => void;
  maxScreenHeight: number;
  showSlideshow: boolean;
  photos: string[];
  currentPhotoIndex: number;
  onBack: () => void;
}

export function TrackPlayer({
  audioState,
  setAudioState,
  playNext,
  playPrev,
  maxScreenHeight,
  showSlideshow,
  photos,
  currentPhotoIndex,
  onBack,
}: TrackPlayerProps) {
  return (
    <Box
      sx={{
        maxHeight: maxScreenHeight,
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <Box sx={{ flex: 0 }}>
        <IconButton sx={{}} onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      {showSlideshow && (
        <PhotoViewer photos={photos} currentPhotoIndex={currentPhotoIndex} />
      )}
      <Box sx={{ flex: 0 }}>
        <PlayControl
          audioState={audioState}
          setAudioState={setAudioState}
          playNext={playNext}
          playPrev={playPrev}
          showTrackPlayer={() => {}}
        />
      </Box>
    </Box>
  );
}
