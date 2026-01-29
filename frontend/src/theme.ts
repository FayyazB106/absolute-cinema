import { createTheme } from '@mui/material';

export const absoluteCinemaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    background: {
      default: '#000000',
      paper: '#0a0a0a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
    },
  },
  typography: {
    fontFamily: ['"Inter"', '"Noto Kufi Arabic"', 'sans-serif'].join(','),
    h4: {
      letterSpacing: '0.25rem',
      textTransform: 'uppercase',
      fontWeight: 900,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          color: '#ffffff',
          borderBottom: '1px solid #222',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.1rem',
        },
      },
    },
  },
});