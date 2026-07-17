// src/theme.js
// RELAY design system — warm dark-first, one amber accent, light-mode toggle.
// All values come from the Relay design tokens. Never hardcode other hex values.
import { createTheme } from "@mui/material/styles";

const ACCENT = "#F5A653";
const ACCENT_DEEP = "#E8734A";

// Dark mode palette
const dark = {
  bgPage: "#120E0A",
  bgCard: "#1E1812",
  bgCardHover: "#231D15",
  bgInput: "#17120D",
  borderDef: "#2E2820",
  borderHover: "#3E3428",
  textPrim: "#F0E8DC",
  textSec: "#9A8E80",
  textMuted: "#6A5E52",
};

// Light mode palette
const light = {
  bgPage: "#c7bcae",
  bgCard: "#FFFFFF",
  bgCardHover: "#FAF5EE",
  bgInput: "#F5EFE8",
  borderDef: "#E8DDD0",
  borderHover: "#D4C8BA",
  textPrim: "#1A0E00",
  textSec: "#5A4E44",
  textMuted: "#9A8E80",
};

export const getTheme = (mode = "dark") => {
  const p = mode === "dark" ? dark : light;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: ACCENT,
        contrastText: "#1A0E00",
        // bgPill token — liked-state chip/button backgrounds
        light: mode === "dark" ? "#2A2010" : "#F7E8D2",
        dark: ACCENT_DEEP,
      },
      background: {
        default: p.bgPage,
        paper: p.bgCard,
      },
      text: {
        primary: p.textPrim,
        secondary: p.textSec,
        disabled: p.textMuted,
      },
      divider: p.borderDef,
    },

    typography: {
      fontFamily: "'Inter', sans-serif",
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 500, // never 700 in UI
      h1: { fontSize: "22px", fontWeight: 500 },
      h2: { fontSize: "17px", fontWeight: 500 },
      h3: { fontSize: "15px", fontWeight: 500, lineHeight: 1.4 },
      body1: { fontSize: "14px", lineHeight: 1.65, color: p.textSec },
      body2: { fontSize: "13px", color: p.textMuted },
      caption: { fontSize: "12px", color: p.textMuted },
    },

    shape: { borderRadius: 10 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: p.bgPage,
            fontFamily: "'Inter', sans-serif",
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: p.bgCard,
            backgroundImage: "none",
            border: `0.5px solid ${p.borderDef}`,
            borderRadius: "14px",
            boxShadow: "none",
            transition: "border-color 0.15s ease",
            "&:hover": {
              borderColor: p.borderHover,
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "14px",
            borderRadius: "10px",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          containedPrimary: {
            backgroundColor: ACCENT,
            color: "#1A0E00",
            "&:hover": { backgroundColor: ACCENT_DEEP },
          },
          outlined: {
            borderColor: p.borderDef,
            color: p.textPrim,
            "&:hover": {
              borderColor: p.borderHover,
              backgroundColor: p.bgCardHover,
            },
          },
          text: {
            color: p.textMuted,
            "&:hover": {
              backgroundColor: p.bgCardHover,
              color: p.textSec,
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            color: p.textMuted,
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: p.bgCardHover,
              color: p.textSec,
            },
          },
        },
      },

      MuiInputBase: {
        styleOverrides: {
          root: {
            backgroundColor: p.bgInput,
            borderRadius: "10px",
            fontSize: "14px",
            color: p.textPrim,
          },
          input: {
            "&::placeholder": { color: p.textMuted, opacity: 1 },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: p.borderDef,
            borderWidth: "0.5px",
          },
          root: {
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: p.borderHover,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: ACCENT,
              borderWidth: "1px",
            },
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "#1A1410" : "#FDF9F4",
            backgroundImage: "none",
            borderBottom: `0.5px solid ${p.borderDef}`,
            boxShadow: "none",
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 500,
            height: "24px",
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: { borderColor: p.borderDef },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: p.bgCard,
            backgroundImage: "none",
            border: `0.5px solid ${p.borderHover}`,
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: "14px",
            color: p.textSec,
            borderRadius: "8px",
            margin: "2px 4px",
            "&:hover": { backgroundColor: p.bgCardHover, color: p.textPrim },
          },
        },
      },
    },
  });
};

// Default export for simple import
export default getTheme("dark");
