import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, Typography, Button, Avatar, Menu, MenuItem,
  IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, EventNote as EventNoteIcon,
  CalendarToday as CalendarIcon, Person as PersonIcon,
  Logout as LogoutIcon, Menu as MenuIcon,
  CheckCircle as CheckCircleIcon, People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Notifications from '../components/Notifications';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); navigate('/login'); };
  const changeLanguage = (lang: 'fr' | 'ar') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('langue', lang);
  };

  const menuItems = [
    { text: t('dashboard'),  icon: <DashboardIcon />, path: '/app/dashboard' },
    ...(user?.role === 'ChefDeService' ? [] : [
      { text: t('mesConges'), icon: <EventNoteIcon />, path: '/app/mes-conges' },
    ]),
    { text: t('calendrier'), icon: <CalendarIcon />,  path: '/app/calendrier' },
    { text: t('profil'),     icon: <PersonIcon />,    path: '/app/profil' },
  ];

  if (user?.role === 'Admin' || user?.role === 'ChefDeService') {
    menuItems.splice(2, 0, {
      text: t('validationConges'), icon: <CheckCircleIcon />, path: '/app/validation-conges',
    });
  }
  if (user?.role === 'Admin') {
    menuItems.push({
      text: t('gestionUtilisateurs'), icon: <PeopleIcon />, path: '/app/gestion-utilisateurs',
    });
  }

const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ minHeight: 76, background: 'linear-gradient(135deg, #0f766e, #1d4ed8)', color: 'white' }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>{t('gestionDesConges')}</Typography>
      </Toolbar>
      <List sx={{ px: 1.25, pt: 2, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Bouton langue en bas de la sidebar */}
      <Box sx={{
        p: 2,
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
      }}>
        {(['ar', 'fr'] as const).map((lang) => (
          <Button
            key={lang}
            size="small"
            variant={i18n.language === lang ? 'contained' : 'outlined'}
            onClick={() => changeLanguage(lang)}
            sx={{ minWidth: 50, borderRadius: 1.5, fontWeight: 800 }}
          >
            {lang.toUpperCase()}
          </Button>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f6f8fb' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: isArabic ? 0 : { sm: `${drawerWidth}px` },
          mr: isArabic ? { sm: `${drawerWidth}px` } : 0,
          background: 'rgba(255,255,255,0.9)',
          color: 'text.primary',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: isArabic ? 0 : 2, ml: isArabic ? 2 : 0, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 800 }}>{t('gestionDesConges')}</Typography>
          <Notifications />
          <Button color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 34, height: 34, mr: isArabic ? 0 : 1, ml: isArabic ? 1 : 0, bgcolor: 'primary.main' }}>
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </Avatar>
            {user?.prenom} {user?.nom}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/app/profil'); }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              <ListItemText>{t('profil')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              <ListItemText>{t('deconnexion')}</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          anchor={isArabic ? 'right' : 'left'}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0 } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" open
          anchor={isArabic ? 'right' : 'left'}
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0, boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' } }}>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
