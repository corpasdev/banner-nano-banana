
import React from 'react';
import { Template } from '../types';
import { adaptarLayout } from '../layouts/autoLayout';
import CanvasEditor from './CanvasEditor';

interface PreviewPanelProps {
    template: Template;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ template }) => {
    return (
        <div className="w-full h-full p-4 grid grid-cols-2 gap-6 place-items-center overflow-auto">
            {template.formatos.map(format => {
                const elements = adaptarLayout(format, template.elementos);
                const [width, height] = format.split('x').map(Number);
                const scale = Math.min(400 / width, 400 / height);
                return (
                    <div key={format} className="flex flex-col items-center space-y-2">
                        <h3 className="font-semibold text-gray-400">{format}</h3>
                        <div 
                            className="bg-gray-900 shadow-lg rounded-md overflow-hidden" 
                            style={{ width: width * scale, height: height * scale }}
                        >
                             <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                                <CanvasEditor
                                    format={format}
                                    elements={elements}
                                    onReady={() => {}} // Non-interactive, so no-op
                                    onObjectSelect={() => {}} // Non-interactive
                                />
                             </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PreviewPanel;
