import { createTheme } from '@mui/material/styles';

// JCred admin theme — calm, trustworthy blues with a teal accent.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f4e8c' },
    secondary: { main: '#1aa39c' },
    background: { default: '#f4f6fa' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, Roboto, system-ui, Arial, sans-serif',
    h6: { fontWeight: 700 },
  },
});

export default theme;
