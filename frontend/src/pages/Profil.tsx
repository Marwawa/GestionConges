import React, { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Alert, CircularProgress, Avatar, Divider, Grid
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useTranslation } from 'react-i18next';

const Profil: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    ancien: '',
    nouveau: '',
    confirmer: '',
  });
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');
  const [successPwd, setSuccessPwd] = useState('');
  const [errorInfo, setErrorInfo] = useState('');
  const [errorPwd, setErrorPwd] = useState('');

  const handleChangeInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangePwd = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSaveInfo = async () => {
    try {
      setLoadingInfo(true);
      setErrorInfo('');
      setSuccessInfo('');
      await api.put(`/Utilisateurs/${user!.id}`, {
        ...user,
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
      });
      setSuccessInfo(t('infosMajSucces'));
    } catch {
      setErrorInfo(t('erreurMiseAJour'));
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleSavePwd = async () => {
    if (!passwords.ancien || !passwords.nouveau || !passwords.confirmer) {
      setErrorPwd(t('champsObligatoires'));
      return;
    }
    if (passwords.nouveau !== passwords.confirmer) {
      setErrorPwd(t('motDePasseNonCorrespondant'));
      return;
    }
    if (passwords.nouveau.length < 6) {
      setErrorPwd(t('motDePasseTropCourt'));
      return;
    }
    try {
      setLoadingPwd(true);
      setErrorPwd('');
      setSuccessPwd('');
      await api.put(`/Utilisateurs/${user!.id}/password`, {
        ancienMotDePasse: passwords.ancien,
        nouveauMotDePasse: passwords.nouveau,
      });
      setSuccessPwd(t('mdpMajSucces'));
      setPasswords({ ancien: '', nouveau: '', confirmer: '' });
    } catch (err: any) {
      setErrorPwd(err.response?.data?.message || t('erreurChangement'));
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>{t('monProfil')}</Typography>

      <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 3, boxShadow: '0 14px 40px rgba(15, 23, 42, 0.08)' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h6">{user?.prenom} {user?.nom}</Typography>
          <Typography color="text.secondary">{user?.email}</Typography>
          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
            {user?.role} - {user?.service}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('informationsPersonnelles')}</Typography>
            <Divider sx={{ mb: 2 }} />

            {successInfo && <Alert severity="success" sx={{ mb: 2 }}>{successInfo}</Alert>}
            {errorInfo && <Alert severity="error" sx={{ mb: 2 }}>{errorInfo}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label={t('prenom')} name="prenom" value={form.prenom} onChange={handleChangeInfo} fullWidth />
              <TextField label={t('nom')} name="nom" value={form.nom} onChange={handleChangeInfo} fullWidth />
              <TextField label={t('email')} name="email" value={form.email} onChange={handleChangeInfo} fullWidth type="email" />
              <TextField label={t('role')} value={user?.role || ''} fullWidth disabled />
              <TextField label={t('service')} value={user?.service || ''} fullWidth disabled />
              <Button variant="contained" onClick={handleSaveInfo} disabled={loadingInfo} startIcon={loadingInfo ? <CircularProgress size={16} /> : <PersonIcon />}>
                {loadingInfo ? t('enregistrement') : t('enregistrer')}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{t('changerMotDePasse')}</Typography>
            <Divider sx={{ mb: 2 }} />

            {successPwd && <Alert severity="success" sx={{ mb: 2 }}>{successPwd}</Alert>}
            {errorPwd && <Alert severity="error" sx={{ mb: 2 }}>{errorPwd}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label={t('ancienMotDePasse')} name="ancien" value={passwords.ancien} onChange={handleChangePwd} type="password" fullWidth />
              <TextField label={t('nouveauMotDePasse')} name="nouveau" value={passwords.nouveau} onChange={handleChangePwd} type="password" fullWidth />
              <TextField label={t('confirmerMotDePasse')} name="confirmer" value={passwords.confirmer} onChange={handleChangePwd} type="password" fullWidth />
              <Button variant="contained" color="warning" onClick={handleSavePwd} disabled={loadingPwd} startIcon={loadingPwd ? <CircularProgress size={16} /> : null}>
                {loadingPwd ? t('modification') : t('changerMotDePasse')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profil;
