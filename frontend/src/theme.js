// // src/theme.js
// import { createTheme } from "@mui/material/styles";

// const darkTheme = createTheme({
//   palette: {
//     mode: "dark",
//     primary: {
//       main: "#6A00F4", 
      
//     },
//     secondary: {
//       main: "#BB86FC", // Soft purple
//     },
//     background: {
//       default: "#0d0d16", // Dark background
//       paper: "#121212",
//     },
//     text: {
//       primary: "#ffffff",
//       secondary: "#b3b3b3",
//     },
//   },
//   typography: {
//     fontFamily: "'Poppins', sans-serif",
//   },
// });

// export default darkTheme;
// src/theme.js
import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#6A00F4",      // core brand purple
      light: "#A875FF",     // subtle accent
      dark: "#4B00B8",      // darker variation
    },

    secondary: {
      main: "#8C52FF",      // richer supporting purple
    },

    background: {
      default: "#0F0D14",   // improved deeper tone
      paper: "#181525",     // slightly lighter for cards
    },

    text: {
      primary: "#FFFFFF",
      secondary: "#B9AEE7",  // purple-gray text
    },
  },

  typography: {
    fontFamily: "'Poppins', sans-serif",
    fontWeightBold: 700,
  },

  shape: {
    borderRadius: 14, // smoother UI globally
  },
});

export default darkTheme;


