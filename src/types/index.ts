export interface Ubicacion {
    seccion: string;
    estante: string;
    nivel: number;
}

export interface Inventario {
    total: number;
    disponible: number;
    prestados: number;
    reservados: number;
}

export interface PrecioAlquiler {
    diario: number;
    deposito: number;
}

export interface Precio {
    compra: number;
    alquiler: PrecioAlquiler;
}

export interface Estado {
    activo: boolean;
    condicion: 'nuevo' | 'bueno' | 'regular' | 'malo';
}

export interface Libro {
    _id?: string;
    titulo: string;
    autor: string;
    isbn: string;
    editorial: string;
    añoPublicacion: number;
    idioma: string;
    descripcion: string;
    portada?: string;
    ubicacion: Ubicacion;
    inventario: Inventario;
    precio: Precio;
    estado: Estado;
    generos: string[];
    palabrasClave: string[];
}