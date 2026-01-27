import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { Language, Menu as MenuIcon } from '@mui/icons-material';
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
                    <MenuIcon />
                </IconButton>

                {/* Title */}
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {t("header.title")}
                </Typography>

                {/* Language button */}
                <Button onClick={toggleLanguage} color="inherit" sx={{ fontWeight: 'bold', borderRadius: '20px', gap: 1 }}>
                    <Language /> {i18n.language.startsWith('en') ? 'ع' : 'EN'}
                </Button>
            </Toolbar>
        </AppBar>
    );
}