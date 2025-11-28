import { useState, useEffect } from "react";
import { useSearchParams, useMatches } from "react-router";
import { Paper } from "@mui/material";
import { AudioCatalog } from "../../api/types";
import { TrackViewer } from "./TrackViewer";
import { PhotoViewer } from "./PhotoViewer";
import { useBrowser } from "../../contexts/BrowserContext";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

export default function PlayerIndex() {
  const matches = useMatches();
  const [searchParams] = useSearchParams();
  const { browserInfo } = useBrowser();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Find parent route data - check all matches for data
  const parentMatch = matches.find(
    (match) => match.data && typeof match.data === "object" && "catalog" in match.data,
  );
  const parentData = parentMatch?.data as
    | { catalog: AudioCatalog; photos: string[] }
    | undefined;

  const catalog = parentData?.catalog;
  const photos = parentData?.photos || [];

  const showSlideshow = searchParams.get("slideshow") === "true";

  const { audioState, setAudioState, handleTrackSelect, playNext, playPrev } =
    useAudioPlayer({ catalog });

  useEffect(() => {
    if (!showSlideshow || photos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [showSlideshow, photos]);

  if (!catalog) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "row",
        maxHeight: "100dvh",
        minHeight: "100dvh",
      }}
    >
      <TrackViewer
        catalog={catalog}
        audioState={audioState}
        handleTrackSelect={handleTrackSelect}
        setAudioState={setAudioState}
        playNext={playNext}
        playPrev={playPrev}
        isMobile={browserInfo.isMobile}
        showTrackPlayer={false}
        onShowTrackPlayer={() => {}} // Not used on desktop
      />
      {showSlideshow && (
        <PhotoViewer photos={photos} currentPhotoIndex={currentPhotoIndex} />
      )}
    </Paper>
  );
}
