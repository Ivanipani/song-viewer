import { useState, useEffect } from "react";
import { useMatches, useSearchParams, useNavigate } from "react-router";
import { AudioCatalog } from "../../api/types";
import { TrackPlayer } from "./TrackPlayer";
import { useBrowser } from "../../contexts/BrowserContext";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

export default function FullPlayer() {
  const matches = useMatches();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { browserInfo } = useBrowser();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Find parent route data - check all matches for data
  const parentMatch = matches.find(match => match.data && 'catalog' in match.data);
  const parentData = parentMatch?.data as { catalog: AudioCatalog; photos: string[] } | undefined;

  const catalog = parentData?.catalog;
  const photos = parentData?.photos || [];
  const showSlideshow = searchParams.get('slideshow') === 'true';

  const { audioState, setAudioState, playNext, playPrev } =
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
    <TrackPlayer
      audioState={audioState}
      setAudioState={setAudioState}
      playNext={playNext}
      playPrev={playPrev}
      maxScreenHeight={browserInfo.maxScreenHeight}
      showSlideshow={showSlideshow}
      photos={photos}
      currentPhotoIndex={currentPhotoIndex}
      onBack={() => navigate('/')}
    />
  );
}
