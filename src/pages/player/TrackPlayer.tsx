import { Box, ActionIcon } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { AudioState } from "../../api/types";
import { PlayControl } from "./PlayControl";
import { PhotoViewer } from "./PhotoViewer";

interface TrackPlayerProps {
  audioState: AudioState;
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
  playNext: () => void;
  playPrev: () => void;
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
  showSlideshow,
  photos,
  currentPhotoIndex,
  onBack,
}: TrackPlayerProps) {
  return (
    <Box
      style={{
        maxHeight: '100dvh',
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <Box style={{ flex: 0 }}>
        <ActionIcon variant="subtle" onClick={onBack}>
          <IconArrowLeft />
        </ActionIcon>
      </Box>
      {showSlideshow && (
        <PhotoViewer photos={photos} currentPhotoIndex={currentPhotoIndex} />
      )}
      <Box style={{ flex: 0 }}>
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
