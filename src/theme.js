import { createTheme } from "@mui/material/styles";

export const owlTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          marginBottom: 0,
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#1D6488",
      light: "rgba(29, 100, 136, 0.12)",
    },
    warning: {
      main: "#d0312d",
    },
    secondary: {
      main: "#c8c8cd57",
    },
    action: {
      disabled: "rgba(0, 0, 0, 0.36)",
      disabledBackground: "rgba(0, 0, 0, 0.2)",
    },
  },
  typography: {
    fontFamily: "Montserrat, sans-serif",
    h1: {
      fontWeight: 600,
      fontSize: "4.5rem",
    },
  },
});
