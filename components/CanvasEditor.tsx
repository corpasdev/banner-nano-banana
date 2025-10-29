import React, { useRef, useEffect } from 'react';
// FIX: Changed fabric import to fix module resolution and type errors.
import * as fabric from 'fabric';
import { BannerElement } from '../types';
import { loadImageFromUrl, addTextToCanvas } from '../utils/canvasUtils';

interface CanvasEditorProps {
    format: string;
    elements: BannerElement[];
    onReady: (canvas: fabric.Canvas) => void;
    onObjectSelect: (object: fabric.Object | null) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ format, elements, onReady, onObjectSelect }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !canvasContainerRef.current) return;

        const [width, height] = format.split('x').map(Number);
        
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: width,
            height: height,
            backgroundColor: '#1f2937',
            preserveObjectStacking: true,
        });
        fabricCanvasRef.current = canvas;
        onReady(canvas);

        const renderElements = async () => {
            for (const element of elements) {
                if ((element.tipo === 'imagen' || element.tipo === 'logo') && element.src) {
                    try {
                       await loadImageFromUrl(canvas, element);
                    } catch (error) {
                        console.error(`Failed to load image ${element.src}:`, error);
                    }
                } else if (element.tipo === 'texto') {
                    addTextToCanvas(canvas, element);
                }
            }
        };

        renderElements();

        // FIX: Changed fabric.TEvent to fabric.IEvent as it correctly types the event object with a 'target' property for selection events.
        const handleSelection = (e: fabric.IEvent) => {
            onObjectSelect(e.target || null);
        };
        const handleSelectionCleared = () => {
            onObjectSelect(null);
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelectionCleared);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleSelectionCleared);
            canvas.dispose();
        };
    }, [format, elements, onReady, onObjectSelect]);

    const [width, height] = format.split('x').map(Number);

    return (
        <div ref={canvasContainerRef} style={{ maxWidth: '100%', maxHeight: '100%' }}>
            <canvas ref={canvasRef} width={width} height={height} />
        </div>
    );
};

export default CanvasEditor;
