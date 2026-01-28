import { AppBar, Toolbar, Typography, IconButton, Button, Box } from '@mui/material';
import { Language, Menu } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    onOpenDrawer: () => void;
}

export default function Header({ onOpenDrawer }: HeaderProps) {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
        document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    };

    return (
        <AppBar position="sticky" elevation={4}>
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 8 } }}>
                {/* Hamburger Menu */}
                <IconButton color="inherit" onClick={onOpenDrawer}>
                    <Menu />
                </IconButton>

                {/* Title */}
                <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: { xs: 'h6.fontSize', md: 'h4.fontSize' } }}>
                    {t("header.title")}
                </Typography>

                {/* Language button */}
                <Button
                    onClick={toggleLanguage}
                    color="inherit"
                    sx={{
                        fontWeight: 'bold',
                        borderRadius: '20px',
                        gap: { xs: 0, sm: 1 },
                        minWidth: { xs: '40px', sm: '64px' }
                    }}
                >
                    <Language />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                        {i18n.language.startsWith('en') ? 'ع' : 'EN'}
                    </Box>
                </Button>
            </Toolbar>
        </AppBar>
    );
}