
import React from 'react';

interface MainActionsProps {
    onExportImage: () => void;
    onExportJson: () => void;
}

const MainActions: React.FC<MainActionsProps> = ({ onExportImage, onExportJson }) => {
    const Button: React.FC<{ onClick: () => void; children: React.ReactNode, className?: string }> = ({ onClick, children, className }) => (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${className}`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex items-center space-x-3">
            <Button onClick={onExportJson} className="bg-gray-700 hover:bg-gray-600 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <span>Save JSON</span>
            </Button>
            <Button onClick={onExportImage} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Export Image</span>
            </Button>
        </div>
    );
};

export default MainActions;
