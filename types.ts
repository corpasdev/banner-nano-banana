
export interface BannerElement {
    tipo: 'imagen' | 'texto' | 'logo';
    zona: 'producto' | 'oferta' | 'marca' | 'fondo' | 'cta';
    src?: string;
    contenido?: string;
    font?: string;
    tam?: number | [number, number];
    color?: string;
    pos?: [number, number];
    id: string; // Add a unique ID for each element
}

export interface Template {
    id: string;
    nombre: string;
    formatos: string[];
    elementos: BannerElement[];
    thumbnail: string;
}

export type CanvasView = 'single' | 'multi';
