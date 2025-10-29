
import React from 'react';
import { CanvasView } from '../types';

interface FormatSelectorProps {
    formats: string[];
    activeFormat: string;
    onSelect: (format: string) => void;
    currentView: CanvasView;
    onViewChange: (view: CanvasView) => void;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({ formats, activeFormat, onSelect, currentView, onViewChange }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 bg-gray-800 p-2 rounded-lg">
            {formats.map(format => (
                <button
                    key={format}
                    onClick={() => onSelect(format)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeFormat === format && currentView === 'single'
                            ? 'bg-cyan-500 text-white shadow-md'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {format}
                </button>
            ))}
            <div className="h-6 w-px bg-gray-600 mx-2"></div>
            <button
                onClick={() => onViewChange(currentView === 'single' ? 'multi' : 'single')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    currentView === 'multi'
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
            >
                Multi-view
            </button>
        </div>
    );
};

export default FormatSelector;
