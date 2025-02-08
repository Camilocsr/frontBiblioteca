import React, { useState } from 'react';
import { env } from '../../config/envConfig';
import '../../css/admin/fromCreateLibro.css';

interface Ubicacion {
    seccion: string;
    estante: string;
    nivel: number;
}

interface Inventario {
    total: number;
    disponible?: number;
    prestados?: number;
    reservados?: number;
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

interface LibroFormData {
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

interface CreateLibroFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

// Tipo para valores anidados
type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

const CreateLibroForm: React.FC<CreateLibroFormProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<LibroFormData>({
        titulo: '',
        autor: '',
        isbn: '',
        editorial: '',
        añoPublicacion: new Date().getFullYear(),
        idioma: 'Español',
        descripcion: '',
        ubicacion: {
            seccion: '',
            estante: '',
            nivel: 1
        },
        inventario: {
            total: 0
        },
        precio: {
            compra: 0,
            alquiler: {
                diario: 0.50,
                deposito: 10.00
            }
        },
        estado: {
            activo: true,
            condicion: 'nuevo'
        },
        generos: [''],
        palabrasClave: ['']
    });
    const [portada, setPortada] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Función auxiliar para verificar si un campo está vacío
    const isEmptyValue = (value: unknown): boolean => {
        return value === undefined || value === null || value === '' ||
            (typeof value === 'number' && isNaN(value));
    };

    const getNestedValue = (
        obj: LibroFormData,
        path: string
    ): unknown => {
        return path.split('.').reduce((current: unknown, key: string) => {
            if (current && typeof current === 'object') {
                return (current as Record<string, unknown>)[key];
            }
            return undefined;
        }, obj as unknown);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        setFormData(prev => {
            const newData = { ...prev };
            const keys = name.split('.');
            let current: Record<string, unknown> = newData;

            // Navegar hasta el penúltimo nivel
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]] as Record<string, unknown>;
            }

            // Establecer el valor en el último nivel
            const finalKey = keys[keys.length - 1];
            current[finalKey] = type === 'number' ? Number(value) : value;

            return newData as LibroFormData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const camposRequeridos: NestedKeyOf<LibroFormData>[] = [
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
            ];

            const camposFaltantes = camposRequeridos.filter(campo => {
                const valor = getNestedValue(formData, campo);
                return isEmptyValue(valor);
            });

            if (camposFaltantes.length > 0) {
                throw new Error(`Campos requeridos faltantes: ${camposFaltantes.join(', ')}`);
            }

            const submissionData = {
                ...formData,
                generos: formData.generos.filter(Boolean),
                palabrasClave: formData.palabrasClave.filter(Boolean),
                inventario: {
                    ...formData.inventario,
                    disponible: formData.inventario.total,
                    prestados: 0,
                    reservados: 0
                }
            };

            const formDataToSend = new FormData();
            formDataToSend.append('datos', JSON.stringify(submissionData));

            if (portada) {
                formDataToSend.append('portada', portada);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const response = await fetch(`${env.server.endpointGeneral}/libros`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            if (!response.ok) {
                const errorData = await response.json() as { mensaje: string };
                throw new Error(errorData.mensaje || 'Error al crear el libro');
            }

            onSuccess();
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error al crear el libro');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="lib-modal-overlay">
            <div className="lib-modal">
                <h2>Agregar Nuevo Libro</h2>
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
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files && files[0]) {
                                    setPortada(files[0]);
                                }
                            }}
                            accept="image/*"
                        />
                    </div>

                    <div className="lib-form-actions">
                        <button type="button" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Libro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLibroForm;