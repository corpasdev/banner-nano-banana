
import React, { useMemo } from 'react';
import { BannerElement } from '../types';

interface AssetPanelProps {
    aiGeneratedImages: string[];
    onImageSelect: (src: string) => void;
    templateElements?: BannerElement[];
}

const AssetPanel: React.FC<AssetPanelProps> = ({ aiGeneratedImages, onImageSelect, templateElements = [] }) => {
    // Extract image URLs from template elements (images and logos)
    const templateImages = useMemo(() => {
        const images: string[] = [];
        templateElements.forEach(element => {
            if ((element.tipo === 'imagen' || element.tipo === 'logo') && element.src) {
                // Avoid duplicates
                if (!images.includes(element.src)) {
                    images.push(element.src);
                }
            }
        });
        return images;
    }, [templateElements]);

    return (
        <div>
            <h2 className="text-xl font-semibold mb-3 text-cyan-400">Assets</h2>
            <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-2 text-sm font-bold text-gray-400 mt-2">AI Generated</h3>
                {aiGeneratedImages.length === 0 && <p className="col-span-2 text-xs text-gray-500">Generate images in the properties panel.</p>}
                {aiGeneratedImages.map((src, index) => (
                    <button key={`ai-${index}`} onClick={() => onImageSelect(src)} className="aspect-square rounded-md overflow-hidden hover:ring-2 ring-cyan-500 transition-all">
                        <img src={src} alt={`AI Generated ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
                {templateImages.length > 0 && (
                    <>
                        <h3 className="col-span-2 text-sm font-bold text-gray-400 mt-4">Template Images</h3>
                        {templateImages.map((src, index) => (
                            <button key={`template-${index}`} onClick={() => onImageSelect(src)} className="aspect-square rounded-md overflow-hidden hover:ring-2 ring-cyan-500 transition-all">
                                <img src={src} alt={`Template Image ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default AssetPanel;
