import { Box, Typography, Stack, Tooltip } from '@mui/material';
import type { Movie, Rating } from '../../types/movie';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
    movie: Movie;
    rating?: Rating;
}

export default function MovieCard({ movie, rating }: MovieCardProps) {
    const { i18n } = useTranslation();
    const isEnglish = i18n.language === "en";
    const navigate = useNavigate();

    return (
        <Box sx={{ width: '100%' }}>
            <Box
                onClick={() => navigate(`/movie/${movie.id}`)}
                sx={{
                    cursor: 'pointer',
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
                <Typography onClick={() => navigate(`/movie/${movie.id}`)} variant="body1" sx={{ fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>
                    {isEnglish ? movie.name_en : movie.name_ar}
                </Typography>

                <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                        {movie.audio_languages?.map((lang, index) => (
                            <Box key={lang.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant='body2' sx={{ fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' }}>
                                    {isEnglish ? lang.name_en : lang.name_ar}
                                </Typography>

                                {/* Render dot only if it's not the last item */}
                                {index < movie.audio_languages.length - 1 && (
                                    <Typography variant='body2' sx={{ color: '#666' }}>•</Typography>
                                )}
                            </Box>
                        ))}
                    </Stack>

                    {rating && (
                        <Tooltip title={isEnglish ? rating.name_en : rating.name_ar} enterTouchDelay={0} leaveTouchDelay={3000} arrow>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: rating.maturity_rating.toUpperCase().startsWith('R') ? '#ff0000' : '#666',
                                    fontWeight: 'bold',
                                    cursor: 'help',

                                    // Text Shimmer Effect
                                    display: 'inline-block',
                                    backgroundImage: rating.maturity_rating.toUpperCase().startsWith('R')
                                        ? 'linear-gradient(90deg, #ff0000 25%, #ff8888 50%, #ff0000 75%)'
                                        : 'linear-gradient(90deg, #666 25%, #fff 50%, #666 75%)',
                                    backgroundSize: '200% auto',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    animation: 'shimmer 3s infinite linear',
                                    transition: 'all 0.3s ease',

                                    // Stop shimmer and solidify on hover and mobile tap
                                    '&:hover, &:active': {
                                        animationPlayState: 'paused',
                                        WebkitTextFillColor: rating.maturity_rating.toUpperCase().startsWith('R') ? '#ff0000' : '#666',
                                    }
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