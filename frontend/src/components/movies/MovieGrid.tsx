import { Grid, Skeleton, Container, Tabs, Box, Tab } from '@mui/material';
import MovieCard from './MovieCard';
import type { Movie, Status, Rating } from '../../types/movie';
import { useState, useEffect, useMemo } from 'react';
import { movieService } from '../../services/movieService';
import { useTranslation } from 'react-i18next';

export default function MovieGrid() {
    const { t } = useTranslation();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [movieData, options] = await Promise.all([
                    movieService.getMovies(),
                    movieService.getOptions()
                ]);
                setMovies(movieData);
                setStatuses(options.statuses);
                setRatings(options.maturity_ratings);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredMovies = useMemo(() => {
        const releasedId = statuses.find(s => s.name_en.toLowerCase() === 'released')?.id;
        const comingSoonId = statuses.find(s => s.name_en.toLowerCase() === 'coming soon')?.id;

        return movies.filter(movie => {
            const targetId = tabValue === 0 ? releasedId : comingSoonId;
            return movie.status_id === targetId;
        });
    }, [movies, statuses, tabValue]);

    return (
        <Container maxWidth={"xl" as any} disableGutters sx={{ mt: 6 }}>
            <Box px={2} sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 6 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    sx={{
                        '& .MuiTabs-flexContainer': { justifyContent: { xs: 'center', sm: 'flex-start' } },
                        '& .MuiTabs-indicator': { backgroundColor: '#fff' }
                    }}
                >
                    <Tab label={t('home.whats_on')} sx={{ color: '#666', '&.Mui-selected': { color: '#fff' } }} />
                    <Tab label={t('home.coming_soon')} sx={{ color: '#666', '&.Mui-selected': { color: '#fff' } }} />
                </Tabs>
            </Box>

            <Grid container px={2} spacing={4}>
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                            <Skeleton variant="rectangular" height={400} sx={{ bgcolor: '#111' }} />
                        </Grid>
                    ))
                ) : (
                    filteredMovies.map((movie) => (
                        <Grid key={movie.id} size={{ xs: 6, sm: 4, md: 3 }}>
                            <MovieCard movie={movie} rating={ratings.find(r => r.id === movie.maturity_id)} />
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}