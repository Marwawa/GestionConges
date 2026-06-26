import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, Alert, CircularProgress,
  Chip, Typography
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../context/AuthContext';
import { congeService } from '../services/congeService';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const typesConge = ['Annuel', 'Maladie', 'Exceptionnel', 'SansSolde'];

const FormulaireConge: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    typeConge: 'Annuel',
    dateDebut: '',
    dateFin: '',
    motif: '',
    certificatMedical: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joursOuvrables, setJoursOuvrables] = useState<number | null>(null);
  const [loadingJours, setLoadingJours] = useState(false);

  // Calcul automatique des jours ouvrables
  useEffect(() => {
    const calculerJours = async () => {
      if (!form.dateDebut || !form.dateFin) {
        setJoursOuvrables(null);
        return;
      }
      if (new Date(form.dateFin) < new Date(form.dateDebut)) {
        setJoursOuvrables(null);
        return;
      }
      try {
        setLoadingJours(true);
        const res = await api.get('/Conges/jours-ouvrables', {
          params: { dateDebut: form.dateDebut, dateFin: form.dateFin }
        });
        setJoursOuvrables(res.data);
      } catch {
        setJoursOuvrables(null);
      } finally {
        setLoadingJours(false);
      }
    };
    calculerJours();
  }, [form.dateDebut, form.dateFin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, certificatMedical: file });
  };

  const handleSubmit = async () => {
    if (!form.dateDebut || !form.dateFin) {
      setError(t('datesObligatoires'));
      return;
    }
    if (new Date(form.dateFin) < new Date(form.dateDebut)) {
      setError(t('dateFinApres'));
      return;
    }
    if (joursOuvrables !== null && joursOuvrables <= 0) {
      setError('La période choisie ne contient aucun jour ouvrable.');
      return;
    }
    if (form.typeConge === 'Maladie') {
      if (!form.certificatMedical) {
        setError(t('certificatMedicalObligatoire'));
        return;
      }
      if (form.certificatMedical.type !== 'application/pdf') {
        setError(t('pdfUniquement'));
        return;
      }
    }
    try {
      setLoading(true);
      setError('');
      await congeService.creerConge({ ...form, utilisateurId: user!.id });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || t('erreurCreation'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <DialogTitle>{t('nouvelleDemandeConge')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            select
            label={t('typeConge')}
            name="typeConge"
            value={form.typeConge}
            onChange={handleChange}
            fullWidth
          >
            {typesConge.map((type) => (
              <MenuItem key={type} value={type}>{t(type)}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label={t('dateDebut')}
              type="date"
              name="dateDebut"
              value={form.dateDebut}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label={t('dateFin')}
              type="date"
              name="dateFin"
              value={form.dateFin}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>

          {/* Affichage jours ouvrables */}
          {(form.dateDebut && form.dateFin) && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              p: 1.5, borderRadius: 2,
              backgroundColor: joursOuvrables !== null ? 'rgba(25, 118, 210, 0.08)' : 'grey.100',
              border: '1px solid',
              borderColor: joursOuvrables !== null ? 'primary.light' : 'grey.300',
            }}>
              <CalendarTodayIcon color="primary" fontSize="small" />
              {loadingJours ? (
                <CircularProgress size={16} />
              ) : joursOuvrables !== null ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Jours ouvrables :
                  </Typography>
                  <Chip
                    label={`${joursOuvrables} jour(s)`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    (week-ends et jours fériés exclus)
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="error">
                  {t('dateFinApres')}
                </Typography>
              )}
            </Box>
          )}

          <TextField
            label={t('motifOptionnel')}
            name="motif"
            value={form.motif}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            placeholder={t('motifPlaceholder')}
          />

          {form.typeConge === 'Maladie' && (
            <Button variant="outlined" component="label" color={form.certificatMedical ? 'success' : 'primary'}>
              {form.certificatMedical ? `✅ ${form.certificatMedical.name}` : t('certificatMedical')}
              <input hidden type="file" accept="application/pdf" onChange={handleFileChange} />
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">{t('annuler')}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingJours || joursOuvrables === 0}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? t('envoi') : t('envoyerDemande')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormulaireConge;
