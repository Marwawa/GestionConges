import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Grid, Paper, Typography, Box, Card, CardContent,
  Button, Chip, LinearProgress, Divider
} from '@mui/material';
import {
  EventNote as EventIcon, CheckCircle as ApprovedIcon,
  Pending as PendingIcon, Cancel as RejectedIcon,
  People as PeopleIcon, TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
  LineElement, PointElement,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { congeService } from '../services/congeService';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
  LineElement, PointElement
);

interface Conge {
  id: number; typeConge: string; dateDebut: string; dateFin: string;
  nombreJours: number; motif: string; statut: string; dateDemande: string;
  utilisateur?: { id: number; nom: string; prenom: string;nomAr?: string; prenomAr?: string; service: string; serviceAr?: string; };
}
interface SoldeConge {
  id: number; utilisateurId: number; annee: number;
  totalAnnuel: number; pris: number; restant: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [conges, setConges] = useState<Conge[]>([]);
  const [tousConges, setTousConges] = useState<Conge[]>([]);
const [tousUtilisateurs, setTousUtilisateurs] = useState<any[]>([]);
  const [soldes, setSoldes] = useState<SoldeConge[]>([]);

  const isAdminOrChef = user?.role === 'Admin' || user?.role === 'PrésidenteGreffe';
  const getStatutColor = (statut: string): 'warning' | 'success' | 'error' | 'default' => {
    switch (statut) {
      case 'En attente': return 'warning';
      case 'Approuvé': return 'success';
      case 'Rejeté': return 'error';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'En attente': return t('statutEnAttente');
      case 'Approuvé': return t('statutApprouve');
      case 'Rejeté': return t('statutRejete');
      case 'Annulé': return t('statutAnnule');
      default: return statut;
    }
  };
  const getTypeLabel = (type: string) => t(type, { defaultValue: type });

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    try {
      const [congesRes, soldesRes] = await Promise.all([
        congeService.getMesConges(user!.id),
        congeService.getSoldes(user!.id),
      ]);
      setConges(congesRes.data);
      setSoldes(soldesRes.data);
      if (isAdminOrChef) {
        const tousRes = await congeService.getTousLesConges();
setTousConges(tousRes.data);
const usersRes = await api.get('/Utilisateurs');
setTousUtilisateurs(usersRes.data.filter((u: any) => u.role === 'Fonctionnaire'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: conges.length,
    enAttente: conges.filter(c => c.statut === 'En attente').length,
    approuves: conges.filter(c => c.statut === 'Approuvé').length,
    rejetes: conges.filter(c => c.statut === 'Rejeté').length,
  };

  const statsAdmin = {
    total: tousConges.length,
    enAttente: tousConges.filter(c => c.statut === 'En attente').length,
    approuves: tousConges.filter(c => c.statut === 'Approuvé').length,
    rejetes: tousConges.filter(c => c.statut === 'Rejeté').length,
  };

  const soldeActuel = soldes.find(s => s.annee === new Date().getFullYear());
  const locale = i18n.language === 'ar' ? 'ar-MA' : 'fr-FR';

  const donutData = {
    labels: [t('enAttente'), t('approuves'), t('rejetes'), t('statutAnnule')],
    datasets: [{
      data: [
        (isAdminOrChef ? tousConges : conges).filter(c => c.statut === 'En attente').length,
        (isAdminOrChef ? tousConges : conges).filter(c => c.statut === 'Approuvé').length,
        (isAdminOrChef ? tousConges : conges).filter(c => c.statut === 'Rejeté').length,
        (isAdminOrChef ? tousConges : conges).filter(c => c.statut === 'Annulé').length,
      ],
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: ['Annuel', 'Maladie', 'Exceptionnel', 'SansSolde'].map(type => t(type, { defaultValue: type })),
    datasets: [{
      label: t('totalConges'),
      data: ['Annuel', 'Maladie', 'Exceptionnel', 'SansSolde'].map(type =>
        (isAdminOrChef ? tousConges : conges).filter(c => c.typeConge === type).length
      ),
      backgroundColor: ['#1976d2', '#10b981', '#f59e0b', '#6b7280'],
      borderRadius: 6,
    }],
  };

  const mois = Array.from({ length: 12 }, (_, i) =>
    new Date(2026, i, 1).toLocaleString(locale, { month: 'short' })
  );
  const congesParMois = mois.map((_, i) =>
    (isAdminOrChef ? tousConges : conges).filter(c =>
      new Date(c.dateDemande).getMonth() === i
    ).length
  );

  const lineData = {
    labels: mois,
    datasets: [{
      label: t('totalConges'),
      data: congesParMois,
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1976d2',
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
  };
  

const anneeActuelle = new Date().getFullYear();
const utilisateursAvecConges = new Set(
  tousConges
    .filter(c => new Date(c.dateDemande).getFullYear() === anneeActuelle)
    .map(c => c.utilisateur?.id ?? 0)
);
const employesSansConges = tousUtilisateurs.filter(u => !utilisateursAvecConges.has(u.id));
const chevauchements: { service: string; date: string; employes: string[] }[] = [];
const congesApprouves = tousConges.filter(c => c.statut === 'Approuvé');

congesApprouves.forEach(c1 => {
  congesApprouves.forEach(c2 => {
    if (
      c1.id !== c2.id &&
      c1.utilisateur?.service === c2.utilisateur?.service &&
      new Date(c1.dateDebut) <= new Date(c2.dateFin) &&
      new Date(c1.dateFin) >= new Date(c2.dateDebut)
    ) {
      const key = `${c1.utilisateur?.service}-${c1.dateDebut}`;
      const exists = chevauchements.find(ch => ch.service === c1.utilisateur?.service &&
        ch.employes.includes(`${c1.utilisateur?.prenom} ${c1.utilisateur?.nom}`) &&
        ch.employes.includes(`${c2.utilisateur?.prenom} ${c2.utilisateur?.nom}`)
      );
      if (!exists) {
        chevauchements.push({
          service: c1.utilisateur?.service || '',
          date: `${new Date(c1.dateDebut).toLocaleDateString(locale)} - ${new Date(c1.dateFin).toLocaleDateString(locale)}`,
          employes: [
            `${c1.utilisateur?.prenom} ${c1.utilisateur?.nom}`,
            `${c2.utilisateur?.prenom} ${c2.utilisateur?.nom}`
          ]
        });
      }
    }
  });
});
const services = Array.from(new Set(tousConges.map(c => c.utilisateur?.service).filter(Boolean))) as string[];
const parService = services.map(service => ({
  service,
  serviceAr: tousConges.find(c => c.utilisateur?.service === service)?.utilisateur?.serviceAr || service,
  count: tousConges.filter(c => c.utilisateur?.service === service).length,
}));

const barServiceData = {
  labels: parService.map(s => isArabic ? s.serviceAr : s.service),
    datasets: [{
      label: t('totalConges'),
      data: parService.map(s => s.count),
      backgroundColor: ['#1976d2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderRadius: 6,
    }],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  const parType = ['Annuel', 'Maladie', 'Exceptionnel', 'SansSolde'].map(type => ({
    type,
    count: (isAdminOrChef ? tousConges : conges).filter(c => c.typeConge === type).length,
  }));
  const maxParType = Math.max(...parType.map(t => t.count), 1);

  return (
    <Box>
      <Paper sx={{
        p: 3, mb: 3, borderRadius: 3, color: 'white',
        background: 'linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%)',
        boxShadow: '0 18px 50px rgba(29, 78, 216, 0.22)',
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>{t('tableauDeBord')}</Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          {t('bienvenue')} {i18n.language === 'ar' ? `${user?.prenomAr} ${user?.nomAr}` : `${user?.prenom} ${user?.nom}`} - {t(user?.role ?? '')}
        </Typography>
      </Paper>

      <Grid container spacing={3}>

        {isAdminOrChef && (
          <>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>{t('vueGlobale')}</Typography>
            </Grid>
            {[
              { label: t('totalDemandes'), value: statsAdmin.total, icon: <PeopleIcon color="primary" />, border: '#1976d2' },
              { label: t('enAttente'), value: statsAdmin.enAttente, icon: <PendingIcon color="warning" />, border: '#f59e0b', action: true },
              { label: t('approuves'), value: statsAdmin.approuves, icon: <ApprovedIcon color="success" />, border: '#10b981' },
              { label: t('rejetes'), value: statsAdmin.rejetes, icon: <RejectedIcon color="error" />, border: '#ef4444' },
            ].map(({ label, value, icon, border, action }) => (
              <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderLeft: `4px solid ${border}`, borderRadius: 2, boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography color="text.secondary">{label}</Typography>
                      {icon}
                    </Box>
                    <Typography variant="h4">{value}</Typography>
                    {action && value > 0 && (
                      <Button size="small" onClick={() => navigate('/app/validation-conges')} sx={{ mt: 1, p: 0 }}>
                        {t('traiter')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
               <Typography variant="h6" sx={{ mb: 2 }}>{t('repartitionParStatut')}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 220, position: 'relative' }}>
                  <Doughnut data={donutData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>{t('congesParService')}</Typography>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ height: 250, position: 'relative' }}>
      <Bar data={barServiceData} options={barOptions} />
    </Box>
  </Paper>
</Grid>
<Grid size={{ xs: 12 }}>
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>{t('chevauchements')}</Typography>
    <Divider sx={{ mb: 2 }} />
    {chevauchements.length === 0 ? (
      <Typography color="text.secondary">{t('aucunChevauchement')}</Typography>
    ) : (
      chevauchements.map((ch, index) => (
        <Box key={index} sx={{ p: 2, mb: 1, borderRadius: 2, backgroundColor: '#fff3cd', border: '1px solid #f59e0b' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d97706' }}>
            ⚠️ {ch.service}
          </Typography>
          <Typography variant="caption" color="text.secondary">{ch.date}</Typography>
          <Typography variant="body2">{ch.employes.join(' & ')}</Typography>
        </Box>
      ))
    )}
  </Paper>
</Grid>
<Grid size={{ xs: 12, md: 6 }}>
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>{t('congesNonUtilises')}</Typography>
    <Divider sx={{ mb: 2 }} />
    
    {employesSansConges.length === 0 ? (
      <Typography color="text.secondary">{t('tousOntPrisConges')}</Typography>
    ) : (
      employesSansConges.map((u: any) => (
        <Box key={u.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
          <Typography variant="body2">{isArabic ? `${u.prenomAr} ${u.nomAr}` : `${u.prenom} ${u.nom}`}</Typography>
          <Typography variant="body2" color="text.secondary">{u.service}</Typography>
        </Box>
      ))
    )}
  </Paper>
</Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('congesParType')}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 220, position: 'relative' }}>
                  <Bar data={barData} options={barOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('evolutionMensuelle')}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 220, position: 'relative' }}>
                  <Line data={lineData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingIcon color="primary" />
                  <Typography variant="h6">{t('repartitionParType')}</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {parType.map(({ type, count }) => (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{getTypeLabel(type)}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{count}</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(count / maxParType) * 100} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                ))}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{t('dernieresDemandes')}</Typography>
                  <Button size="small" onClick={() => navigate('/app/validation-conges')}>{t('voirTout')}</Button>
                </Box>
                <Divider sx={{ mb: 1 }} />
                {tousConges.slice(0, 5).map((c) => (
                  <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
  {isArabic ? `${c.utilisateur?.prenomAr} ${c.utilisateur?.nomAr}` : `${c.utilisateur?.prenom} ${c.utilisateur?.nom}`}
</Typography>
                      <Typography variant="caption" color="text.secondary">{getTypeLabel(c.typeConge)} - {new Date(c.dateDebut).toLocaleDateString(locale)}</Typography>
                    </Box>
                    <Chip label={getStatutLabel(c.statut)} color={getStatutColor(c.statut)} size="small" />
                  </Box>
                ))}
                {tousConges.length === 0 && <Typography color="text.secondary">{t('aucuneDemande')}</Typography>}
              </Paper>
            </Grid>
          </>
        )}

        {!isAdminOrChef && (
          <>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>{t('mesStatistiques')}</Typography>
            </Grid>
            {[
              { label: t('totalConges'), value: stats.total, icon: <EventIcon color="primary" /> },
              { label: t('enAttente'), value: stats.enAttente, icon: <PendingIcon color="warning" /> },
              { label: t('approuves'), value: stats.approuves, icon: <ApprovedIcon color="success" /> },
              { label: t('rejetes'), value: stats.rejetes, icon: <RejectedIcon color="error" /> },
            ].map(({ label, value, icon }) => (
              <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography color="text.secondary">{label}</Typography>
                      {icon}
                    </Box>
                    <Typography variant="h4">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>{t('mesCongesParStatut')}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 220, position: 'relative' }}>
                  <Doughnut data={{
                    labels: [t('enAttente'), t('approuves'), t('rejetes'), t('statutAnnule')],
                    datasets: [{
                      data: [stats.enAttente, stats.approuves, stats.rejetes,
                        conges.filter(c => c.statut === 'Annulé').length],
                      backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'],
                      borderWidth: 0,
                    }],
                  }} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>{t('soldeConges')} {new Date().getFullYear()}</Typography>
                <Divider sx={{ mb: 2 }} />
                {soldeActuel ? (
                  <>
                    <Grid container spacing={2}>
                      {[
                        { label: t('total'), value: soldeActuel.totalAnnuel },
                        { label: t('pris'), value: soldeActuel.pris },
                        { label: t('restant'), value: soldeActuel.restant },
                      ].map(({ label, value }) => (
                        <Grid key={label} size={{ xs: 4 }}>
                          <Typography variant="body2">{label}</Typography>
                          <Typography variant="h5">{value} {t('jour')}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                    <LinearProgress variant="determinate"
                      value={(soldeActuel.pris / soldeActuel.totalAnnuel) * 100}
                      sx={{ mt: 2, height: 8, borderRadius: 4 }} color="primary" />
                    <Typography variant="caption" color="text.secondary">
                      {soldeActuel.pris} {t('jour')} / {soldeActuel.totalAnnuel}
                    </Typography>
                  </>
                ) : (
                  <Typography color="text.secondary">{t('aucuneDemande')}</Typography>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{t('dernieresDemandes')}</Typography>
                  <Button size="small" onClick={() => navigate('/app/mes-conges')}>{t('voirTout')}</Button>
                </Box>
                <Divider sx={{ mb: 1 }} />
                {conges.slice(0, 5).map((c) => (
                  <Box key={c.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
                    <Box>
                      <Typography variant="body2">{getTypeLabel(c.typeConge)}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(c.dateDebut).toLocaleDateString(locale)}</Typography>
                    </Box>
                    <Chip label={getStatutLabel(c.statut)} color={getStatutColor(c.statut)} size="small" />
                  </Box>
                ))}
                {conges.length === 0 && <Typography color="text.secondary">{t('aucuneDemande')}</Typography>}
              </Paper>
            </Grid>
          </>
        )}

      </Grid>
    </Box>
  );
};

export default Dashboard;