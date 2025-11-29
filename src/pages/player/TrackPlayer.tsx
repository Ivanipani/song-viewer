/**
 * Full-screen track player view (unused in current routing).
 *
 * Component hierarchy:
 * TrackPlayer
 *   ├─ Back button (IconArrowLeft)
 *   ├─ PhotoViewer (when showSlideshow is true)
 *   └─ PlayControl (player controls at bottom)
 *
 * Responsibilities:
 * - Displays full-screen player interface
 * - Shows photo slideshow when enabled
 * - Provides navigation back to track list
 *
 * Data received from parent:
 * - audioState: AudioState - from useAudioPlayer hook
 * - setAudioState: audioState updater
 * - playNext/playPrev: track navigation callbacks
 * - showSlideshow: boolean - whether to show photos
 * - photos: string[] - photo URLs (from parent route loader)
 * - currentPhotoIndex: number - current photo index
 * - onBack: callback to return to track list view
 *
 * No data ownership - all state passed from parent.
 * No network calls - operates on parent's data.
 *
 * Note: This component is currently unused in routes.ts but maintained for potential future use.
 */
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
