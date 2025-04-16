// theme.js
import { createTheme } from '@mui/material/styles';

// Cores personalizadas para o tema claro
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Azul padrão do Material-UI
    },
    secondary: {
      main: '#dc004e', // Rosa padrão do Material-UI
    },
    background: {
      default: '#f5f5f5', // Fundo claro
      paper: '#ffffff', // Fundo de cards e elementos
    },
  },
});

// Cores personalizadas para o tema escuro
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Azul claro para o modo escuro
    },
    secondary: {
      main: '#f48fb1', // Rosa claro para o modo escuro
    },
    background: {
      default: '#121212', // Fundo escuro
      paper: '#1e1e1e', // Fundo de cards e elementos
    },
  },
});

export { lightTheme, darkTheme };