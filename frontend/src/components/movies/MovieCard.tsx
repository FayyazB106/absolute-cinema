// src/components/movies/MovieCard.tsx
import { Box, Typography, Stack, Tooltip } from '@mui/material';
import type { Movie, Rating } from '../../types/movie';
import { useTranslation } from 'react-i18next';

interface MovieCardProps {
    movie: Movie;
    rating?: Rating;
}

export default function MovieCard({ movie, rating }: MovieCardProps) {
    const { i18n } = useTranslation();
    const isEnglish = i18n.language === "en";

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{
                position: 'relative',
                aspectRatio: '2/3',
                overflow: 'hidden',
                transition: 'all 0.4s ease-in-out',
                '&:hover img': { transform: 'scale(1.1)' }
            }}>
                <img
                    src={movie.poster_full_url || ''}
                    alt={movie.name_en}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                />
            </Box>

            <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
                    {isEnglish ? movie.name_en : movie.name_ar}
                </Typography>

                <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                        {movie.audio_languages?.map((lang, index) => (
                            <Box key={lang.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>
                                    {isEnglish ? lang.name_en : lang.name_ar}
                                </Typography>

                                {/* Render dot only if it's not the last item */}
                                {index < movie.audio_languages.length - 1 && (
                                    <Typography sx={{ fontSize: '0.65rem', color: '#666' }}>•</Typography>
                                )}
                            </Box>
                        ))}
                    </Stack>

                    {rating && (
                        <Tooltip title={isEnglish ? rating.name_en : rating.name_ar}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: rating.maturity_rating.toUpperCase().startsWith('R') ? '#ff0000' : '#666',
                                    fontWeight: 'bold',
                                    cursor: 'help'
                                }}
                            >
                                {rating.maturity_rating}
                            </Typography>
                        </Tooltip>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}