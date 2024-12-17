import { useState, useEffect } from "react";
import { CssBaseline, Container, Box } from "@mui/material";
import "./App.css";

const API_URL = "http://canciones.poochella.club";
const fetchSongs = async () => {
  const response = await fetch(`${API_URL}/canciones`);
  const data = await response.json();
  return data;
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
        {songs.map((song) => (
          <h6>{song}</h6>
        ))}
      </Container>
    </Box>
  );
}

export default App;
