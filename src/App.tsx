import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import {
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  Slider,
  CircularProgress,
} from "@mui/material";
import { Howl } from "howler";
import {
  fetchAudioCatalog,
  AudioCatalog,
  AudioFileRecord,
} from "./api/canciones";

interface AudioState {
  isPlaying: boolean;
  selectedTrack: AudioFileRecord | null;
  sound: Howl | null;
  position: number;
  duration: number;
  loop: "single" | "all" | "none";
  shuffle: boolean;
}
interface PlayControlProps {
  audioState: AudioState;
  setAudioState: any;
}
const PlayControl = (props: PlayControlProps) => {
  const togglePlay = () => {
    props.setAudioState((prev: AudioState) => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };
  useEffect(() => {
    const { sound, isPlaying } = props.audioState;
    if (!sound) return;

    console.log(
      "isPlaying",
      isPlaying,
      "sound.playing()",
      sound.playing(),
      "sound.state()",
      sound.state()
    );
    const isCurrentlyPlaying = sound.playing();
    if (isPlaying && !isCurrentlyPlaying) {
      sound.play();
    } else if (!isPlaying && isCurrentlyPlaying) {
      sound.pause();
    }
  }, [props.audioState?.isPlaying, props.audioState?.sound]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Slider
          min={0}
          max={props.audioState?.duration ?? 100}
          step={1}
          value={props.audioState?.position ?? 0}
          valueLabelDisplay="auto"
          onChange={(e, value) => {
            console.log(e, value);
            if (!props.audioState.sound) return;
            props.setAudioState((prev: AudioState) => ({
              ...prev,
              position: value,
            }));
            props.audioState.sound.seek(value);
          }}
          sx={{ width: "90%", height: "10px" }}
        />
      </Box>
      <Box>
        <Button>Shuffle</Button>
        <Button>Prev</Button>

        <Button
          onClick={togglePlay}
          sx={{
            backgroundColor: props.audioState?.isPlaying
              ? "#ff4444"
              : "#4444ff",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {props.audioState?.isPlaying ? "■ Stop" : "▶ Play"}
        </Button>
        <Button>Next</Button>
        <Button>Loop</Button>
      </Box>
    </Box>
  );
};
interface TrackProps {
  audio: AudioFileRecord;
  selectedTrack: AudioFileRecord | null;
  setSelectedTrack: (audio: AudioFileRecord) => any;
}
const Track = (props: TrackProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        width: "100%",
        backgroundColor:
          props?.selectedTrack?.id === props.audio.id
            ? "rgba(25, 118, 210, 0.08)"
            : "transparent",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "rgba(25, 118, 210, 0.04)",
        },
        "&:active": {
          transform: "scale(0.995)",
        },
      }}
      onDoubleClick={() => {
        console.log("onDoubleClick", props.audio);
        props.setSelectedTrack(props.audio);
      }}
    >
      <Typography variant="h4">{props.audio.title}</Typography>
    </Box>
  );
};

function App() {
  const createSound = (url: string) => {
    const sound = new Howl({
      src: [url],
      autoplay: false,
      preload: true,
      onseek: (seek) => {
        console.log("seek", seek);
      },
      onend: () => {
        console.log("end");
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
  const [error, setError] = useState<boolean>(false);

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
  console.log("audioState", audioState);
  // Update the track selection logic
  const handleTrackSelect = useCallback((track: AudioFileRecord) => {
    // if (track.id === audioState.selectedTrack?.id) return;
    console.log("track", track);
    console.log("audioState.selectedTrack", audioState.selectedTrack);
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
  }, []);

  const playNext = () => {
    const currentIndex = audioState.selectedTrack?.index || 0;
    const nextIndex = currentIndex + 1;
    const nextSong = catalog?.songs[nextIndex];
    if (!nextSong) return;
    handleTrackSelect(nextSong);
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
  }, []);

  console.log(catalog);

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

  // Add ref to store interval ID
  const positionInterval = useRef<number | null>(null);

  // Add position tracking functions
  const startPositionTracking = useCallback(() => {
    if (positionInterval.current) return;

    positionInterval.current = window.setInterval(() => {
      if (audioState.sound) {
        setAudioState((prev) => ({
          ...prev,
          position: prev.sound?.seek() || 0,
        }));
      }
    }, 500);
  }, [audioState.sound]);

  const stopPositionTracking = useCallback(() => {
    if (positionInterval.current) {
      window.clearInterval(positionInterval.current);
      positionInterval.current = null;
    }
  }, []);

  // Clean up interval on unmount
  // useEffect(() => {
  //   return () => {
  //     audioState.sound?.stop();
  //     audioState.sound?.unload();
  //     stopPositionTracking();
  //   };
  // }, [stopPositionTracking]);

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100dvh",
        width: "100vw",
      }}
    >
      <CssBaseline />
      <Container
        sx={{
          display: "flex",
          flexDirection: "row",
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            maxWidth: "30vw",
          }}
        >
          {loading ? (
            <CircularProgress size={100} />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flexWrap: "wrap",
                // gap: 1,
                justifyContent: "flex-start",
                alignItems: "flex-start",
                flex: 1,
                overflowY: "auto",
              }}
            >
              {catalog?.songs.map((audio: AudioFileRecord) => (
                <Track
                  key={audio.id}
                  audio={audio}
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
            />
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{ height: "100%", width: "100%", backgroundColor: "blue" }}
          ></Box>
        </Box>
      </Container>
    </Box>
  );
}

export default App;
