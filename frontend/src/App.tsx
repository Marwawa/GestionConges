import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import i18n from './i18n';
import { getTheme } from './theme';
import { createEmotionCacheLtr, createEmotionCacheRtl } from './createEmotionCache';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MesConges from './pages/MesConges';
import ValidationConges from './pages/ValidationConges';
import Profil from './pages/Profil';
import Calendrier from './pages/Calendrier';
import GestionUtilisateurs from './pages/GestionUtilisateurs';

// On prépare à l'avance les deux "moteurs de style" (un pour chaque sens)
const cacheLtr = createEmotionCacheLtr();
const cacheRtl = createEmotionCacheRtl();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  // On garde en mémoire la langue actuelle, pour savoir quel thème utiliser
  const [langue, setLangue] = useState(i18n.language);

  // À chaque fois que la langue change (bouton FR/AR cliqué quelque part),
  // ce code se déclenche automatiquement et met à jour l'affichage
  useEffect(() => {
    const onLangChange = (lng: string) => setLangue(lng);
    i18n.on('languageChanged', onLangChange);
    return () => {
      i18n.off('languageChanged', onLangChange);
    };
  }, []);

  const direction = langue === 'ar' ? 'rtl' : 'ltr';
  const theme = getTheme(direction);
  const cache = direction === 'rtl' ? cacheRtl : cacheLtr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/langue" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />

              {/* Pages protégées */}
              <Route path="/app" element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/app/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="mes-conges" element={<MesConges />} />
                <Route path="validation-conges" element={<ValidationConges />} />
                <Route path="calendrier" element={<Calendrier />} />
                <Route path="profil" element={<Profil />} />
                <Route path="gestion-utilisateurs" element={<GestionUtilisateurs />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;