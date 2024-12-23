import { CssBaseline, Box, ThemeProvider } from "@mui/material";
import { darkTheme } from "./theme";
import { Player } from "./Player";

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: "100dvh",
        }}
      >
        <CssBaseline />
        <Player />
      </Box>
    </ThemeProvider>
  );
}

export default App;
