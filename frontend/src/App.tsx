import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MesConges from './pages/MesConges';
import ValidationConges from './pages/ValidationConges';
import Profil from './pages/Profil';
import Calendrier from './pages/Calendrier';
import GestionUtilisateurs from './pages/GestionUtilisateurs';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
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
  );
};

export default App;
