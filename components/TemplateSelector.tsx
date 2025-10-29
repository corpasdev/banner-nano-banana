
import React from 'react';
import { Template } from '../types';

interface TemplateSelectorProps {
    templates: Template[];
    onSelect: (template: Template) => void;
    activeTemplateId: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect, activeTemplateId }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-3 text-cyan-400">Templates</h2>
            <div className="space-y-2">
                {templates.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onSelect(template)}
                        className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${
                            activeTemplateId === template.id
                                ? 'bg-cyan-500/20 ring-2 ring-cyan-500 shadow-lg'
                                : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <img src={template.thumbnail} alt={template.nombre} className="w-16 h-10 object-cover rounded" />
                            <span className="font-medium">{template.nombre}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TemplateSelector;
