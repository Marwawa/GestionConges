import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Alert } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { useAuth } from '../context/AuthContext';
import { congeService } from '../services/congeService';
import { useTranslation } from 'react-i18next';

interface Conge {
  id: number;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  motif: string;
  utilisateur?: {
    nom: string;
    prenom: string;
  };
}

interface JourFerie {
  date: string;
  fr: string;
  ar: string;
}

const joursFeriesMaroc2026: JourFerie[] = [
  { date: '2026-01-01', fr: "Jour de l'an", ar: 'رأس السنة الميلادية' },
  { date: '2026-01-11', fr: "Manifeste de l'indépendance", ar: 'ذكرى تقديم وثيقة الاستقلال' },
  { date: '2026-01-14', fr: 'Nouvel an amazigh', ar: 'رأس السنة الأمازيغية' },
  { date: '2026-03-20', fr: 'Aïd Al-Fitr', ar: 'عيد الفطر' },
  { date: '2026-05-01', fr: 'Fête du travail', ar: 'عيد الشغل' },
  { date: '2026-05-27', fr: 'Aïd Al-Adha', ar: 'عيد الأضحى' },
  { date: '2026-06-17', fr: 'Nouvel an hégirien', ar: 'فاتح محرم' },
  { date: '2026-07-30', fr: 'Fête du Trône', ar: 'عيد العرش' },
  { date: '2026-08-14', fr: 'Journée Oued Ed-Dahab', ar: 'ذكرى وادي الذهب' },
  { date: '2026-08-20', fr: 'Révolution du Roi et du Peuple', ar: 'ثورة الملك والشعب' },
  { date: '2026-08-21', fr: 'Fête de la Jeunesse', ar: 'عيد الشباب' },
  { date: '2026-08-25', fr: 'Aïd Al-Mawlid', ar: 'عيد المولد النبوي' },
  { date: '2026-10-31', fr: "Fête de l'Unité", ar: 'عيد الوحدة' },
  { date: '2026-11-06', fr: 'Marche Verte', ar: 'ذكرى المسيرة الخضراء' },
  { date: '2026-11-18', fr: "Fête de l'Indépendance", ar: 'عيد الاستقلال' },
];

const statutColors: Record<string, string> = {
  'En attente': '#f59e0b',
  'Approuvé': '#10b981',
  'Rejeté': '#ef4444',
  'Annulé': '#6b7280',
};

const Calendrier: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Conge | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<JourFerie | null>(null);
  const locale = i18n.language === 'ar' ? 'ar-MA' : 'fr-FR';

  useEffect(() => {
    chargerConges();
  }, [i18n.language]);

  const chargerConges = async () => {
    try {
      setLoading(true);
      let res;
      if (user?.role === 'Admin' || user?.role === 'PrésidenteGreffe') {
        res = await congeService.getTousLesConges();
      } else {
        res = await congeService.getMesConges(user!.id);
      }

      const congeEvents = res.data.map((c: Conge) => ({
        id: `conge-${c.id}`,
        title: user?.role === 'Admin' || user?.role === 'PrésidenteGreffe'
          ? `${c.utilisateur?.prenom} ${c.utilisateur?.nom} - ${t(c.typeConge, { defaultValue: c.typeConge })}`
          : t(c.typeConge, { defaultValue: c.typeConge }),
        start: c.dateDebut,
        end: c.dateFin,
        backgroundColor: statutColors[c.statut] || '#6b7280',
        borderColor: statutColors[c.statut] || '#6b7280',
        extendedProps: { conge: c, kind: 'conge' },
      }));

      const holidayEvents = joursFeriesMaroc2026.map((j) => ({
        id: `ferie-${j.date}`,
        title: i18n.language === 'ar' ? j.ar : j.fr,
        start: j.date,
        allDay: true,
        backgroundColor: '#c1272d',
        borderColor: '#c1272d',
        textColor: '#ffffff',
        extendedProps: { holiday: j, kind: 'holiday' },
      }));

      setEvents([...holidayEvents, ...congeEvents]);
    } catch {
      setError('Erreur lors du chargement du calendrier.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    if (info.event.extendedProps.kind === 'holiday') {
      setSelected(null);
      setSelectedHoliday(info.event.extendedProps.holiday);
      return;
    }
    setSelectedHoliday(null);
    setSelected(info.event.extendedProps.conge);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {t('calendrierTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('vueMensuelle')}
        </Typography>
      </Paper>

      {/* Légende */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label={t('jourFerie')}
          size="small"
          sx={{ backgroundColor: '#c1272d', color: 'white', fontWeight: 'bold' }}
        />
        {[
  { key: 'statutAnnule', color: '#6b7280' },
  { key: 'statutRejete', color: '#ef4444' },
  { key: 'statutApprouve', color: '#10b981' },
  { key: 'statutEnAttente', color: '#f59e0b' },
].map(({ key, color }) => (
  <Chip
    key={key}
    label={t(key)}
    size="small"
    sx={{ backgroundColor: color, color: 'white', fontWeight: 'bold' }}
  />
))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, multiMonthPlugin]}
            initialView="dayGridMonth"
            locale={i18n.language}
            direction={i18n.language === 'ar' ? 'rtl' : 'ltr'}
            events={events}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek,multiMonthYear',
            }}
            buttonText={{
  today: t('aujourdhui'),
  month: t('mois'),
  week: t('semaine'),
  year: t('annee'),
}}
            multiMonthMaxColumns={3}
            height="auto"
          />
        </Paper>
      )}

      {/* Détail jour férié */}
      {selectedHoliday && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3, border: '1px solid rgba(193, 39, 45, 0.2)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {i18n.language === 'ar' ? selectedHoliday.ar : selectedHoliday.fr}
            </Typography>
            <Chip label="Jour férié" sx={{ backgroundColor: '#c1272d', color: 'white', fontWeight: 'bold' }} />
          </Box>
          <Typography sx={{ mt: 1 }} color="text.secondary">
            {new Date(selectedHoliday.date).toLocaleDateString(locale)}
          </Typography>
        </Paper>
      )}

      {/* Détail congé */}
      {selected && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{t('detailConge')}</Typography>
            <Chip
              label={selected.statut}
              sx={{ backgroundColor: statutColors[selected.statut], color: 'white', fontWeight: 'bold' }}
            />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selected.utilisateur && (
              <Typography>
                <strong>{t('employe')} :</strong> {selected.utilisateur.prenom} {selected.utilisateur.nom}
              </Typography>
            )}
            <Typography><strong>{t('type')} :</strong> {selected.typeConge}</Typography>
            <Typography><strong>{t('du')} :</strong> {new Date(selected.dateDebut).toLocaleDateString(locale)}</Typography>
            <Typography><strong>{t('au')} :</strong> {new Date(selected.dateFin).toLocaleDateString(locale)}</Typography>
            {selected.motif && (
              <Typography><strong>{t('motif')} :</strong> {selected.motif}</Typography>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Calendrier;