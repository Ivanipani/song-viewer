import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { AudioState, AudioFileRecord } from "./api/types";
import { PlayControl } from "./PlayControl";
import { Track } from "./Track";
import { Box, Container, CircularProgress, Paper } from "@mui/material";
import { useMedia } from "./contexts/MediaContext";
import { useBrowser } from "./contexts/BrowserContext";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const Player = () => {
    const { browserInfo } = useBrowser();
    const { catalog, photos, loading } = useMedia();
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // Consolidate audio-related state
    const [audioState, setAudioState] = useState<AudioState>({
        isPlaying: false,
        selectedTrack: null,
        sound: null,
        position: 0,
        duration: 0,
        loop: "none",
        shuffle: false,
    });

    const [showTrackPlayer, setShowTrackPlayer] = useState(false);

    const createSound = (url: string) => {
        const sound = new Howl({
            src: [url],
            autoplay: false,
            preload: true,
            onseek: (seek) => {
                console.log("onseek", seek);
            },
            onload: () => {
                setAudioState((prev) => ({
                    ...prev,
                    duration: sound.duration(),
                }));
                console.log("onload");
            },
            onloaderror: (id, error) => {
                console.log("onloaderror", id, error);
            },
            onplayerror: (id, error) => {
                console.log("onplayerror", id, error);
            },
            onplay: () => {
                console.log("onplay");
                // startPositionTracking();
            },
            onstop: () => {
                console.log("onstop");
                // stopPositionTracking();
            },
            onend: () => {
                console.log("onend");
                setAudioState((prev) => ({
                    ...prev,
                    isPlaying: false,
                }));
                // stopPositionTracking();
            },
            onpause: () => {
                console.log("onpause");
                // stopPositionTracking();
            },
        });
        console.log("created sound", sound);
        return sound;
    };

    // Update the track selection logic
    const handleTrackSelect = (track: AudioFileRecord) => {
        // if (track.id === audioState.selectedTrack?.id) return;
        setAudioState((prev) => {
            // Clean up previous sound
            if (prev.sound) {
                prev.sound.stop();
                prev.sound.unload();
            }

            // Create new sound instance
            const newSound = createSound(track.url);

            return {
                ...prev,
                selectedTrack: track,
                sound: newSound,
                isPlaying: true,
                position: 0,
                duration: newSound.duration(),
            };
        });
    };

    const playNext = () => {
        const currentIndex = audioState.selectedTrack?.index || 0;
        const nextIndex = currentIndex + 1;
        const nextSong = catalog?.songs[nextIndex];
        if (!nextSong) return;
        handleTrackSelect(nextSong);
    };
    const playPrev = () => {
        const currentIndex = audioState.selectedTrack?.index || 0;
        const prevIndex = currentIndex - 1;
        const prevSong = catalog?.songs[prevIndex];
        if (!prevSong) return;
        handleTrackSelect(prevSong);
    };

    // Add ref to store interval ID
    const positionInterval = useRef<number | null>(null);

    // Add position tracking functions

    const startPositionTracking = () => {
        if (positionInterval.current) return;

        positionInterval.current = window.setInterval(() => {
            if (audioState.sound) {
                setAudioState((prev) => ({
                    ...prev,
                    position: prev.sound?.seek() || 0,
                }));
            }
        }, 1000);
    };

    const stopPositionTracking = () => {
        if (positionInterval.current) {
            window.clearInterval(positionInterval.current);
            positionInterval.current = null;
        }
    };

    useEffect(() => {
        if (photos.length === 0) return;

        const interval = setInterval(() => {
            setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
        }, 3000); // Change photo every 3 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, [photos]); // Run this effect when photos are loaded

    const trackViewer = () => {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    justifyContent: "space-between",
                    //   padding: 2,
                    overflowY: "auto",
                }}
            >
                {loading ? (
                    <CircularProgress size={100} sx={{ alignSelf: "center" }} />
                ) : (
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
                        {catalog?.songs.map((track: AudioFileRecord) => (
                            <Track
                                key={track.id}
                                track={track}
                                selectedTrack={audioState.selectedTrack}
                                setSelectedTrack={handleTrackSelect}
                            />
                        ))}
                    </Box>
                )}
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
                {photoViewer()}
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
            <Box sx={{ flex: 1.5 }}>
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

    // Update the initial audio state setup in useEffect
    useEffect(() => {
        if (catalog) {
            setAudioState((prev) => {
                const newSound = createSound(catalog.songs[0].url);
                return {
                    ...prev,
                    selectedTrack: catalog.songs[0],
                    sound: newSound,
                    position: 0,
                    duration: newSound.duration(),
                    loop: "none",
                    shuffle: false,
                };
            });
        }
        return () => {
            if (audioState.sound) {
                audioState.sound.stop();
                audioState.sound.unload();
            }
            stopPositionTracking();
        };
    }, [catalog]);

    useEffect(() => {
        if (audioState.sound && audioState.isPlaying) {
            startPositionTracking();
        } else {
            stopPositionTracking();
        }
    }, [audioState.sound, audioState.isPlaying]);

    return (
        <Container disableGutters={browserInfo.isMobile}>
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
                        {photoViewer()}
                    </>
                )}
            </Paper>
        </Container>
    );
};
