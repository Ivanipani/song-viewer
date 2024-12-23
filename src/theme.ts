import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#000000", // black
    },
    background: {
      default: "#524f49", // dark grey for main background
      paper: "#8c8b87", // slightly lighter grey for components
    },
    text: {
      primary: "#FFFFFF", // white text
      secondary: "#B0B0B0", // grey text
    },
  },
});
