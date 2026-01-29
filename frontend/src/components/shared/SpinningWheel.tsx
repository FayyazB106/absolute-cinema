import { Box, CircularProgress } from '@mui/material';

interface SpinningWheelProps {
    size?: number;
    color?: string;
}

export default function SpinningWheel({ size = 60, color = '#fff' }: SpinningWheelProps) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#000' }}>
            <CircularProgress size={size} sx={{ color: color }} />
        </Box>
    );
}