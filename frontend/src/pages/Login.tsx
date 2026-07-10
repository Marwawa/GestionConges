import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Paper, TextField, Typography,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCin, setResetCin] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('erreurChargement'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    try {
      setResetLoading(true);
      setResetError('');
      await authService.forgotPassword({ email, cinOuMatricule: resetCin, telephone: resetPhone });
      setResetSent(true);
      setResetCin('');
      setResetPhone('');
    } catch (err: any) {
      setResetError(err.response?.data?.message || t('erreurChargement'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 8px 40px rgba(15, 23, 42, 0.12)',
          }}
        >
          {/* ── En-tête avec logo + sélecteur de langue ── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pb: 2,
              mb: 2,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            {/* Logo */}
            <Box
              component="img"
              src="/logo.png"
              alt="Royaume du Maroc"
              sx={{ height: 56, objectFit: 'contain' }}
            />

            {/* Sélecteur de langue */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                variant={i18n.language === 'fr' ? 'contained' : 'outlined'}
                onClick={() => i18n.changeLanguage('fr')}
                sx={{ minWidth: 44, fontSize: 12, fontWeight: 700 }}
              >
                FR
              </Button>
              <Button
                size="small"
                variant={i18n.language === 'ar' ? 'contained' : 'outlined'}
                onClick={() => i18n.changeLanguage('ar')}
                sx={{ minWidth: 44, fontSize: 12, fontWeight: 700 }}
              >
                عربي
              </Button>
            </Box>
          </Box>

          {/* ── Titre ── */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
              {t('gestionDesConges')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('connectezVous')}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('motDePasse')}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.4, borderRadius: 2, fontWeight: 600, fontSize: 15 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('seConnecter')}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant="text"
            startIcon={<LockResetIcon />}
            onClick={() => { setResetOpen(true); setResetSent(false); }}
            sx={{ color: 'text.secondary', fontSize: 13 }}
          >
            {t('motDePasseOublie')}
          </Button>
        </Paper>
      </Container>

      {/* ── Dialog mot de passe oublié ── */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('recuperationMotDePasse')}</DialogTitle>
        <DialogContent>
          {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}
          {resetSent ? (
            <Alert severity="success" sx={{ mt: 1 }}>{t('demandeRecuperationEnvoyee')}</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">{t('recuperationIntro')}</Typography>
              <TextField label={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <TextField label={t('cinOuMatricule')} value={resetCin} onChange={(e) => setResetCin(e.target.value)} fullWidth />
              <TextField label={t('telephone')} value={resetPhone} onChange={(e) => setResetPhone(e.target.value)} fullWidth />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetOpen(false)} color="inherit">{t('annuler')}</Button>
          {!resetSent && (
            <Button
              onClick={handleResetSubmit}
              variant="contained"
              disabled={!email || !resetCin || !resetPhone || resetLoading}
            >
              {resetLoading ? <CircularProgress size={18} /> : t('envoyerDemandeRecuperation')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;