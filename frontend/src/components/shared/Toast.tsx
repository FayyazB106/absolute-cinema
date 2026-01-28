import { toast, Toaster } from 'react-hot-toast';
import { useMemo } from 'react';

// Toast object
export { toast };

// Helper to detect dark mode
const isDarkMode = () => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
};

// Toast style
export default function Toast() {
    const isDark = useMemo(() => isDarkMode(), []);

    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    transition: 'all 0.2s ease-in-out',
                    background: isDark ? 'rgb(30, 41, 59)' : 'white',
                    color: isDark ? 'white' : 'rgb(15, 23, 42)',
                },
                // Specific states
                success: {
                    style: {
                        background: 'green',
                        color: 'white',
                    },
                },
                error: {
                    style: {
                        background: 'red',
                        color: 'white',
                    },
                },
                loading: {
                    style: {
                        background: isDark ? 'rgb(30, 58, 138)' : 'white',
                        color: isDark ? 'white' : 'rgb(30, 58, 138)',
                    },
                },
            }}
        />
    );
}