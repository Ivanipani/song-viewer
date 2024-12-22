import { useState, useEffect } from "react";
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
// function ColorAutocomplete({ onSubmit }) {
// const colors = ["red", "green", "blue"];
//   const [value, setValue] = useState(null);
//   const [inputValue, setInputValue] = useState("");

//   const filterOptions = (options, { inputValue }) => {
//     if (inputValue === "") {
//       return [];
//     }
//     return options.filter((option) =>
//       option.toLowerCase().includes(inputValue.toLowerCase())
//     );
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter" && value) {
//       onSubmit(value);
//       setValue(null);
//       setInputValue("");
//     }
//   };

//   return (
//     <Autocomplete
//       value={value}
//       onChange={(event, newValue) => setValue(newValue)}
//       inputValue={inputValue}
//       onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
//       options={colors}
//       filterOptions={filterOptions}
//       renderInput={(params) => (
//         <TextField
//           {...params}
//           label="Select a color"
//           onKeyDown={handleKeyDown}
//         />
//       )}
//     />
//   );
// }

interface PlayControlProps {
  selectedSong: AudioFileRecord | null;
  sound: Howl | null;
  loaded: boolean;
  setLoaded: any;
  isPlaying: boolean;
  setIsPlaying: any;
}
const PlayControl = (props: PlayControlProps) => {
  const togglePlay = () => {
    if (!props.sound) return;
    if (!props.loaded) {
      props.sound.load();
      props.setLoaded(true);
    }
    if (props.sound.playing()) {
      props.sound.pause();
    } else {
      props.sound.play();
    }
    props.setIsPlaying(!props.isPlaying);
  };
  useEffect(() => {
    if (props.isPlaying && props.sound) {
      props.sound.load();
      props.sound.play();
    }
  }, [props.sound]);
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
      <Box>
        <Slider></Slider>
      </Box>
      <Box>
        <Button>Shuffle</Button>
        <Button>Prev</Button>

        <Button
          onClick={togglePlay}
          sx={{
            backgroundColor: props.isPlaying ? "#ff4444" : "#4444ff",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {props.isPlaying ? "■ Stop" : "▶ Play"}
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
        border: "1px solid",
        width: "100%",
        backgroundColor:
          props?.selectedTrack.id === props.audio.id ? "red" : null,
      }}
      onClick={() => {
        props.setSelectedTrack(props.audio);
        console.log(props.audio);
      }}
    >
      <Typography variant="h4">{props.audio.title}</Typography>
    </Box>
  );
};

// interface Song {
//   id: number;
//   name: string;
//   duration: number;
//   url: string;
//   created_at: string;
//   updated_at: string;
// }

function App() {
  const [catalog, setCatalog] = useState<AudioCatalog | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<AudioFileRecord | null>(
    null
  );
  const [sound, setSound] = useState<Howl | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAudioCatalog()
      .then((c) => {
        setCatalog(c);
        setSelectedTrack(c.songs[0]);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
      });
  }, []);

  useEffect(() => {
    if (selectedTrack) {
      if (sound) {
        // Already playing something
        sound.stop();
      }
      const s = new Howl({
        src: [selectedTrack.url],
        html5: true,
        autoplay: false,
        preload: false,
      });
      setSound(s);
    }
  }, [selectedTrack]);

  console.log(catalog);

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
          // marginBlock: 1,
        }}
      >
        {/* <Box sx={{ display: "flex", flexDirection: "row" }}> */}
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
              {catalog?.songs.map((audio: AudioFileRecord) => {
                return (
                  <Track
                    key={audio.id}
                    audio={audio}
                    selectedTrack={selectedTrack}
                    setSelectedTrack={setSelectedTrack}
                  />
                );
              })}
            </Box>
          )}
          <Box sx={{ flex: 0, height: "15%" }}>
            <PlayControl
              selectedSong={selectedTrack}
              sound={sound}
              loaded={loaded}
              setLoaded={setLoaded}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{ height: "100%", width: "100%", backgroundColor: "blue" }}
          ></Box>
        </Box>
        {/* </Box> */}
      </Container>
    </Box>
  );
}

export default App;
