import { CssBaseline, Box, ThemeProvider } from "@mui/material";
import { darkTheme } from "./theme";
import { Player } from "./Player";
import { useEffect } from "react";

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
      <Box
        sx={{
          // minHeight: "calc(var(--vh, 1vh) * 100 - var(--marginBlock, 0px))",
          minHeight: "100dvh",
          maxHeight: "100dvh",
        }}
      >
        <CssBaseline />
        <Player />
      </Box>
    </ThemeProvider>
  );
}

export default App;
