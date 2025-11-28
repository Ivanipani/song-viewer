import { useState, useEffect } from "react";
import { useSearchParams, useLoaderData, useRouteError, useNavigate } from "react-router";
import { AudioCatalog } from "../api/types";
import { Paper, Typography, Button, Box } from "@mui/material";
import { useBrowser } from "../contexts/BrowserContext";
import { fetchAudioCatalog, fetchPhotos } from "../api/media";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { TrackViewer } from "./player/TrackViewer";
import { TrackPlayer } from "./player/TrackPlayer";
import { PhotoViewer } from "./player/PhotoViewer";

export async function clientLoader() {
  try {
    const [catalog, photos] = await Promise.all([
      fetchAudioCatalog(),
      fetchPhotos().catch(() => []) // Photos optional - fail gracefully
    ]);

    if (!catalog || catalog.songs.length === 0) {
      throw new Response('No songs found in catalog', { status: 404 });
    }

    return {
      catalog,
      photos,
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response('Failed to load music catalog', {
      status: 500,
      statusText: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <Paper sx={{ padding: 4, textAlign: 'center', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Unable to Load Music Catalog
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {error instanceof Response
            ? error.statusText
            : error instanceof Error
              ? error.message
              : 'Unknown error occurred'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mr: 2 }}
        >
          Retry
        </Button>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Paper>
  );
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

