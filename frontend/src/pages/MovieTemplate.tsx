import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Chip, Button, Link, Divider, Stack } from '@mui/material';
import { AccessTime, CalendarMonth, Language, ClosedCaption, Link as LinkIcon, Person, MovieFilter } from '@mui/icons-material';
import { movieService } from '../services/movieService';
import type { MovieDetails } from '../types/movie';
import { useTranslation } from 'react-i18next';
import reel from './../assets/reel.png'
import SpinningWheel from '../components/shared/SpinningWheel';

export default function MovieDetails() {
    const { movieId } = useParams();
    const { t, i18n } = useTranslation();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const isEnglish = i18n.language.startsWith('en');
    const fullDate = movie?.release_date ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(new Date(movie.release_date)) : '';

    useEffect(() => {
        const fetchMovie = async () => {
            if (movieId) {
                const data = await movieService.getMovieById(Number(movieId));
                setMovie(data);
            }
        };
        fetchMovie();
    }, [movieId]);

    if (!movie) return <SpinningWheel />;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff', pb: 10 }}>
            {/* Hero Section */}
            <Box sx={{
                display: { xs: 'none', md: 'block' },
                height: '65vh',
                backgroundImage: `linear-gradient(to top, #000 0%, rgba(0,0,0,0.4) 50%, transparent 100%), url(${movie.featured_full_url ?? reel})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }} />

            <Container maxWidth={"xl" as any} sx={{ mt: { xs: 2, md: -15 }, position: 'relative' }}>
                <Grid container spacing={6}>
                    {/* Poster Column + Buttons*/}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box component="img" src={movie.poster_full_url ?? ''} sx={{ width: '100%', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }} />

                        <Button fullWidth variant="contained" size="large" sx={{ mt: 3, py: 2, borderRadius: 2, fontWeight: 'bold' }}>{t('home.book_now')}</Button>
                        <Button fullWidth component={Link} href={movie.imdb_url} target="_blank" sx={{ mt: 2, color: '#f5c518', fontWeight: 'bold', gap: 1 }}>
                            <LinkIcon />{t("movies_library.view_imdb")}
                        </Button>
                    </Grid>

                    {/* Movie Details */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography sx={{ fontWeight: 900, mb: 2, fontSize: { xs: 'h4.fontSize', md: 'h2.fontSize' } }}>
                            {isEnglish ? movie.name_en : movie.name_ar}
                        </Typography>

                        {/* Metadata */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, color: '#aaa', alignItems: 'center' }}>
                            <Chip
                                label={movie.maturity_ratings?.maturity_rating}
                                sx={{
                                    // Use red if it starts with 'R'
                                    bgcolor: movie.maturity_ratings?.maturity_rating?.toUpperCase().startsWith('R') ? 'error.main' : '#333',
                                    color: 'white',
                                    fontWeight: 'bold',
                                }}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarMonth fontSize="small" />
                                <Typography variant="body2">{fullDate}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime fontSize="small" />
                                <Typography variant="body2">{t("movies_library.duration_minutes", { count: movie.duration })}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {movie.genres?.map(genre => (
                                <Chip key={genre.id} label={isEnglish ? genre.name_en : genre.name_ar} variant="outlined" sx={{ color: '#fff', borderColor: '#444' }} />
                            ))}
                        </Box>

                        <Typography variant="h6" sx={{ color: '#ccc', mb: 5 }}>{isEnglish ? movie.desc_en : movie.desc_ar}</Typography>

                        <Divider sx={{ borderColor: '#222', mb: 4 }} />

                        {/* Cast & Crew */}
                        <Stack spacing={4}>
                            {/* Directors */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, color: '#666', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MovieFilter fontSize="small" />{t("movies_library.directed_by")}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {movie.directors?.map(dir => (
                                        <Chip key={dir.id} label={isEnglish ? dir.name_en : dir.name_ar} sx={{ bgcolor: '#1a1a1a', color: '#fff', px: 1 }} />
                                    ))}
                                </Box>
                            </Box>

                            {/* Actors */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, color: '#666', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Person fontSize="small" />{t("movies_library.starring")}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {movie.actors?.map(actor => (
                                        <Chip key={actor.id} label={isEnglish ? actor.name_en : actor.name_ar} variant="outlined" sx={{ borderColor: '#333', color: '#ccc' }} />
                                    ))}
                                </Box>
                            </Box>

                            {/* Languages */}
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" sx={{ color: '#666', textTransform: 'uppercase', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Language fontSize="inherit" />{t("movies_library.languages")}
                                    </Typography>
                                    <Typography variant="body2">{movie.audio_languages?.map(l => isEnglish ? l.name_en : l.name_ar).join(' • ')}</Typography>
                                </Grid>
                                {movie.subtitles && movie.subtitles.length > 0 && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" sx={{ color: '#666', textTransform: 'uppercase', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ClosedCaption fontSize="inherit" />{t("movies_library.subtitles")}
                                        </Typography>
                                        <Typography variant="body2">{movie.subtitles?.map(l => isEnglish ? l.name_en : l.name_ar).join(' • ')}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}