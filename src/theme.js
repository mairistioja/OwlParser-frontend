import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import PropTypes from 'prop-types';

const owlTheme = createTheme({
  components: {
  /*  MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
        },
      },
    }, */
    /* MuiPaper: {
      styleOverrides: {
        root: {
          marginBottom: 0,
        },
      },
    }, */
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: ".8rem",
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

const ThemeWrapper = ({children}) => (
  <ThemeProvider theme={owlTheme}>
    {/* <CssBaseline /> */}
    { children }
  </ThemeProvider>
);

ThemeWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};


export default ThemeWrapper;
