import React from 'react';
import { X } from 'lucide-react';

interface ChromeTabProps {
    title: string;
    favicon: string;
    isActive: boolean;
    onClose: () => void;
    onClick: () => void;
}

const ChromeTab: React.FC<ChromeTabProps> = ({ title, favicon, isActive, onClose, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 w-48 ${
                isActive 
                    ? 'bg-white text-gray-900' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } rounded-t-lg cursor-pointer group relative`}
        >
            {favicon ? (
                <img src={favicon} alt="favicon" width={16} height={16} className="w-4 h-4" />
            ) : (
                <div className="w-4 h-4 rounded-full bg-gray-400" />
            )}
            <span className="flex-1 truncate text-sm">{title}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className={`opacity-0 group-hover:opacity-100 hover:bg-gray-300 p-1 rounded-full transition-opacity duration-200`}
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default ChromeTab;
