import { Box, Container } from '@mui/material';
import FeaturedCarousel from '../components/FeaturedCarousel';

export default function Home() {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <FeaturedCarousel />
          
            <Container sx={{ mt: 4 }}>

            </Container>
        </Box>
    );
}