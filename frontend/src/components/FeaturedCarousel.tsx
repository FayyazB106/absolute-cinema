// src/components/FeaturedCarousel.tsx
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Box, Typography, Skeleton, Button, Container } from '@mui/material';
import { movieService } from '../services/movieService';
import type { Movie } from '../types/movie';
import { useTranslation } from 'react-i18next';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function FeaturedCarousel() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const allMovies = await movieService.getMovies();
                const featured = allMovies.filter(m => m.is_featured);
                setMovies(featured);
            } catch (error) {
                console.error("Failed to fetch featured movies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (loading) return <Skeleton variant="rectangular" width="100%" height="900vh" sx={{ bgcolor: '#0a0a0a' }} />;
    if (movies.length === 0) return null;

    return (
        <Box sx={{ width: '100%', height: '90vh', position: 'relative' }}>
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                effect="fade"
                speed={700}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation
                loop={movies.length > 1}
                className="mySwiper"
                style={{ height: '100%', width: '100%' }}
                key={i18n.language}
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
            >
                {movies.map((movie) => (
                    <SwiperSlide key={movie.id}>
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${movie.featured_full_url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'flex-end',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: 0,
                                    // Subtle gradient so text is readable against bright posters
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)',
                                }
                            }}
                        >
                            <Container sx={{ position: 'relative', zIndex: 10, pb: 5, textAlign: i18n.language === 'en' ? 'left' : 'right' }}>
                                <Typography variant="h1" sx={{
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    mb: 2,
                                    fontSize: { xs: '2.5rem', md: '4rem' }
                                }}>
                                    {i18n.language === 'ar' ? movie.name_ar : movie.name_en}
                                </Typography>
                                <Button variant="contained" color="primary" size="large">
                                    {t('home.book_now')}
                                </Button>
                            </Container>
                        </Box>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Customizing Swiper Bullets to match the theme */}
            <style>{`
                .swiper-pagination-bullet { background: white !important; opacity: 0.5; }
                .swiper-pagination-bullet-active { background: #ffffff !important; opacity: 1; scale: 1.2; }
                .swiper-button-next, .swiper-button-prev { color: white !important; }
            `}</style>
        </Box>
    );
}