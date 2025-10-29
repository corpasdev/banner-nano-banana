
import { BannerElement } from '../types';

export function adaptarLayout(formato: string, elementos: BannerElement[]): BannerElement[] {
    const [w, h] = formato.split('x').map(Number);

    return elementos.map(el => {
        const newEl = { ...el }; // Create a shallow copy

        // Default scaling factor based on a 1080x1080 reference
        const scale = w / 1080;

        switch (el.zona) {
            case 'fondo':
                newEl.pos = [0, 0];
                newEl.tam = [w, h];
                break;
            case 'producto':
                newEl.pos = [w * 0.5 - (w * 0.4) / 2, h * 0.5 - (h * 0.4) / 2];
                newEl.tam = [w * 0.4, h * 0.4];
                break;
            case 'oferta':
                newEl.pos = [w * 0.5, h * 0.2];
                if (typeof newEl.tam === 'number') {
                   newEl.tam = Math.max(24, 96 * scale);
                }
                break;
            case 'marca':
                newEl.pos = [w * 0.1, h * 0.1];
                newEl.tam = [w * 0.15, h * 0.07];
                break;
            case 'cta':
                 newEl.pos = [w * 0.5, h * 0.85];
                 if (typeof newEl.tam === 'number') {
                    newEl.tam = Math.max(18, 48 * scale);
                 }
                 break;
            default:
                // For elements without a specific zone, apply a general scaling
                if (newEl.pos) {
                    newEl.pos = [newEl.pos[0] * scale, newEl.pos[1] * scale];
                }
                if (newEl.tam && Array.isArray(newEl.tam)) {
                    newEl.tam = [newEl.tam[0] * scale, newEl.tam[1] * scale];
                } else if (typeof newEl.tam === 'number') {
                     newEl.tam = newEl.tam * scale;
                }
                break;
        }
        return newEl;
    });
}
