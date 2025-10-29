
// FIX: Changed fabric import to fix module resolution and type errors.
import * as fabric from 'fabric';
import { Template } from '../types';

export const exportCanvasToImage = (canvas: fabric.Canvas, fileName: string) => {
    const dataURL = canvas.toDataURL({
        // FIX: Added multiplier property, which is required by TDataUrlOptions type.
        multiplier: 1,
        format: 'png',
        quality: 1,
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportLayoutToJson = (canvas: fabric.Canvas, template: Template, format: string) => {
    const elements = canvas.getObjects().map(obj => {
        const elData = (obj as any).elementData;
        const newElement = {
            ...elData,
            pos: [obj.left, obj.top],
            tam: [obj.width! * obj.scaleX!, obj.height! * obj.scaleY!]
        };
        if (obj.type === 'textbox') {
            newElement.contenido = (obj as fabric.Textbox).text;
            newElement.color = (obj as fabric.Textbox).fill;
            newElement.tam = (obj as fabric.Textbox).fontSize;
        }
        return newElement;
    });

    const json = {
        id: `${template.id}-custom`,
        nombre: `${template.nombre} (Custom)`,
        formatos: [format],
        elementos: elements
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `${template.id}_${format}_layout.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};