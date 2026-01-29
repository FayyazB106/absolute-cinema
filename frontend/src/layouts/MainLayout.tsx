import { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/shared/Header';
import { absoluteCinemaTheme } from '../theme';
import { Home, VerifiedUser } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function MainLayout() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language.startsWith('en');

    const menuItems = [
        { text: t('nav.home'), icon: <Home />, path: '/' },
        { text: t('nav.movies'), icon: <MovieIcon />, path: '/movies' },
        { text: t('nav.ratings'), icon: <VerifiedUser />, path: '/maturity-ratings' },
    ];

    useEffect(() => {
        document.documentElement.classList.add('client-root');
        document.documentElement.dir = isEnglish ? 'ltr' : 'rtl';
        document.documentElement.lang = i18n.language;

        return () => {
            document.documentElement.classList.remove('client-root');
        };
    }, [isEnglish, i18n.language]);

    return (
        <ThemeProvider theme={absoluteCinemaTheme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
                <Header onOpenDrawer={() => setDrawerOpen(true)} />

                <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} anchor={isEnglish ? 'left' : 'right'}>
                    <Box sx={{ p: 2 }}>
                        <List>
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;

                                return (
                                    <ListItem key={item.path} disablePadding>
                                        <ListItemButton
                                            onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                                            sx={{
                                                mb: 0.5,
                                                bgcolor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' }
                                            }}
                                        >
                                            <ListItemIcon sx={{ color: isActive ? 'primary.main' : '#fff', minWidth: 40 }}>{item.icon}</ListItemIcon>
                                            <ListItemText primary={item.text} sx={{ textAlign: 'start' }} />
                                        </ListItemButton>
                                    </ListItem>
                                )
                            })}
                        </List>
                    </Box>
                </Drawer>

                <Box component="main" sx={{ flexGrow: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </ThemeProvider>
    );
}