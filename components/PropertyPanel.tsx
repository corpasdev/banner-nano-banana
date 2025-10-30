
import React, { useState, useEffect } from 'react';
// FIX: Changed fabric import to fix module resolution and type errors.
import * as fabric from 'fabric';
import { GoogleGenAI, Modality } from '@google/genai';
import { blobToBase64 } from '../utils/imageUtils';

interface PropertyPanelProps {
    selectedObject: fabric.Object | null;
    onPropertyChange: (property: string, value: any) => void;
    onReplaceImage: (newSrc: string) => void;
    onAiImageGenerated: (base64: string) => void;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="block text-sm font-medium text-gray-400 mb-1">{children}</label>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
);

const ColorInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <div className="relative w-full h-10">
        <input {...props} type="color" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <div className="w-full h-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 flex items-center" style={{ backgroundColor: props.value as string }}>
            <span className="text-white mix-blend-difference">{props.value as string}</span>
        </div>
    </div>
);


const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedObject, onPropertyChange, onReplaceImage, onAiImageGenerated }) => {
    const [text, setText] = useState('');
    const [fill, setFill] = useState('#ffffff');
    const [fontSize, setFontSize] = useState(24);
    const [aiEditPrompt, setAiEditPrompt] = useState('');
    const [aiGeneratePrompt, setAiGeneratePrompt] = useState('');
    const [isAiEditing, setIsAiEditing] = useState(false);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (selectedObject) {
            if (selectedObject.type === 'textbox') {
                const textObject = selectedObject as fabric.Textbox;
                setText(textObject.text || '');
                setFill(textObject.fill as string || '#ffffff');
                setFontSize(textObject.fontSize || 24);
            } else if (selectedObject.type === 'image') {
                // Image properties can be added here if needed
            }
        }
    }, [selectedObject]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        onPropertyChange('text', e.target.value);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFill(e.target.value);
        onPropertyChange('fill', e.target.value);
    };

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = parseInt(e.target.value, 10);
        setFontSize(size);
        onPropertyChange('fontSize', size);
    };
    
    const handleAiEdit = async () => {
        if (!aiEditPrompt || !selectedObject || selectedObject.type !== 'image' || !process.env.API_KEY) {
            setError('API key, prompt, and a selected image are required for AI editing.');
            return;
        }
        setIsAiEditing(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imageObject = selectedObject as fabric.Image;
            const dataUrl = imageObject.toDataURL({ format: 'png' });
            const base64Data = dataUrl.split(',')[1];

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: 'image/png' } },
                        { text: aiEditPrompt }
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const firstPart = response.candidates?.[0]?.content?.parts?.[0];
            if (firstPart && firstPart.inlineData) {
                const newBase64 = firstPart.inlineData.data;
                const newSrc = `data:image/png;base64,${newBase64}`;
                onReplaceImage(newSrc);
            } else {
                 throw new Error('No image data returned from AI.');
            }
        } catch (err) {
            console.error("AI edit error:", err);
            setError('Failed to edit image with AI. Check console for details.');
        } finally {
            setIsAiEditing(false);
        }
    };

    const handleAiGenerate = async () => {
        if (!aiGeneratePrompt || !process.env.API_KEY) {
            setError('API key and prompt are required for AI image generation.');
            return;
        }
        setIsAiGenerating(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: aiGeneratePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                 const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                 const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                 onAiImageGenerated(imageUrl);
                 setAiGeneratePrompt('');
            } else {
                throw new Error('No image was generated.');
            }

        } catch (err) {
            console.error("AI generation error:", err);
            setError('Failed to generate image with AI. Check console for details.');
        } finally {
            setIsAiGenerating(false);
        }
    };


    const renderTextProperties = () => {
        if (!selectedObject || selectedObject.type !== 'textbox') return null;
        return (
            <div className="space-y-4">
                <div>
                    <Label>Content</Label>
                    <textarea value={text} onChange={handleTextChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Color</Label>
                        <ColorInput value={fill} onChange={handleColorChange} />
                    </div>
                     <div>
                        <Label>Font Size</Label>
                        <TextInput type="number" value={fontSize} onChange={handleFontSizeChange} />
                    </div>
                </div>
            </div>
        );
    };

    const renderImageProperties = () => {
        if (!selectedObject || selectedObject.type !== 'image') return null;
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-600 pb-2">AI Image Editor</h3>
                <div>
                    <Label>Edit Prompt</Label>
                    <TextInput 
                        type="text" 
                        placeholder="e.g., 'Add a retro filter'"
                        value={aiEditPrompt}
                        onChange={(e) => setAiEditPrompt(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleAiEdit}
                    disabled={isAiEditing}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                    {isAiEditing ? 'Editing...' : 'Apply AI Edit'}
                </button>
            </div>
        );
    };
    
    const renderAiGenerator = () => {
        return (
            <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-400 border-b border-gray-600 pb-2">AI Image Generator</h3>
                <div>
                    <Label>Generation Prompt</Label>
                    <TextInput
                        type="text"
                        placeholder="e.g., 'A futuristic product on a podium'"
                        value={aiGeneratePrompt}
                        onChange={(e) => setAiGeneratePrompt(e.target.value)}
                    />
                </div>
                 <button
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 cursor-pointer"
                >
                    {isAiGenerating ? 'Generating...' : 'Generate New Image'}
                </button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="p-4 bg-gray-900/50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-cyan-400">Properties</h2>
                {error && <div className="bg-red-500/20 text-red-300 p-2 rounded-md mb-4 text-sm">{error}</div>}
                {!selectedObject && <p className="text-gray-500">Select an object on the canvas to edit its properties.</p>}
                {renderTextProperties()}
                {renderImageProperties()}
            </div>
            {renderAiGenerator()}
        </div>
    );
};

export default PropertyPanel;