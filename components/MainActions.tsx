
import React from 'react';
import { FileJson, Download } from 'lucide-react';

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
                <FileJson className="h-4 w-4" />
                <span>Save JSON</span>
            </Button>
            <Button onClick={onExportImage} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Download className="h-4 w-4" />
                <span>Export Image</span>
            </Button>
        </div>
    );
};

export default MainActions;
