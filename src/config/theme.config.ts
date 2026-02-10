import { createTheme } from "@mui/material/styles";
export const litTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#86BC25",
      light: "#A0D44B",
      dark: "#6B9B1E",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#53565A",
      light: "#75787B",
      dark: "#3D3F42",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#f9fafb",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
      },
    },
  },
});
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#86BC25",
      light: "#A0D44B",
      dark: "#6B9B1E",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#53565A",
      light: "#75787B",
      dark: "#3D3F42",
      contrastText: "#ffffff",
    },
    background: {
      default: "#1D1D1D",
      paper: "#2D2D2D",
    },
    text: {
      primary: "#f9fafb",
      secondary: "#d1d5db",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});
