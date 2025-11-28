import { useState, useEffect } from "react";
import { useSearchParams, useLoaderData } from "react-router";
import { AudioFileRecord, AudioCatalog } from "../api/types";
import { PlayControl } from "../PlayControl";
import { Track } from "../Track";
import { Box, Paper } from "@mui/material";
import { useBrowser } from "../contexts/BrowserContext";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchAudioCatalog, fetchPhotos } from "../api/media";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

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

    const trackViewer = () => {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    justifyContent: "space-between",
                    //   padding: 2,
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
                {(!browserInfo.isMobile || !showTrackPlayer) && (
                    <Box sx={{ flex: 0 }}>
                        <PlayControl
                            audioState={audioState}
                            setAudioState={setAudioState}
                            playNext={playNext}
                            playPrev={playPrev}
                            showTrackPlayer={() => setShowTrackPlayer(true)}
                        />
                    </Box>
                )}
            </Box>
        );
    };

    const trackPlayer = () => {
        return (
            <Box
                sx={{
                    maxHeight: browserInfo.maxScreenHeight,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                }}
            >
                <Box sx={{ flex: 0 }}>
                    <IconButton sx={{}} onClick={() => setShowTrackPlayer(false)}>
                        <ArrowBackIcon />
                    </IconButton>
                </Box>
                {showSlideshow && photoViewer()}
                <Box sx={{ flex: 0 }}>
                    <PlayControl
                        audioState={audioState}
                        setAudioState={setAudioState}
                        playNext={playNext}
                        playPrev={playPrev}
                        showTrackPlayer={() => setShowTrackPlayer(true)}
                    />
                </Box>
            </Box>
        );
    };

    const photoViewer = () => {
        return (
            <Box sx={{ flex: 1.5, padding: 10 }}>
                {photos.length > 0 && (
                    <img
                        src={photos[currentPhotoIndex]}
                        alt={`Slide ${currentPhotoIndex}`}
                        style={{ height: "100%", width: "100%", objectFit: "cover" }}
                    />
                )}
            </Box>
        );
    };

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
                    trackPlayer()
                ) : (
                        trackViewer()
                )
            ) : (
                <>
                    {trackViewer()}
                        {showSlideshow && photoViewer()}
                </>
            )}
        </Paper>
    );
};

