import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { env } from '../config/envConfig';
import '../css/users/UserDashboard.css'

interface Book {
    _id: string;
    titulo: string;
    autor: string;
    editorial: string;
    añoPublicacion: number;
    isbn: string;
    portada?: string;
    inventario: {
        disponible: number;
        total: number;
    };
    precio: {
        alquiler: {
            diario: number;
            deposito: number;
        };
    };
}

interface PaginationData {
    total: number;
    paginas: number;
    paginaActual: number;
    porPagina: number;
}

interface FilterState {
    titulo: string;
    autor: string;
    genero: string;
    disponible: boolean;
    condicion: string;
    ordenarPor: string;
    orden: 'asc' | 'desc';
}

const UserDashboard = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [paginationData, setPaginationData] = useState<PaginationData>({
        total: 0,
        paginas: 0,
        paginaActual: 1,
        porPagina: 10
    });

    const [filters, setFilters] = useState<FilterState>({
        titulo: '',
        autor: '',
        genero: '',
        disponible: false,
        condicion: '',
        ordenarPor: 'createdAt',
        orden: 'desc'
    });

    const fetchBooks = async (page: number = 1) => {
        try {
            const queryParams = new URLSearchParams({
                pagina: page.toString(),
                limite: paginationData.porPagina.toString(),
                ordenarPor: filters.ordenarPor,
                orden: filters.orden
            });

            if (filters.titulo) queryParams.append('titulo', filters.titulo);
            if (filters.autor) queryParams.append('autor', filters.autor);
            if (filters.genero) queryParams.append('genero', filters.genero);
            if (filters.disponible) queryParams.append('disponible', 'true');
            if (filters.condicion) queryParams.append('condicion', filters.condicion);

            const response = await fetch(
                `${env.server.endpointGeneral}/libros/paginacion?${queryParams.toString()}`
            );
            const data = await response.json();
            setBooks(data.libros);
            setPaginationData({
                total: data.total,
                paginas: data.paginas,
                paginaActual: data.paginaActual,
                porPagina: data.porPagina
            });
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [filters]);

    const handleFilterChange = (name: keyof FilterState, value: string | boolean) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRentBook = async (book: Book) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${env.server.endpointGeneral}/prestamos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    libroId: book._id,
                    email: user?.email, // Enviamos el email en lugar del ID
                    tipo: 'alquiler',
                    diasPrestamo: 14,
                }),
            });

            if (response.ok) {
                alert('Libro rentado exitosamente');
                setShowModal(false);
                fetchBooks(paginationData.paginaActual);
            } else {
                const error = await response.json();
                alert(error.mensaje);
            }
        } catch (error) {
            console.error('Error renting book:', error);
            alert('Error al intentar rentar el libro');
        }
    };

    const Modal = ({ book }: { book: Book }) => (
        <div className="library-modal-overlay">
            <div className="library-modal">
                <h2 className="library-modal-title">Confirmar Alquiler</h2>
                <p className="library-modal-message">¿Deseas alquilar el libro "{book.titulo}"?</p>

                <div className="library-modal-info">
                    <p><strong>Costo diario:</strong> ${book.precio.alquiler.diario}</p>
                    <p><strong>Depósito:</strong> ${book.precio.alquiler.deposito}</p>
                    <p><strong>Duración:</strong> 14 días</p>
                </div>

                <div className="library-modal-actions">
                    <button
                        className="library-page-btn"
                        onClick={() => setShowModal(false)}
                    >
                        Cancelar
                    </button>
                    <button
                        className="library-rent-btn"
                        onClick={() => handleRentBook(book)}
                    >
                        Confirmar Alquiler
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="library-main">
            <div className="library-container">
                <div className="library-welcome">
                    <div className="library-header-wrap">
                        <div>
                            <h1 className="library-welcome-title">
                                Bienvenido, {user?.nombre} {user?.apellido}
                            </h1>
                            <p className="library-welcome-email">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="library-content">
                    <div className="library-filters">
                        <input
                            type="text"
                            placeholder="Buscar por título..."
                            value={filters.titulo}
                            onChange={(e) => handleFilterChange('titulo', e.target.value)}
                            className="library-input"
                        />
                        <input
                            type="text"
                            placeholder="Buscar por autor..."
                            value={filters.autor}
                            onChange={(e) => handleFilterChange('autor', e.target.value)}
                            className="library-input"
                        />
                        <select
                            value={filters.genero}
                            onChange={(e) => handleFilterChange('genero', e.target.value)}
                            className="library-select"
                        >
                            <option value="">Todos los géneros</option>
                            <option value="ficcion">Ficción</option>
                            <option value="no-ficcion">No Ficción</option>
                            <option value="romance">Romance</option>
                            <option value="misterio">Misterio</option>
                            <option value="ciencia-ficcion">Ciencia Ficción</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="library-loading">
                            <span className="sr-only">Cargando...</span>
                        </div>
                    ) : (
                        <>
                            <div className="library-books-grid">
                                {books.map((book) => (
                                    <div key={book._id} className="library-book-item">
                                        <div className="library-book-img-wrap">
                                            {book.portada ? (
                                                <img
                                                    src={book.portada}
                                                    alt={book.titulo}
                                                    className="library-book-img"
                                                />
                                            ) : (
                                                <div className="library-book-placeholder">
                                                    📚
                                                </div>
                                            )}
                                        </div>
                                        <div className="library-book-content">
                                            <h3 className="library-book-title">{book.titulo}</h3>
                                            <p className="library-book-author">{book.autor}</p>
                                            <p className="library-book-info">
                                                <strong>Editorial:</strong> {book.editorial}
                                            </p>
                                            <p className="library-book-info">
                                                <strong>Año:</strong> {book.añoPublicacion}
                                            </p>
                                            <p className="library-book-info">
                                                <strong>ISBN:</strong> {book.isbn}
                                            </p>

                                            <div className="library-status-wrap">
                                                <span className={`library-status ${book.inventario.disponible > 0
                                                    ? 'library-status-available'
                                                    : 'library-status-unavailable'
                                                    }`}>
                                                    {book.inventario.disponible > 0 ? 'Disponible' : 'No disponible'}
                                                </span>
                                                <span className="library-stock">
                                                    {book.inventario.disponible}/{book.inventario.total} disponibles
                                                </span>
                                            </div>

                                            <button
                                                className="library-rent-btn"
                                                disabled={book.inventario.disponible === 0}
                                                onClick={() => {
                                                    setSelectedBook(book);
                                                    setShowModal(true);
                                                }}
                                            >
                                                Alquilar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="library-pagination">
                                <button
                                    onClick={() => fetchBooks(paginationData.paginaActual - 1)}
                                    disabled={paginationData.paginaActual === 1}
                                    className="library-page-btn"
                                >
                                    Anterior
                                </button>
                                <span className="library-page-info">
                                    Página {paginationData.paginaActual} de {paginationData.paginas}
                                </span>
                                <button
                                    onClick={() => fetchBooks(paginationData.paginaActual + 1)}
                                    disabled={paginationData.paginaActual === paginationData.paginas}
                                    className="library-page-btn"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showModal && selectedBook && <Modal book={selectedBook} />}
        </div>
    );
};

export default UserDashboard;