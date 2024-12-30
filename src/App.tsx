import { CssBaseline, Box, ThemeProvider } from "@mui/material";
import { darkTheme } from "./theme";
import { Player } from "./Player";
import { useEffect } from "react";
import { MediaProvider } from "./contexts/MediaContext";
import { BrowserProvider, useBrowser } from "./contexts/BrowserContext";

function AppContent() {
  const { browserInfo } = useBrowser();

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
    <MediaProvider>
      <Box
        sx={{
          minHeight: browserInfo.maxScreenHeight,
          maxHeight: browserInfo.maxScreenHeight,
          overflow: "hidden", // Prevent scrolling
        }}
      >
        <CssBaseline />
        <Player />
      </Box>
    </MediaProvider>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <BrowserProvider>
        <AppContent />
      </BrowserProvider>
    </ThemeProvider>
  );
}

export default App;
