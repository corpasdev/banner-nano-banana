import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Lock, Unlock, Grid3X3, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
// FIX: Changed fabric import to fix module resolution and type errors.
import * as fabric from 'fabric';
import { Template, BannerElement, CanvasView } from './types';
import { adaptarLayout } from './layouts/autoLayout';

import TemplateModal from './components/TemplateModal';
import CanvasEditor from './components/CanvasEditor';
import PropertyPanel from './components/PropertyPanel';
import FormatSelector from './components/FormatSelector';
import PreviewPanel from './components/PreviewPanel';
import MainActions from './components/MainActions';
import AssetPanel from './components/AssetPanel';
import { exportCanvasToImage, exportLayoutToJson } from './utils/exportUtils';
import { updateCanvasObject, replaceImageOnCanvas } from './utils/canvasUtils';

const App: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
    const [activeFormat, setActiveFormat] = useState<string>('');
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [view, setView] = useState<CanvasView>('single');
    const [aiGeneratedImages, setAiGeneratedImages] = useState<string[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const [autoFit, setAutoFit] = useState<boolean>(true);
    const [zoom, setZoom] = useState<number>(1);

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const response = await fetch('./mock/templates.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTemplates(data);
            } catch (error) {
                console.error("Could not load templates:", error);
            }
        };
        loadTemplates();
    }, []);

    useEffect(() => {
        if (templates.length > 0 && !activeTemplate) {
            setShowTemplateModal(true);
        }
    }, [templates, activeTemplate]);

    const handleTemplateSelect = (template: Template) => {
        setActiveTemplate(template);
        setActiveFormat(template.formatos[0]);
        setView('single');
        setShowTemplateModal(false);
    };

    const handleOpenTemplateModal = () => {
        setShowTemplateModal(true);
    };

    const handleFormatSelect = (format: string) => {
        setActiveFormat(format);
        setView('single');
    };
    
    const handleObjectSelection = useCallback((obj: fabric.Object | null) => {
        setSelectedObject(obj);
    }, []);

    const handlePropertyChange = (property: string, value: any) => {
        if (selectedObject && canvas) {
            updateCanvasObject(selectedObject, property, value, canvas);
        }
    };
    
    const handleReplaceImage = (newSrc: string) => {
        if (selectedObject && canvas && selectedObject.type === 'image') {
            replaceImageOnCanvas(selectedObject as fabric.Image, newSrc, canvas);
        }
    };

    const handleExportImage = () => {
        if (canvas) {
            exportCanvasToImage(canvas, `${activeTemplate?.id}_${activeFormat}.png`);
        }
    };

    const handleExportJson = () => {
        if (canvas && activeTemplate) {
            exportLayoutToJson(canvas, activeTemplate, activeFormat);
        }
    };

    // Memoize the layout elements to avoid recalculating on every render
    const currentLayoutElements = useMemo(() => {
        if (!activeTemplate) return [];
        return adaptarLayout(activeFormat, activeTemplate.elementos);
    }, [activeFormat, activeTemplate]);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-900 text-gray-200">
            <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Sparkles className="h-8 w-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold tracking-wider">AI Banner Studio</h1>
                    {activeTemplate && (
                        <button
                            onClick={handleOpenTemplateModal}
                            className="ml-4 px-3 py-1.5 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                        >
                            Cambiar Template
                        </button>
                    )}
                </div>
                {activeTemplate && (
                    <MainActions onExportImage={handleExportImage} onExportJson={handleExportJson} />
                )}
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 bg-gray-800 p-4 overflow-y-auto flex flex-col space-y-6">
                    <AssetPanel 
                        aiGeneratedImages={aiGeneratedImages} 
                        onImageSelect={handleReplaceImage}
                        templateElements={currentLayoutElements}
                    />
                </aside>

                <main className="flex-1 flex flex-col p-4 md:p-6 bg-gray-900 overflow-hidden">
                    {activeTemplate && (
                        <>
                            <div className="mb-4">
                                <FormatSelector 
                                    formats={activeTemplate.formatos} 
                                    activeFormat={activeFormat} 
                                    onSelect={handleFormatSelect}
                                />
                            </div>
                            <div className="flex-1 bg-gray-800/50 rounded-lg p-2 flex items-center justify-center overflow-auto relative">
                                {view === 'single' ? (
                                    <CanvasEditor
                                        key={`${activeTemplate.id}-${activeFormat}`}
                                        format={activeFormat}
                                        elements={currentLayoutElements}
                                        onReady={setCanvas}
                                        onObjectSelect={handleObjectSelection}
                                        locked={isLocked}
                                        showGrid={showGrid}
                                        autoFit={autoFit}
                                        requestedScale={autoFit ? undefined : zoom}
                                        onScaleChange={(s) => setZoom(s)}
                                    />
                                ) : (
                                    <PreviewPanel
                                        template={activeTemplate}
                                    />
                                )}

                                {view === 'single' && (
                                    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 bg-gray-800/80 backdrop-blur rounded-md px-2 py-1 shadow">
                                        <button
                                            onClick={() => setIsLocked(v => !v)}
                                            className={`px-2 py-1 text-sm rounded ${isLocked ? 'bg-gray-700 text-red-300' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600`}
                                            title={isLocked ? 'Unlock panel' : 'Lock panel'}
                                            aria-label={isLocked ? 'Unlock panel' : 'Lock panel'}
                                        >
                                            {isLocked ? (
                                                <Lock className="h-4 w-4" />
                                            ) : (
                                                <Unlock className="h-4 w-4" />
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setShowGrid(v => !v)}
                                            className={`px-2 py-1 text-sm rounded ${showGrid ? 'bg-gray-700 text-cyan-300' : 'bg-gray-700 text-gray-300'} hover:bg-gray-600`}
                                            title={showGrid ? 'Hide grid' : 'Show grid'}
                                            aria-label={showGrid ? 'Hide grid' : 'Show grid'}
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </button>

                                        <div className="px-2 py-1 text-sm text-gray-300 min-w-[56px] text-center" title="Zoom level">
                                            {Math.round((zoom || 1) * 100)}%
                                        </div>

                                        <button
                                            onClick={() => {
                                                setAutoFit(false);
                                                setZoom(z => Math.min(3, (z || 1) * 1.1));
                                            }}
                                            className="px-2 py-1 text-sm rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            title="Zoom in"
                                            aria-label="Zoom in"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setAutoFit(false);
                                                setZoom(z => Math.max(0.1, (z || 1) / 1.1));
                                            }}
                                            className="px-2 py-1 text-sm rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            title="Zoom out"
                                            aria-label="Zoom out"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setAutoFit(true);
                                            }}
                                            className="px-2 py-1 text-sm rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            title="Reset / Fit to screen"
                                            aria-label="Fit to screen"
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>

                <aside className="w-80 bg-gray-800 p-4 overflow-y-auto">
                    <PropertyPanel 
                        selectedObject={selectedObject} 
                        onPropertyChange={handlePropertyChange}
                        onReplaceImage={handleReplaceImage}
                        onAiImageGenerated={(base64) => setAiGeneratedImages(prev => [...prev, base64])}
                     />
                </aside>
            </div>

            <TemplateModal
                templates={templates}
                onSelect={handleTemplateSelect}
                activeTemplateId={activeTemplate?.id || ''}
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
            />
        </div>
    );
};

export default App;