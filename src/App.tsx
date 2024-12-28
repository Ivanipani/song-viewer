import { CssBaseline, Box, ThemeProvider } from "@mui/material";
import { darkTheme } from "./theme";
import { Player } from "./Player";
import { useEffect } from "react";
import { MediaProvider } from "./contexts/MediaContext";

function App() {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <MediaProvider>
        <Box
          sx={{
            minHeight: "100dvh",
            maxHeight: "100dvh",
          }}
        >
          <CssBaseline />
          <Player />
        </Box>
      </MediaProvider>
    </ThemeProvider>
  );
}

export default App;
