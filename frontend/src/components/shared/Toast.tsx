import { toast, Toaster } from 'react-hot-toast';

// Toast object
export { toast };

// Toast style
export default function Toast() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    transition: 'all 0.2s ease-in-out',
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
            }}
        />
    );
}