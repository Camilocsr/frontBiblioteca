import React, { useState } from 'react';
import { env } from '../../config/envConfig';

interface Ubicacion {
    seccion: string;
    estante: string;
    nivel: number;
}

interface Inventario {
    total: number;
    disponible: number;
    prestados: number;
    reservados: number;
}

interface PrecioAlquiler {
    diario: number;
    deposito: number;
}

interface Precio {
    compra: number;
    alquiler: PrecioAlquiler;
}

interface Estado {
    activo: boolean;
    condicion: 'nuevo' | 'bueno' | 'regular' | 'malo';
}

interface Libro {
    _id?: string;
    titulo: string;
    autor: string;
    isbn: string;
    editorial: string;
    añoPublicacion: number;
    idioma: string;
    descripcion: string;
    ubicacion: Ubicacion;
    inventario: Inventario;
    precio: Precio;
    estado: Estado;
    generos: string[];
    palabrasClave: string[];
}

type FormData = Omit<Libro, '_id'>;

interface EditLibroFormProps {
    libro: Libro;
    onClose: () => void;
    onSuccess: () => void;
}

type Primitive = string | number | boolean | undefined | null;

type PathImpl<T, Key extends keyof T> =
    Key extends string
    ? T[Key] extends Primitive
    ? Key
    : T[Key] extends Array<unknown>
    ? Key
    : T[Key] extends Record<string, unknown>
    ? `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof Array<unknown>>> & string}` | Key
    : Key
    : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;

const getNestedValue = (obj: FormData, path: Path<FormData>): unknown => {
    const keys = path.split('.');
    return keys.reduce<unknown>((acc: unknown, key: string) => {
        if (acc && typeof acc === 'object' && acc !== null && key in acc) {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
};

const EditLibroForm: React.FC<EditLibroFormProps> = ({ libro, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        titulo: libro.titulo,
        autor: libro.autor,
        isbn: libro.isbn,
        editorial: libro.editorial,
        añoPublicacion: libro.añoPublicacion,
        idioma: libro.idioma,
        descripcion: libro.descripcion || '',
        ubicacion: {
            seccion: libro.ubicacion.seccion,
            estante: libro.ubicacion.estante,
            nivel: libro.ubicacion.nivel
        },
        inventario: {
            total: libro.inventario.total,
            disponible: libro.inventario.total,
            prestados: 0,
            reservados: 0
        },
        precio: {
            compra: libro.precio.compra,
            alquiler: {
                diario: libro.precio.alquiler.diario,
                deposito: libro.precio.alquiler.deposito
            }
        },
        estado: {
            activo: libro.estado.activo,
            condicion: libro.estado.condicion
        },
        generos: libro.generos || [''],
        palabrasClave: libro.palabrasClave || ['']
    });
    const [portada, setPortada] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ): void => {
        const { name, value, type } = e.target;

        setFormData(prevState => {
            const newState = { ...prevState };
            const keys = name.split('.');

            let current: Record<string, unknown> = newState;
            const lastKey = keys[keys.length - 1];

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] as Record<string, unknown>;
            }

            current[lastKey] = type === 'number' ? Number(value) : value;
            return newState as FormData;
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const requiredFields = [
                'titulo',
                'autor',
                'isbn',
                'editorial',
                'añoPublicacion',
                'idioma',
                'ubicacion.seccion',
                'ubicacion.estante',
                'ubicacion.nivel',
                'inventario.total',
                'precio.compra',
                'precio.alquiler.diario',
                'precio.alquiler.deposito'
            ] as const;

            const missingFields = requiredFields.filter(field => {
                const value = getNestedValue(formData, field as Path<FormData>);
                return value === undefined || value === null || value === '';
            });

            if (missingFields.length > 0) {
                throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
            }

            const submissionData = {
                ...formData,
                generos: formData.generos.filter(Boolean),
                palabrasClave: formData.palabrasClave.filter(Boolean)
            };

            const jsonData = JSON.stringify(submissionData);
            const formDataToSend = new FormData();
            formDataToSend.append('datos', jsonData);

            if (portada) {
                formDataToSend.append('portada', portada);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${env.server.endpointGeneral}/libros/${libro._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorData: { mensaje?: string };
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { mensaje: responseText };
                }
                throw new Error(errorData.mensaje || 'Error al actualizar el libro');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error en la actualización:', error);
            setError(error instanceof Error ? error.message : 'Error al actualizar el libro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lib-modal-overlay">
            <div className="lib-modal">
                <h2>Editar Libro</h2>
                {error && <div className="lib-error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="lib-form">
                    <div className="lib-form-group">
                        <label htmlFor="titulo">Título *</label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="autor">Autor *</label>
                        <input
                            type="text"
                            id="autor"
                            name="autor"
                            value={formData.autor}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="isbn">ISBN *</label>
                        <input
                            type="text"
                            id="isbn"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="editorial">Editorial *</label>
                        <input
                            type="text"
                            id="editorial"
                            name="editorial"
                            value={formData.editorial}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="añoPublicacion">Año de Publicación *</label>
                        <input
                            type="number"
                            id="añoPublicacion"
                            name="añoPublicacion"
                            value={formData.añoPublicacion}
                            onChange={handleInputChange}
                            required
                            min="1800"
                            max={new Date().getFullYear()}
                        />
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="idioma">Idioma *</label>
                        <select
                            id="idioma"
                            name="idioma"
                            value={formData.idioma}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="Español">Español</option>
                            <option value="Inglés">Inglés</option>
                            <option value="Francés">Francés</option>
                            <option value="Alemán">Alemán</option>
                            <option value="Italiano">Italiano</option>
                            <option value="Portugués">Portugués</option>
                        </select>
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            rows={4}
                        />
                    </div>

                    <div className="lib-form-section">
                        <h3>Ubicación *</h3>
                        <div className="lib-form-group">
                            <label htmlFor="ubicacion.seccion">Sección *</label>
                            <input
                                type="text"
                                id="ubicacion.seccion"
                                name="ubicacion.seccion"
                                value={formData.ubicacion.seccion}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="lib-form-group">
                            <label htmlFor="ubicacion.estante">Estante *</label>
                            <input
                                type="text"
                                id="ubicacion.estante"
                                name="ubicacion.estante"
                                value={formData.ubicacion.estante}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="lib-form-group">
                            <label htmlFor="ubicacion.nivel">Nivel *</label>
                            <input
                                type="number"
                                id="ubicacion.nivel"
                                name="ubicacion.nivel"
                                value={formData.ubicacion.nivel}
                                onChange={handleInputChange}
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="lib-form-section">
                        <h3>Inventario y Precios *</h3>
                        <div className="lib-form-group">
                            <label htmlFor="inventario.total">Total de ejemplares *</label>
                            <input
                                type="number"
                                id="inventario.total"
                                name="inventario.total"
                                value={formData.inventario.total}
                                onChange={handleInputChange}
                                required
                                min="0"
                            />
                        </div>
                        <div className="lib-form-group">
                            <label htmlFor="precio.compra">Precio de compra *</label>
                            <input
                                type="number"
                                id="precio.compra"
                                name="precio.compra"
                                value={formData.precio.compra}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="lib-form-group">
                            <label htmlFor="precio.alquiler.diario">Precio de alquiler diario *</label>
                            <input
                                type="number"
                                id="precio.alquiler.diario"
                                name="precio.alquiler.diario"
                                value={formData.precio.alquiler.diario}
                                onChange={handleInputChange}
                                required
                                min="0.50"
                                step="0.01"
                            />
                        </div>
                        <div className="lib-form-group">
                            <label htmlFor="precio.alquiler.deposito">Depósito de alquiler *</label>
                            <input
                                type="number"
                                id="precio.alquiler.deposito"
                                name="precio.alquiler.deposito"
                                value={formData.precio.alquiler.deposito}
                                onChange={handleInputChange}
                                required
                                min="10.00"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="generos">Géneros (separados por coma)</label>
                        <input
                            type="text"
                            id="generos"
                            name="generos"
                            value={formData.generos.join(', ')}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    generos: e.target.value.split(',').map(g => g.trim())
                                }));
                            }}
                        />
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="palabrasClave">Palabras Clave (separadas por coma)</label>
                        <input
                            type="text"
                            id="palabrasClave"
                            name="palabrasClave"
                            value={formData.palabrasClave.join(', ')}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    palabrasClave: e.target.value.split(',').map(p => p.trim())
                                }));
                            }}
                        />
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="estado.condicion">Condición *</label>
                        <select
                            id="estado.condicion"
                            name="estado.condicion"
                            value={formData.estado.condicion}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="nuevo">Nuevo</option>
                            <option value="bueno">Bueno</option>
                            <option value="regular">Regular</option>
                            <option value="malo">Malo</option>
                        </select>
                    </div>

                    <div className="lib-form-group">
                        <label htmlFor="portada">Portada</label>
                        <input
                            type="file"
                            id="portada"
                            name="portada"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const files = e.target.files;
                                if (files && files[0]) {
                                    setPortada(files[0]);
                                }
                            }}
                            accept="image/*"
                        />
                    </div>

                    <div className="lib-form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="lib-button-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="lib-button-primary"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLibroForm;