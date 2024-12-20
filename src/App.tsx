import { useState, useEffect } from "react";
import { CssBaseline, Container, Box, Typography } from "@mui/material";
import "./App.css";
import { Autocomplete, TextField } from "@mui/material";
import { Card, CardContent, CardActions, Button } from "@mui/material";
import { Howl } from "howler";

// const API_URL = "http://canciones.poochella.club";
const API_URL = import.meta.env.VITE_API_ENDPOINT;
const fetchSongs = async () => {
  try {
    const response = await fetch(`${API_URL}/canciones/`);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
};

const colors = ["red", "green", "blue"];

function ColorAutocomplete({ onSubmit }) {
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const filterOptions = (options, { inputValue }) => {
    if (inputValue === "") {
      return [];
    }
    return options.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && value) {
      onSubmit(value);
      setValue(null);
      setInputValue("");
    }
  };

  return (
    <Autocomplete
      value={value}
      onChange={(event, newValue) => setValue(newValue)}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={colors}
      filterOptions={filterOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select a color"
          onKeyDown={handleKeyDown}
        />
      )}
    />
  );
}

class AudioPlayer {
  constructor(filePath) {
    this.audio = new Audio(filePath);
    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0; // Reset to start
      this.isPlaying = false;
    } else {
      this.audio
        .play()
        .catch((error) => console.error("Error playing audio:", error));
      this.isPlaying = true;
    }
  }
}

const SoundButton = ({ soundFile }) => {
  const sound = new Howl({
    src: [`${API_URL}/canciones/${soundFile}`],
    html5: true,
  });
  const [player] = useState(
    () => new AudioPlayer(`${API_URL}/canciones/${soundFile}`)
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    player.toggle();
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: isPlaying ? "#ff4444" : "#4444ff",
        color: "white",
        padding: "8px 16px",
        border: "none",
        borderRadius: "4px",
      }}
    >
      {isPlaying ? "■ Stop" : "▶ Play"}
    </button>
  );
};

function App() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetchSongs().then((data) => setSongs(data));
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
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {songs.map((song) => {
            if (song.name.endsWith(".mp3") || song.name.endsWith(".wav")) {
              return (
                <Card key={song.id} sx={{ height: "200px", width: "200px" }}>
                  <CardContent>
                    <Typography variant="h5">{song.name}</Typography>
                    <SoundButton soundFile={song.name} />
                  </CardContent>
                </Card>
              );
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
