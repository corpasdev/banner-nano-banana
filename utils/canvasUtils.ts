// FIX: Changed fabric import to fix module resolution and type errors.
import * as fabric from 'fabric';
import { BannerElement } from '../types';

// Extend fabric's Object class to hold our custom data
declare module 'fabric' {
    namespace fabric {
        interface Object {
            elementData?: BannerElement;
        }
    }
}

// FIX: Refactored to use async/await with promise-based fromURL, which is the modern fabric.js API.
export const loadImageFromUrl = async (canvas: fabric.Canvas, element: BannerElement): Promise<void> => {
    if (!element.src) {
        throw new Error('Image element has no src');
    }
    const img = await fabric.Image.fromURL(element.src, { crossOrigin: 'anonymous' });

    if (!img) {
        throw new Error(`Failed to load image from URL: ${element.src}`);
    }
    const [width, height] = Array.isArray(element.tam) ? element.tam : [200, 200];
    const [left, top] = element.pos || [0, 0];

    img.set({
        left: left,
        top: top,
        width: width,
        height: height,
        scaleX: 1,
        scaleY: 1,
        originX: 'left',
        originY: 'top',
        crossOrigin: 'anonymous',
        objectCaching: false,
    });
    // FIX: Cast to fabric.Object to correctly assign custom property, resolving module augmentation issue.
    (img as fabric.Object).elementData = element;

    if(element.zona === 'fondo'){
        canvas.add(img);
        // FIX: Use the sendToBack method on the object itself, as canvas.sendToBack is not found in the type definitions.
        // Cast to fabric.Object to resolve type error for sendToBack method.
        (img as fabric.Object).sendToBack();
    } else {
         canvas.add(img);
    }
    
    canvas.renderAll();
};

export const addTextToCanvas = (canvas: fabric.Canvas, element: BannerElement) => {
    const [left, top] = element.pos || [100, 100];
    const text = new fabric.Textbox(element.contenido || 'Sample Text', {
        left: left,
        top: top,
        fontSize: typeof element.tam === 'number' ? element.tam : 48,
        fill: element.color || '#FFFFFF',
        fontFamily: element.font || 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        width: 500, // Default width, will auto-adjust
        objectCaching: false,
    });
    // FIX: Cast to fabric.Object to correctly assign custom property, resolving module augmentation issue for Textbox.
    (text as fabric.Object).elementData = element;
    canvas.add(text);
};


export const updateCanvasObject = (obj: fabric.Object, property: string, value: any, canvas: fabric.Canvas) => {
    obj.set(property as keyof fabric.Object, value);
    canvas.renderAll();
};

// FIX: Refactored to be async and use await for the promise-based setSrc method, correcting the argument count.
export const replaceImageOnCanvas = async (imageObject: fabric.Image, newSrc: string, canvas: fabric.Canvas) => {
    await imageObject.setSrc(newSrc, { crossOrigin: 'anonymous' });
    canvas.renderAll();
};
