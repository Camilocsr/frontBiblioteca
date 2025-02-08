import React, { useState } from 'react';
import { env } from '../../config/envConfig';
import Libro from '../../types';

interface EditLibroFormProps {
    libro: Libro;
    onClose: () => void;
    onSuccess: () => void;
}

const EditLibroForm: React.FC<EditLibroFormProps> = ({ libro, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // Manejar cambios en campos anidados
        const updateNestedState = (prevState: any) => {
            const keys = name.split('.');
            if (keys.length > 1) {
                const [parent, child] = keys;
                return {
                    ...prevState,
                    [parent]: {
                        ...prevState[parent],
                        [child]: type === 'number' ? Number(value) : value
                    }
                };
            }
            return {
                ...prevState,
                [name]: type === 'number' ? Number(value) : value
            };
        };

        setFormData(updateNestedState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            // Validar campos requeridos
            const requiredFields = [
                'titulo', 'autor', 'isbn', 'editorial', 'añoPublicacion',
                'idioma', 'ubicacion.seccion', 'ubicacion.estante',
                'ubicacion.nivel', 'inventario.total', 'precio.compra',
                'precio.alquiler.diario', 'precio.alquiler.deposito'
            ];
    
            const missingFields = requiredFields.filter(field => {
                const value = field.split('.').reduce((obj, key) => obj[key], formData);
                return value === undefined || value === null || value === '';
            });
    
            if (missingFields.length > 0) {
                throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
            }
    
            // Preparar datos para envío
            const submissionData = {
                titulo: formData.titulo,
                autor: formData.autor,
                isbn: formData.isbn,
                editorial: formData.editorial,
                añoPublicacion: formData.añoPublicacion,
                idioma: formData.idioma,
                descripcion: formData.descripcion || '',
                ubicacion: {
                    seccion: formData.ubicacion.seccion,
                    estante: formData.ubicacion.estante,
                    nivel: formData.ubicacion.nivel
                },
                inventario: {
                    total: formData.inventario.total,
                    disponible: formData.inventario.total,
                    prestados: 0,
                    reservados: 0
                },
                precio: {
                    compra: formData.precio.compra,
                    alquiler: {
                        diario: formData.precio.alquiler.diario,
                        deposito: formData.precio.alquiler.deposito
                    }
                },
                estado: {
                    activo: formData.estado.activo,
                    condicion: formData.estado.condicion
                },
                generos: formData.generos.filter(Boolean),
                palabrasClave: formData.palabrasClave.filter(Boolean)
            };
    
            // Convertir a JSON
            const jsonData = JSON.stringify(submissionData);
    
            console.log('Datos a enviar:', jsonData);
    
            // Preparar FormData
            const formDataToSend = new FormData();
            formDataToSend.append('datos', jsonData);
    
            // Agregar portada si existe
            if (portada) {
                formDataToSend.append('portada', portada);
            }
    
            // Verificar token de autenticación
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
    
            // Realizar la solicitud de actualización
            const response = await fetch(`${env.server.endpointGeneral}/libros/${libro._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });
    
            // Manejo detallado de la respuesta
            const responseText = await response.text();
            console.log('Respuesta del servidor:', responseText);
    
            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { mensaje: responseText };
                }
                
                console.error('Error en la respuesta:', errorData);
                throw new Error(errorData.mensaje || 'Error al actualizar el libro');
            }
    
            // Parsear respuesta exitosa
            try {
                const responseData = JSON.parse(responseText);
                console.log('Libro actualizado:', responseData);
            } catch (parseError) {
                console.error('Error al parsear respuesta:', parseError);
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
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLibroForm;