import { Box } from '@mui/material';
import MovieGrid from '../components/movies/MovieGrid';

export default function MoviesPage() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            <MovieGrid />
        </Box>
    );
}