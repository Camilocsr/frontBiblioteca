interface Libro {
    _id: string;
    titulo: string;
    autor: string;
    isbn: string;
    editorial: string;
    añoPublicacion: number;
    idioma: string;
    descripcion?: string;
    ubicacion: {
        seccion: string;
        estante: string;
        nivel: number;
    };
    inventario: {
        total: number;
        disponible: number;
        prestados: number;
        reservados: number;
    };
    precio: {
        compra: number;
        alquiler: {
            diario: number;
            deposito: number;
        };
    };
    estado: {
        activo: boolean;
        condicion: 'nuevo' | 'bueno' | 'regular' | 'malo';
    };
    generos?: string[];
    palabrasClave?: string[];
    portada?: string;
}

export default Libro;