
import React from 'react';
import { X } from 'lucide-react';
import { Template } from '../types';

interface TemplateModalProps {
    templates: Template[];
    onSelect: (template: Template) => void;
    activeTemplateId: string;
    isOpen: boolean;
    onClose: () => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ templates, onSelect, activeTemplateId, isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleSelect = (template: Template) => {
        onSelect(template);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-cyan-400">Selecciona un Template</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(template => (
                        <button
                            key={template.id}
                            onClick={() => handleSelect(template)}
                            className={`text-left p-4 rounded-lg transition-all duration-200 ${
                                activeTemplateId === template.id
                                    ? 'bg-cyan-500/20 ring-2 ring-cyan-500 shadow-lg'
                                    : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        >
                            <img 
                                src={template.thumbnail} 
                                alt={template.nombre} 
                                className="w-full h-32 object-cover rounded mb-3" 
                            />
                            <h3 className="font-semibold text-lg text-white">{template.nombre}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {template.formatos.length} formato{template.formatos.length !== 1 ? 's' : ''}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateModal;

