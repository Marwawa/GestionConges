import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useAuth } from '../context/AuthContext';
import { congeService } from '../services/congeService';
import FormulaireConge from '../components/FormulaireConge';
import { generateAttestationCongePDF, generateCongesPDF } from '../utils/generatePDF';
import { generateCongesExcel } from '../utils/generateExcel';
import { useTranslation } from 'react-i18next';

interface Conge {
  id: number;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif: string;
  statut: string;
  dateDemande: string;
  dateTraitement?: string;
  commentaire?: string;
  dateDebutProposee?: string;
  dateFinProposee?: string;
  commentaireProposition?: string;
}

const statutColors: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  'En attente': 'warning',
  'ApprouvÃ©': 'success',
  'RejetÃ©': 'error',
  'AnnulÃ©': 'default',
  'Changement demandÃ©': 'warning',
};

const MesConges: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [conges, setConges] = useState<Conge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const locale = i18n.language === 'ar' ? 'ar-MA' : 'fr-FR';

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'En attente': return t('statutEnAttente');
      case 'ApprouvÃ©': return t('statutApprouve');
      case 'RejetÃ©': return t('statutRejete');
      case 'AnnulÃ©': return t('statutAnnule');
      case 'Changement demandÃ©': return t('statutChangementDemande');
      default: return statut;
    }
  };

  const chargerConges = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await congeService.getMesConges(user.id);
      setConges(res.data);
    } catch {
      setError(t('erreurChargement'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { chargerConges(); }, [user, i18n.language]);

  const handleAnnuler = async (id: number) => {
    if (!window.confirm(t('confirmerAnnulation'))) return;
    try {
      await congeService.annulerConge(id);
      chargerConges();
    } catch {
      setError(t('erreurAnnulation'));
    }
  };

  const handleReponseProposition = async (id: number, accepte: boolean) => {
    try {
      await congeService.repondreProposition(id, accepte);
      chargerConges();
    } catch {
      setError(t('erreurMiseAJour'));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{t('mesCongesTitle')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('gererDemandes')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => generateCongesPDF(conges, user!)}
            disabled={conges.length === 0}
          >
            {t('exporterPDF')}
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<TableChartIcon />}
            onClick={() => generateCongesExcel(conges, user!)}
            disabled={conges.length === 0}
          >
            {t('exporterExcel')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
            {t('nouvelleDemande')}
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : conges.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 8, color: 'text.secondary', borderRadius: 3 }}>
          <Typography sx={{ fontSize: 48 }}>ðŸ“‹</Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>{t('aucuneDemandeDeConge')}</Typography>
          <Typography variant="body2">{t('cliquezPour')}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 14px 40px rgba(15, 23, 42, 0.08)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell><strong>{t('type')}</strong></TableCell>
                <TableCell><strong>{t('debut')}</strong></TableCell>
                <TableCell><strong>{t('fin')}</strong></TableCell>
                <TableCell><strong>{t('duree')}</strong></TableCell>
                <TableCell><strong>{t('motif')}</strong></TableCell>
                <TableCell><strong>{t('statut')}</strong></TableCell>
                <TableCell><strong>{t('datesProposees')}</strong></TableCell>
                <TableCell><strong>{t('actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conges.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{t(c.typeConge)}</TableCell>
                  <TableCell>{new Date(c.dateDebut).toLocaleDateString(locale)}</TableCell>
                  <TableCell>{new Date(c.dateFin).toLocaleDateString(locale)}</TableCell>
                  <TableCell>{c.nombreJours} {t('jour')}</TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.motif || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip label={getStatutLabel(c.statut)} color={statutColors[c.statut] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    {c.statut === 'Changement demandÃ©' && c.dateDebutProposee && c.dateFinProposee ? (
                      <Box>
                        <Typography variant="body2">
                          {new Date(c.dateDebutProposee).toLocaleDateString(locale)} - {new Date(c.dateFinProposee).toLocaleDateString(locale)}
                        </Typography>
                        {c.commentaireProposition && (
                          <Typography variant="caption" color="text.secondary">{c.commentaireProposition}</Typography>
                        )}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {/* Annuler */}
                      {c.statut === 'En attente' && (
                        <Button size="small" color="error" onClick={() => handleAnnuler(c.id)}>
                          {t('annuler')}
                        </Button>
                      )}

                      {/* Attestation PDF */}
                      {c.statut === 'ApprouvÃ©' && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<PictureAsPdfIcon />}
                          onClick={() => generateAttestationCongePDF(c, user!)}
                        >
                          Attestation
                        </Button>
                      )}


                      {/* RÃ©ponse proposition */}
                      {c.statut === 'Changement demandÃ©' && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Button size="small" variant="contained" color="success" onClick={() => handleReponseProposition(c.id, true)}>
                            {t('accepterProposition')}
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => handleReponseProposition(c.id, false)}>
                            {t('refuserProposition')}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {showForm && (
        <FormulaireConge
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); chargerConges(); }}
        />
      )}
    </Box>
  );
};

export default MesConges;
