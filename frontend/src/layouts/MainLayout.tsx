import { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Drawer } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { absoluteCinemaTheme } from '../theme';

export default function MainLayout() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        // Add the class to the root HTML element when entering public pages
        document.documentElement.classList.add('client-root');
        
        return () => {
            // Remove it when navigating to the Dashboard
            document.documentElement.classList.remove('client-root');
        };
    }, []);

    return (
        <ThemeProvider theme={absoluteCinemaTheme}>
            <CssBaseline />
            <Box  sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
                <Header onOpenDrawer={() => setDrawerOpen(true)} />

                <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    
                </Drawer>

                <Box component="main" sx={{ flexGrow: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </ThemeProvider>
    );
}