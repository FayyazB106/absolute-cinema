import { Plus } from 'lucide-react';

interface PlusButtonProps {
    onClick: () => void;
    title?: string;
    disabled?: boolean;
}

export default function PlusButton({ onClick, title , disabled }: PlusButtonProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            aria-label={title}
            disabled={disabled}
            className="bg-blue-600 text-white font-bold p-3 rounded-full hover:bg-blue-700 hover:scale-105 shadow-lg transform transition duration-200"
        >
            <Plus size={24} />
        </button>
    );
}