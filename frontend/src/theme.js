// src/theme.js
import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6A00F4", // Your purple accent
    },
    secondary: {
      main: "#BB86FC", // Soft purple
    },
    background: {
      default: "#0d0d16", // Dark background
      paper: "#121212",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default darkTheme;


