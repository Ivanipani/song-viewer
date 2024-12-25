import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { fetchAudioCatalog, AudioCatalog } from "./api/canciones";
import { AudioState, AudioFileRecord } from "./api/types";
import { PlayControl } from "./PlayControl";
import { Track } from "./Track";
import { Box, Container, CircularProgress } from "@mui/material";
import { useMediaQuery } from "@mui/material";

export const Player = () => {
  const isMobile = useMediaQuery("(max-width: 600px)");
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

  const [catalog, setCatalog] = useState<AudioCatalog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [_, setError] = useState<boolean>(false);

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

  // Load the catalog, select the first song
  useEffect(() => {
    setLoading(true);
    fetchAudioCatalog()
      .then((c) => {
        setCatalog(c);
        setAudioState((prev) => {
          const newSound = createSound(c.songs[0].url);
          return {
            ...prev,
            selectedTrack: c.songs[0],
            sound: newSound,
            position: 0,
            duration: newSound.duration(),
            loop: "none",
            shuffle: false,
          };
        });
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
      });
    return () => {
      if (audioState.sound) {
        audioState.sound.stop();
        audioState.sound.unload();
      }
      stopPositionTracking();
    };
  }, []);

  // Add keyboard event listener
  // useEffect(() => {
  //   const handleKeyPress = (event: KeyboardEvent) => {
  //     if (event.code === "Space") {
  //       event.preventDefault(); // Prevent space from scrolling the page
  //       setAudioState((prev) => {
  //         if (!prev.sound) return prev;
  //         if (prev.isPlaying) {
  //           prev.sound.pause();
  //         } else {
  //           prev.sound.play();
  //         }
  //         return { ...prev, isPlaying: !prev.isPlaying };
  //       });
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyPress);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyPress);
  //   };
  // }, [audioState.isPlaying]);

  useEffect(() => {
    if (audioState.sound && audioState.isPlaying) {
      startPositionTracking();
    } else {
      stopPositionTracking();
    }
  }, [audioState.sound, audioState.isPlaying]);

  // Add ref to store interval ID
  const positionInterval = useRef<number | null>(null);

  // Add position tracking functions

  const startPositionTracking = () => {
    console.log("startPositionTracking");
    if (positionInterval.current) return;
    console.log("positionInterval.current", positionInterval.current);

    positionInterval.current = window.setInterval(() => {
      console.log("audioState.sound", audioState.sound);
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

  const trackViewer = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-between",
          padding: 2,
          border: "1px solid blue",
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
        <Box sx={{ flex: 0, height: "15%" }}>
          <PlayControl
            audioState={audioState}
            setAudioState={setAudioState}
            playNext={playNext}
            playPrev={playPrev}
          />
        </Box>
      </Box>
    );
  };
  const photoViewer = () => {
    return (
      <Box sx={{ flex: 1, border: "1px solid red" }}>
        <Box sx={{ height: "100%", width: "100%" }}></Box>
      </Box>
    );
  };
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "row",
        maxHeight: "100dvh",
        minHeight: "100dvh",
        gap: 1,
      }}
    >
      {trackViewer()}
      {!isMobile && photoViewer()}
    </Container>
  );
};
