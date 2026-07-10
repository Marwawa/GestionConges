import { createTheme } from '@mui/material/styles';

// Ce fichier crée deux "thèmes" : un pour le français (de gauche à droite)
// et un pour l'arabe (de droite à gauche). On choisira le bon selon la langue.

export const getTheme = (direction: 'ltr' | 'rtl') =>
  createTheme({
    direction, // ⬅️ C'est cette ligne qui dit à MUI d'inverser ses composants
    typography: {
      fontFamily: direction === 'rtl'
        ? '"Cairo", "Tajawal", "Roboto", "Helvetica", "Arial", sans-serif'
        : '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  });