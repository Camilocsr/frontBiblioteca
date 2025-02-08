import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { env } from '../../config/envConfig';
import '../../css/users/ReturnBook.css';

interface Prestamo {
    _id: string;
    libro: {
        _id: string;
        titulo: string;
        autor: string;
        isbn: string;
        editorial: string;
        añoPublicacion: number;
        portada?: string;
    };
    fechas: {
        prestamo: string;
        vencimiento: string;
    };
    estado: 'activo' | 'atrasado';
}

const ReturnBooks = () => {
    const { user } = useAuth();
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrestamos = async () => {
        if (!user?.email) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No se encontró el token de autenticación');
            }

            const response = await fetch(
                `${env.server.endpointGeneral}/prestamos/usuario/${user.email}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || 'Error al obtener préstamos');
            }

            const data = await response.json();
            const prestamosActivos = data.filter((p: Prestamo) => 
                p.estado === 'activo' || p.estado === 'atrasado'
            );
            setPrestamos(prestamosActivos);
        } catch (error) {
            console.error('Error fetching prestamos:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
            setPrestamos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.email) {
            setLoading(true);
            fetchPrestamos();
        }
    }, [user?.email]);

    if (loading) {
        return <div className="return-loading">Cargando préstamos...</div>;
    }

    if (error) {
        return (
            <div className="return-books-error">
                <p>{error}</p>
                <button 
                    className="return-book-button"
                    onClick={() => {
                        setError(null);
                        fetchPrestamos();
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="return-books-container">
            <h2 className="return-books-title">Mis Préstamos Activos</h2>

            {prestamos.length === 0 ? (
                <p className="return-books-empty">No tienes préstamos activos</p>
            ) : (
                <div className="return-books-grid">
                    {prestamos.map((prestamo) => (
                        <div key={prestamo._id} className="return-book-card">
                            {prestamo.libro.portada && (
                                <img 
                                    src={prestamo.libro.portada} 
                                    alt={prestamo.libro.titulo}
                                    className="return-book-image"
                                />
                            )}
                            <h3 className="return-book-title">{prestamo.libro.titulo}</h3>
                            <div className="return-book-info">
                                <strong>Autor:</strong> {prestamo.libro.autor}
                            </div>
                            <div className="return-book-info">
                                <strong>ISBN:</strong> {prestamo.libro.isbn}
                            </div>
                            <div className="return-book-info">
                                <strong>Editorial:</strong> {prestamo.libro.editorial}
                            </div>
                            <div className="return-book-info">
                                <strong>Fecha préstamo:</strong>{' '}
                                {new Date(prestamo.fechas.prestamo).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReturnBooks;