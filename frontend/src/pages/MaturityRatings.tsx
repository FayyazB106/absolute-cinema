import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Stack } from '@mui/material';
import { movieService } from '../services/movieService';
import type { Rating } from '../types/movie';
import { useTranslation } from 'react-i18next';
import SpinningWheel from '../components/shared/SpinningWheel';

export default function MaturityRatings() {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language.startsWith('en');
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const data = await movieService.getRatings();
                // Sort by ranking
                setRatings(data.sort((a, b) => a.ranking - b.ranking));
            } catch (error) {
                console.error("Failed to fetch ratings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, []);

    if (loading) return <SpinningWheel />;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff', pt: 12, pb: 6 }}>
            <Container maxWidth={"xl" as any}>
                <Typography sx={{ mb: 6, textAlign: 'center', fontWeight: 900, fontSize: { xs: 'h4.fontSize', md: 'h3.fontSize' } }}>
                    {t('titles.ratings')}
                </Typography>

                <Grid container spacing={3}>
                    {ratings.map((rating) => (
                        <Grid key={rating.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper sx={{ p: 3, height: '100%', bgcolor: '#111', color: '#fff', borderRadius: 3 }}>
                                <Stack spacing={2} alignItems="center">
                                    {/* Rating */}
                                    <Box sx={{
                                        width: '30%',
                                        bgcolor: rating.maturity_rating.toUpperCase().startsWith('R') ? 'error.main' : '#333',
                                        color: '#fff',
                                        py: 2,
                                        borderRadius: 2,
                                        textAlign: 'center',
                                        fontWeight: '900',
                                        fontSize: '1.5rem'
                                    }}>
                                        {rating.maturity_rating}
                                    </Box>

                                    {/* The Rating Name */}
                                    <Typography variant="h6" fontWeight="bold" textAlign="center">{isEnglish ? rating.name_en : rating.name_ar}</Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}