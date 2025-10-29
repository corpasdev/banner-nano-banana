
import React from 'react';

interface AssetPanelProps {
    aiGeneratedImages: string[];
    onImageSelect: (src: string) => void;
}

const AssetPanel: React.FC<AssetPanelProps> = ({ aiGeneratedImages, onImageSelect }) => {
    const placeholderAssets = [
        "https://picsum.photos/seed/asset1/150/150",
        "https://picsum.photos/seed/asset2/150/150",
        "https://picsum.photos/seed/asset3/150/150",
        "https://picsum.photos/seed/asset4/150/150",
    ];

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
                <h3 className="col-span-2 text-sm font-bold text-gray-400 mt-4">Placeholders</h3>
                {placeholderAssets.map((src, index) => (
                    <button key={`ph-${index}`} onClick={() => onImageSelect(src)} className="aspect-square rounded-md overflow-hidden hover:ring-2 ring-cyan-500 transition-all">
                        <img src={src} alt={`Placeholder ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AssetPanel;
