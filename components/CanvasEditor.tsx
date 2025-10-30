import React, { useRef, useEffect, useMemo, useState } from 'react';
// FIX: Changed fabric import to fix module resolution and type errors.
import * as fabric from 'fabric';
import { BannerElement } from '../types';
import { loadImageFromUrl, addTextToCanvas } from '../utils/canvasUtils';

interface CanvasEditorProps {
    format: string;
    elements: BannerElement[];
    onReady: (canvas: fabric.Canvas) => void;
    onObjectSelect: (object: fabric.Object | null) => void;
    locked?: boolean;
    showGrid?: boolean;
    autoFit?: boolean; // when true, compute scale to fit viewport; when false, use requestedScale
    requestedScale?: number; // external scale when autoFit is false
    onScaleChange?: (scale: number) => void; // notify parent when internal scale changes
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ format, elements, onReady, onObjectSelect, locked = false, showGrid = false, autoFit = true, requestedScale, onScaleChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const isRenderingRef = useRef<boolean>(false);
    const lastRenderedKeyRef = useRef<string>('');
    const [scale, setScale] = useState<number>(1);

    // Create canvas only when format changes
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

        // Selection event handler; use a permissive type to support various fabric builds
        const handleSelection = (e: any) => {
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
            fabricCanvasRef.current = null;
            // Reset render tracking when canvas is disposed
            isRenderingRef.current = false;
            lastRenderedKeyRef.current = '';
        };
    }, [format, onReady, onObjectSelect]);

    // Memoize elements serialization to avoid unnecessary re-renders when content is the same
    const elementsKey = useMemo(() => JSON.stringify(elements), [elements]);

    // Compute and apply a scale so the canvas fits inside the available container viewport
    useEffect(() => {
        const container = canvasContainerRef.current;
        if (!container) return;

        const computeScale = () => {
            const [w, h] = format.split('x').map(Number);
            const availableWidth = container.clientWidth || w;
            // Cap height to visible viewport area below the container top, minus a small margin
            const rect = container.getBoundingClientRect();
            const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : h;
            const availableHeight = Math.max(0, viewportHeight - rect.top - 16);
            // Scale down to fit, never scale up above 1
            const nextScale = Math.min(1, Math.min(availableWidth / w, availableHeight / h));
            const finalScale = nextScale > 0 && isFinite(nextScale) ? nextScale : 1;
            setScale(finalScale);
            if (onScaleChange) onScaleChange(finalScale);
        };

        // Initial compute
        if (autoFit) {
            computeScale();
        } else if (typeof requestedScale === 'number' && isFinite(requestedScale) && requestedScale > 0) {
            setScale(requestedScale);
            if (onScaleChange) onScaleChange(requestedScale);
        }

        // Observe container size changes
        const ro = new ResizeObserver(() => {
            if (autoFit) computeScale();
        });
        ro.observe(container);

        // Recompute on window resize as well
        const onResize = () => {
            if (autoFit) computeScale();
        };
        window.addEventListener('resize', onResize);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', onResize);
        };
    }, [format, autoFit, requestedScale, onScaleChange]);

    // When external requestedScale changes while not autoFit, apply it
    useEffect(() => {
        if (!autoFit && typeof requestedScale === 'number' && isFinite(requestedScale) && requestedScale > 0) {
            setScale(requestedScale);
            if (onScaleChange) onScaleChange(requestedScale);
        }
    }, [requestedScale, autoFit, onScaleChange]);

    // Apply lock/unlock to canvas and objects
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        canvas.selection = !locked;
        const objects = canvas.getObjects();
        objects.forEach(obj => {
            obj.selectable = !locked;
            obj.evented = !locked;
            if (obj.hasOwnProperty('lockMovementX')) {
                (obj as any).lockMovementX = locked;
                (obj as any).lockMovementY = locked;
                (obj as any).lockScalingX = locked;
                (obj as any).lockScalingY = locked;
                (obj as any).lockRotation = locked;
            }
        });
        canvas.discardActiveObject();
        canvas.renderAll();
    }, [locked]);

    // Render elements separately to avoid infinite loops
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Prevent concurrent renders and duplicate renders
        if (isRenderingRef.current) {
            console.warn('Render already in progress, skipping...');
            return;
        }

        if (lastRenderedKeyRef.current === elementsKey) {
            console.log('Elements unchanged, skipping render...');
            return;
        }

        isRenderingRef.current = true;
        lastRenderedKeyRef.current = elementsKey;

        // Disable events during rendering to prevent feedback loops
        canvas.selection = false;
        
        // Clear existing objects before rendering new ones
        const existingObjects = canvas.getObjects();
        existingObjects.forEach(obj => canvas.remove(obj));
        canvas.backgroundColor = '#1f2937';
        
        if (elements.length === 0) {
            canvas.renderAll();
            canvas.selection = true;
            isRenderingRef.current = false;
            return;
        }

        const renderElements = async () => {
            try {
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
            } finally {
                // Re-enable selection and mark rendering as complete
                canvas.selection = true;
                isRenderingRef.current = false;
            }
        };

        renderElements();
        // We use elementsKey instead of elements to avoid re-rendering when array reference changes but content is the same
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elementsKey]);

    const [width, height] = format.split('x').map(Number);

    return (
        <div ref={canvasContainerRef} style={{ maxWidth: '100%', maxHeight: '100%', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {showGrid && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px',
                        zIndex: 1,
                    }}
                />
            )}
            <div style={{ width: width * scale, height: height * scale, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                    <canvas ref={canvasRef} width={width} height={height} />
                </div>
            </div>
        </div>
    );
};

export default CanvasEditor;
