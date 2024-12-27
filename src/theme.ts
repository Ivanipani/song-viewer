import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#000000", // black
    },
    background: {
      default: "#4b4c4d", // dark grey for main background
      paper: "#2c2c2e", // slightly lighter grey for components
    },
    text: {
      primary: "#FFFFFF", // white text
      secondary: "#B0B0B0", // grey text
    },
  },
});
