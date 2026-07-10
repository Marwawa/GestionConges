import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { congeService } from '../services/congeService';
import { useTranslation } from 'react-i18next';
import { generateAllDocuments } from '../utils/generateWord';

interface Conge {
  id: number;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif: string;
  statut: string;
  dateDemande: string;
  commentaire?: string;
  utilisateur?: {
    nom: string;
    prenom: string;
    nomAr?: string;
    prenomAr?: string;
    service: string;
  };
}

const ValidationConges: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [conges, setConges] = useState<Conge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState<Conge | null>(null);
  const [action, setAction] = useState<'Approuvé' | 'Rejeté' | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [propositionMode, setPropositionMode] = useState(false);
  const [dateDebutProposee, setDateDebutProposee] = useState('');
  const [dateFinProposee, setDateFinProposee] = useState('');
  const [saving, setSaving] = useState(false);
  const locale = i18n.language === 'ar' ? 'ar-MA' : 'fr-FR';
  const [congeApprouve, setCongeApprouve] = useState<Conge | null>(null);
  const chargerConges = async () => {
    try {
      setLoading(true);
      const res = await congeService.getTousLesConges();
      setConges(res.data);
    } catch {
      setError(t('erreurChargement'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { chargerConges(); }, [i18n.language]);

  const handleAction = (conge: Conge, act: 'Approuvé' | 'Rejeté') => {
    setSelected(conge);
    setAction(act);
    setCommentaire('');
    setPropositionMode(false);
    setDateDebutProposee(conge.dateDebut.slice(0, 10));
    setDateFinProposee(conge.dateFin.slice(0, 10));
  };

  const fermerDialog = () => {
    setSelected(null);
    setAction(null);
    setPropositionMode(false);
  };

  const buildCongeDocumentData = (conge: Conge) => ({
    nom: conge.utilisateur?.nom || '',
    prenom: conge.utilisateur?.prenom || '',
    nomAr: conge.utilisateur?.nomAr || '',
    prenomAr: conge.utilisateur?.prenomAr || '',
    service: conge.utilisateur?.service || '',
    role: 'Fonctionnaire',
    typeConge: conge.typeConge,
    dateDebut: conge.dateDebut,
    dateFin: conge.dateFin,
    nombreJours: conge.nombreJours,
  });

  const handleConfirmer = async () => {
    if (!selected || !action) return;
    try {
      setSaving(true);
      await congeService.updateStatut(selected.id, action, commentaire);
      if (action === 'Approuvé') {
        setCongeApprouve(selected);
      }
      fermerDialog();
      chargerConges();
    } catch {
      setError(t('erreurMiseAJour'));
    } finally {
      setSaving(false);
    }
  };

  const handleProposerDates = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      await congeService.proposerDates(selected.id, {
        dateDebutProposee,
        dateFinProposee,
        commentaire,
      });
      setSuccess(t('propositionEnvoyee'));
      if (action === 'Approuvé') setCongeApprouve(selected);
fermerDialog();
chargerConges();
    } catch {
      setError(t('erreurMiseAJour'));
    } finally {
      setSaving(false);
    }
  };
  const handleDownloadAll = async () => {
  if (!congeApprouve) return;
  await generateAllDocuments(buildCongeDocumentData(congeApprouve));
};
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('validationTitle')}</Typography>
        <Typography variant="body2" color="text.secondary">{t('demandesEnAttente')}</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {congeApprouve && (
  <Paper sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: '#f0fdf4', border: '1px solid #10b981' }}>
    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: '#10b981' }}>
      ✅ {t('congeApprouve')} — {congeApprouve.utilisateur?.prenom} {congeApprouve.utilisateur?.nom}
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Button size="small" variant="contained" color="primary" startIcon={<ArticleIcon />} onClick={handleDownloadAll}>
        📄 تحميل جميع الوثائق
      </Button>
      <Button size="small" color="inherit" onClick={() => setCongeApprouve(null)}>
        {t('fermer')}
      </Button>
    </Box>
  </Paper>
)}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : conges.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 8, color: 'text.secondary', borderRadius: 3 }}>
          <Typography sx={{ fontSize: 48 }}>✓</Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>{t('aucuneDemandeEnAttente')}</Typography>
          <Typography variant="body2">{t('toutesTraitees')}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 14px 40px rgba(15, 23, 42, 0.08)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell><strong>{t('employe')}</strong></TableCell>
                <TableCell><strong>{t('service')}</strong></TableCell>
                <TableCell><strong>{t('type')}</strong></TableCell>
                <TableCell><strong>{t('debut')}</strong></TableCell>
                <TableCell><strong>{t('fin')}</strong></TableCell>
                <TableCell><strong>{t('duree')}</strong></TableCell>
                <TableCell><strong>{t('motif')}</strong></TableCell>
                <TableCell><strong>{t('demandeLe')}</strong></TableCell>
                <TableCell><strong>{t('actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conges.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.utilisateur ? `${c.utilisateur.prenom} ${c.utilisateur.nom}` : '-'}</TableCell>
                  <TableCell>{c.utilisateur?.service || '-'}</TableCell>
                  <TableCell><Chip label={t(c.typeConge)} size="small" variant="outlined" /></TableCell>
                  <TableCell>{new Date(c.dateDebut).toLocaleDateString(locale)}</TableCell>
                  <TableCell>{new Date(c.dateFin).toLocaleDateString(locale)}</TableCell>
                  <TableCell>{c.nombreJours} {t('jour')}</TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.motif || '-'}
                  </TableCell>
                  <TableCell>{new Date(c.dateDemande).toLocaleDateString(locale)}</TableCell>
                  <TableCell>
                   <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
  {c.statut === 'En attente' && (
    <>
      <Button size="small" variant="contained" color="success" onClick={() => handleAction(c, 'Approuvé')}>
        {t('approuver')}
      </Button>
      <Button size="small" variant="outlined" color="error" onClick={() => handleAction(c, 'Rejeté')}>
        {t('rejeter')}
      </Button>
    </>
  )}
  {c.statut === 'Approuvé' && (
  <Button size="small" variant="outlined" color="info" onClick={() => setCongeApprouve(c)}>
    📄 {t('documents')}
  </Button>
)}
</Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!selected} onClose={fermerDialog} maxWidth="sm" fullWidth dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogTitle>{action === 'Approuvé' ? t('approuverDemande') : t('rejeterDemande')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {selected?.utilisateur?.prenom} {selected?.utilisateur?.nom} - {selected && t(selected.typeConge)} -{' '}
            {selected && new Date(selected.dateDebut).toLocaleDateString(locale)} {t('au')}{' '}
            {selected && new Date(selected.dateFin).toLocaleDateString(locale)}
          </Typography>

          {propositionMode && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label={t('dateDebut')}
                type="date"
                value={dateDebutProposee}
                onChange={(e) => setDateDebutProposee(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                label={t('dateFin')}
                type="date"
                value={dateFinProposee}
                onChange={(e) => setDateFinProposee(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
            </Box>
          )}

          <TextField label={t('commentaire')} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} multiline rows={3} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={fermerDialog} color="inherit">{t('annuler')}</Button>
          {action === 'Rejeté' && !propositionMode && (
            <Button onClick={() => setPropositionMode(true)} variant="outlined">
              {t('demandeChangement')}
            </Button>
          )}
          {propositionMode ? (
            <Button onClick={handleProposerDates} variant="contained" disabled={saving || !dateDebutProposee || !dateFinProposee}>
              {saving ? <CircularProgress size={16} /> : t('proposerAutresDates')}
            </Button>
          ) : (
            <Button onClick={handleConfirmer} variant="contained" color={action === 'Approuvé' ? 'success' : 'error'} disabled={saving}>
              {saving ? <CircularProgress size={16} /> : `${t('confirmer')} ${action === 'Approuvé' ? t('statutApprouve') : t('statutRejete')}`}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ValidationConges;
