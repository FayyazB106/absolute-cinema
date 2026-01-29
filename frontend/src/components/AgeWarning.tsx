import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface AgeWarningProps {
    open: boolean;
    onClose: () => void;
}

export default function AgeWarning({ open, onClose }: AgeWarningProps) {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            slotProps={{ paper: { sx: { bgcolor: '#111', color: '#fff', borderRadius: 3, p: 2, border: '1px solid #333' } } }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                <WarningAmber sx={{ color: 'error.main', fontSize: 60 }} />
                <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>{t('warning.age_restricted_title')}</DialogTitle>
            </Box>
            <DialogContent>
                <Typography textAlign="center" sx={{ color: '#ccc' }}>{t('warning.id_requirement_desc')}</Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button onClick={onClose} variant="contained" color="error" sx={{ px: 4, fontWeight: 'bold', borderRadius: 2 }}>{t('warning.acknowledge')}</Button>
            </DialogActions>
        </Dialog>
    );
}