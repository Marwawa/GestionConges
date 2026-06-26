import React, { useEffect, useState } from 'react';
import {
  Badge, Button, Chip, Divider, IconButton, List, ListItem,
  ListItemText, Popover, Typography, Box
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';
import { congeService } from '../services/congeService';
import { useTranslation } from 'react-i18next';

interface Notif {
  id: number;
  message: string;
  type: string;
  estLue: boolean;
  dateCreation: string;
  congeId?: number;
  demandeurId?: number;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const locale = i18n.language === 'ar' ? 'ar-MA' : 'fr-FR';

  const chargerNotifs = async () => {
    try {
      if (!user) return;
      const res = await notificationService.getByUtilisateur(user.id);
      setNotifs(res.data);
    } catch {
      // Notification loading should not block the app.
    }
  };

  useEffect(() => {
    chargerNotifs();
    const interval = setInterval(chargerNotifs, 30000);
    return () => clearInterval(interval);
  }, [user, i18n.language]);

  const openNotification = async (n: Notif) => {
    if (!n.estLue) {
      await notificationService.marquerLue(n.id);
      setNotifs((items) => items.map((item) => item.id === n.id ? { ...item, estLue: true } : item));
    }
  };

  const handlePasswordReset = async (n: Notif) => {
    await openNotification(n);
    setAnchorEl(null);
    navigate('/app/gestion-utilisateurs', { state: { resetUserId: n.demandeurId } });
  };

  const handleCongeProposal = async (n: Notif, accepte: boolean) => {
    if (!n.congeId) return;
    await congeService.repondreProposition(n.congeId, accepte);
    await openNotification(n);
    await chargerNotifs();
  };

  const unreadCount = notifs.filter((n) => !n.estLue).length;

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: i18n.language === 'ar' ? 'left' : 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: i18n.language === 'ar' ? 'left' : 'right' }}
      >
        <Box sx={{ width: 380 }} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <Box sx={{ px: 2, py: 1.5, backgroundColor: 'primary.main' }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
              {t('notifications')} ({unreadCount})
            </Typography>
          </Box>
          <Divider />
          {notifs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">{t('aucuneNotification')}</Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 460, overflow: 'auto', p: 0 }}>
              {notifs.map((n, index) => (
                <React.Fragment key={n.id}>
                  <ListItem sx={{ py: 1.5, alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: n.estLue ? 500 : 800, flex: 1 }}>
                            {n.message}
                          </Typography>
                          {!n.estLue && <Chip label="New" color="error" size="small" />}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(n.dateCreation).toLocaleString(locale)}
                          </Typography>
                          {n.type === 'MotDePasseOublie' && user?.role === 'Admin' && (
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              startIcon={<LockResetIcon />}
                              sx={{ mt: 1 }}
                              onClick={() => handlePasswordReset(n)}
                            >
                              {t('changerMotDePasseMaintenant')}
                            </Button>
                          )}
                          {n.type === 'PropositionDatesConge' && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                              <Button size="small" variant="contained" color="success" onClick={() => handleCongeProposal(n, true)}>
                                {t('accepterProposition')}
                              </Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => handleCongeProposal(n, false)}>
                                {t('refuserProposition')}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default Notifications;
