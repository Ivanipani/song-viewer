import { useState, useEffect } from "react";
import { CssBaseline, Container, Box, Typography, Button } from "@mui/material";
import { Howl } from "howler";
import { fetchSongs, AudioFileRecord } from "./api/canciones";
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

interface TrackProps {
  audio: AudioFileRecord;
}

const Track = ({ audio }: TrackProps) => {
  const [sound, setSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    const s = new Howl({
      src: [audio.url],
      autoplay: false,
      // preload: false,
    });
    setSound(s);
  }, [audio.url]);

  const handleClick = () => {
    if (!sound) return;
    if (sound.playing()) {
      sound.pause();
    } else {
      sound.play();
    }
    // if (isPlaying) {
    //   sound.stop();
    // } else {
    //   sound.play();
    // }
    setIsPlaying(!isPlaying);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <Button
        onClick={handleClick}
        sx={{
          backgroundColor: isPlaying ? "#ff4444" : "#4444ff",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
        }}
      >
        {isPlaying ? "■ Stop" : "▶ Play"}
      </Button>
      <Typography variant="h5">{audio.name}</Typography>
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
  const [songs, setSongs] = useState<AudioFileRecord[]>([]);

  useEffect(() => {
    fetchSongs().then((s) => setSongs(s));
  }, []);

  console.log(songs);

  return (
    <Box>
      <CssBaseline />
      <Container>
        <h1>Canciones</h1>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {songs.map((audio: AudioFileRecord) => {
            if (audio.name.endsWith(".mp3") || audio.name.endsWith(".wav")) {
              return <Track audio={audio} />;
            } else {
              return null;
            }
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default App;
