import { Plus } from 'lucide-react';

interface PlusButtonProps {
    onClick: () => void;
}

export default function PlusButton({ onClick }: PlusButtonProps) {
    return (
        <button
            onClick={onClick}
            className="bg-blue-600 text-white font-bold p-3 rounded-full hover:bg-blue-700 hover:scale-105 shadow-lg transform transition duration-200"
        >
            <Plus size={24} />
        </button>
    );
}