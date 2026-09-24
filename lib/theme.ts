"use client";

import { createTheme } from "@mui/material/styles";

/**
 * Application theme. Components are styled here (palette, shape, component
 * defaults), never one by one at the call site.
 */
export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: "#1b7f4c", contrastText: "#ffffff" },
    secondary: { main: "#e8772e", contrastText: "#ffffff" },
    background: { default: "#f6f8f5", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiTextField: { defaultProps: { fullWidth: true } },
  },
});
