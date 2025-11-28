import { useState, useEffect } from "react";
import { useSearchParams, useLoaderData } from "react-router";
import { AudioCatalog } from "../api/types";
import { Paper } from "@mui/material";
import { useBrowser } from "../contexts/BrowserContext";
import { fetchAudioCatalog, fetchPhotos } from "../api/media";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { TrackViewer } from "./player/TrackViewer";
import { TrackPlayer } from "./player/TrackPlayer";
import { PhotoViewer } from "./player/PhotoViewer";

export async function clientLoader() {
  const [catalog, photos] = await Promise.all([
    fetchAudioCatalog(),
    fetchPhotos()
  ]);

  return {
    catalog,
    photos,
  };
}

export default function Player () {
    const [searchParams] = useSearchParams();
    const showSlideshow = searchParams.has('aita');
    const { browserInfo } = useBrowser();
    const { catalog, photos } = useLoaderData() as { catalog: AudioCatalog; photos: string[] };
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showTrackPlayer, setShowTrackPlayer] = useState(false);

    // Use custom audio player hook
    const { audioState, setAudioState, handleTrackSelect, playNext, playPrev } = useAudioPlayer({ catalog });

    useEffect(() => {
        if (!showSlideshow || photos.length === 0) return;

        const interval = setInterval(() => {
            setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
        }, 3000); // Change photo every 3 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, [showSlideshow, photos]); // Run this effect when showSlideshow or photos change

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
            {browserInfo.isMobile ? (
                showTrackPlayer ? (
                    <TrackPlayer
                        audioState={audioState}
                        setAudioState={setAudioState}
                        playNext={playNext}
                        playPrev={playPrev}
                        maxScreenHeight={browserInfo.maxScreenHeight}
                        showSlideshow={showSlideshow}
                        photos={photos}
                        currentPhotoIndex={currentPhotoIndex}
                        onBack={() => setShowTrackPlayer(false)}
                    />
                ) : (
                    <TrackViewer
                        catalog={catalog}
                        audioState={audioState}
                        handleTrackSelect={handleTrackSelect}
                        setAudioState={setAudioState}
                        playNext={playNext}
                        playPrev={playPrev}
                        isMobile={browserInfo.isMobile}
                        showTrackPlayer={showTrackPlayer}
                        onShowTrackPlayer={() => setShowTrackPlayer(true)}
                    />
                )
            ) : (
                <>
                    <TrackViewer
                        catalog={catalog}
                        audioState={audioState}
                        handleTrackSelect={handleTrackSelect}
                        setAudioState={setAudioState}
                        playNext={playNext}
                        playPrev={playPrev}
                        isMobile={browserInfo.isMobile}
                        showTrackPlayer={showTrackPlayer}
                        onShowTrackPlayer={() => setShowTrackPlayer(true)}
                    />
                    {showSlideshow && (
                        <PhotoViewer
                            photos={photos}
                            currentPhotoIndex={currentPhotoIndex}
                        />
                    )}
                </>
            )}
        </Paper>
    );
};

