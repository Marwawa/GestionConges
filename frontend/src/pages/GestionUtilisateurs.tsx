import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem,
  Switch, FormControlLabel, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  serviceAr?: string;
  role: string;
  service: string;
  nomAr?: string;
  prenomAr?: string;
  dateCreation: string;
  estActif: boolean;
}

const roles = ['Admin', 'PrésidenteGreffe', 'Fonctionnaire'];
const services = ['Informatique', 'Comptabilité', 'RH', 'Direction', 'Technique', 'Commercial'];

const emptyForm: Utilisateur = {
  id: 0,
  nom: '',
  prenom: '',
  email: '',
  motDePasse: '',
  role: 'Fonctionnaire',
  service: 'Informatique',
  dateCreation: new Date().toISOString(),
  estActif: true,
};

const GestionUtilisateurs: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Utilisateur | null>(null);
  const [form, setForm] = useState<Utilisateur>(emptyForm);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = form.id !== 0;
  const locale = i18n.language === 'ar' ? 'ar-MA' : 'fr-FR';

  useEffect(() => {
    chargerUtilisateurs();
  }, [i18n.language]);

  useEffect(() => {
    const resetUserId = (location.state as { resetUserId?: number } | null)?.resetUserId;
    if (!resetUserId || utilisateurs.length === 0) return;
    const utilisateur = utilisateurs.find((u) => u.id === resetUserId);
    if (utilisateur) {
      handleOuvrir(utilisateur);
    }
  }, [location.state, utilisateurs]);

  const chargerUtilisateurs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Utilisateurs');
      setUtilisateurs(res.data);
    } catch {
      setError(t('erreurChargement'));
    } finally {
      setLoading(false);
    }
  };

  const handleOuvrir = (u?: Utilisateur) => {
    setForm(u ? { ...u } : emptyForm);
    setNouveauMotDePasse('');
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.role || !form.service) {
      setError(t('champsObligatoires'));
      return;
    }
    if (!isEdit && !form.motDePasse) {
      setError(t('motDePasseObligatoire'));
      return;
    }
    try {
      setSaving(true);
      setError('');
      if (isEdit) {
        await api.put(`/Utilisateurs/${form.id}`, form);
        if (nouveauMotDePasse.trim()) {
  await api.put(`/Utilisateurs/${form.id}/password`, {
    nouveauMotDePasse: nouveauMotDePasse.trim(),
  });
}
        setSuccess(t('utilisateurModifie'));
      } else {
        await api.post('/Utilisateurs', form);
        setSuccess(t('utilisateurCree'));
      }
      setShowForm(false);
      chargerUtilisateurs();
    } catch (err: any) {
      setError(err.response?.data?.message || t('erreurSauvegarde'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = (u: Utilisateur) => {
    setSelected(u);
    setShowDelete(true);
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      await api.delete(`/Utilisateurs/${selected.id}`);
      setSuccess(t('utilisateurSupprime'));
      setShowDelete(false);
      chargerUtilisateurs();
    } catch {
      setError(t('erreurSuppression'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('gestionUtilisateursTitle')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {utilisateurs.length} {t('utilisateursEnregistres')}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOuvrir()}>
          {t('nouvelUtilisateur')}
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 14px 40px rgba(15, 23, 42, 0.08)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell><strong>{t('nomComplet')}</strong></TableCell>
                <TableCell><strong>{t('email')}</strong></TableCell>
                <TableCell><strong>{t('role')}</strong></TableCell>
                <TableCell><strong>{t('service')}</strong></TableCell>
                <TableCell><strong>{t('statut')}</strong></TableCell>
                <TableCell><strong>{t('dateCreation')}</strong></TableCell>
                <TableCell><strong>{t('actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {utilisateurs.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.prenom} {u.nom}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" color={u.role === 'Admin' ? 'error' : u.role === 'PrésidenteGreffe' ? 'warning' : 'default'} />
                  </TableCell>
                  <TableCell>{u.service}</TableCell>
                  <TableCell>
                    <Chip label={u.estActif ? t('actif') : t('inactif')} size="small" color={u.estActif ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>{new Date(u.dateCreation).toLocaleDateString(locale)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={t('modifier')}>
                        <IconButton size="small" color="primary" onClick={() => handleOuvrir(u)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {u.id !== user?.id && (
                        <Tooltip title={t('supprimer')}>
                          <IconButton size="small" color="error" onClick={() => handleDeleteConfirm(u)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogTitle>{isEdit ? t('modifierUtilisateur') : t('nouvelUtilisateur')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField label={t('prenom')} name="prenom" value={form.prenom} onChange={handleChange} fullWidth required />
              <TextField label={t('nom')} name="nom" value={form.nom} onChange={handleChange} fullWidth required />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
  <TextField
  label="الاسم (بالعربية)"
  name="prenomAr"
  value={form.prenomAr || ''}
  onChange={handleChange}
  fullWidth
  dir="rtl"
  slotProps={{ htmlInput: { style: { fontFamily: 'inherit', textAlign: 'right' } } }}
/>
<TextField
  label="اللقب (بالعربية)"
  name="nomAr"
  value={form.nomAr || ''}
  onChange={handleChange}
  fullWidth
  dir="rtl"
  slotProps={{ htmlInput: { style: { fontFamily: 'inherit', textAlign: 'right' } } }}
/>
</Box>
            <TextField label={t('email')} name="email" value={form.email} onChange={handleChange} fullWidth required type="email" />
            {!isEdit && (
              <TextField label={t('motDePasse')} name="motDePasse" value={form.motDePasse} onChange={handleChange} fullWidth required type="password" />
            )}
            {isEdit && (
              <TextField
                label={t('nouveauMotDePasse')}
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                fullWidth
                type="password"
              />
            )}
            <TextField select label={t('role')} name="role" value={form.role} onChange={handleChange} fullWidth required>
              {roles.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <TextField select label={t('service')} name="service" value={form.service} onChange={handleChange} fullWidth required>
              {services.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <FormControlLabel
              control={<Switch name="estActif" checked={form.estActif} onChange={handleChange} color="success" />}
              label={form.estActif ? t('utilisateurActif') : t('utilisateurInactif')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowForm(false)} color="inherit">{t('annuler')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : null}>
            {saving ? t('enregistrement') : isEdit ? t('modifier') : t('creer')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDelete} onClose={() => setShowDelete(false)} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogTitle>{t('confirmerSuppression')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('confirmationSuppressionMsg')} <strong>{selected?.prenom} {selected?.nom}</strong> ? {t('actionIrreversible')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDelete(false)} color="inherit">{t('annuler')}</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={saving}>
            {saving ? <CircularProgress size={16} /> : t('supprimer')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionUtilisateurs;
