import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/admin/AdminDashboard.css';
import { env } from '../config/envConfig';

interface LibroStats {
    total: number;
    disponibles: number;
    prestados: number;
    reservados: number;
}

interface Libro {
    _id: string;
    titulo: string;
    autor: string;
    isbn: string;
    portada?: string;
    inventario: {
        total: number;
        disponible: number;
        prestados: number;
        reservados: number;
    };
    estado: {
        activo: boolean;
        condicion: string;
    };
}

interface PaginationData {
    libros: Libro[];
    total: number;
    paginas: number;
    paginaActual: number;
    porPagina: number;
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const [libros, setLibros] = useState<Libro[]>([]);
    const [stats, setStats] = useState<LibroStats>({
        total: 0,
        disponibles: 0,
        prestados: 0,
        reservados: 0
    });
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLibros, setTotalLibros] = useState(0);
    const [ordenarPor, setOrdenarPor] = useState('createdAt');
    const [orden, setOrden] = useState<'asc' | 'desc'>('desc');
    const itemsPorPagina = 10;

    useEffect(() => {
        if (searchTerm) {
            handleSearch();
        } else {
            fetchLibros();
        }
    }, [currentPage, ordenarPor, orden]);

    const fetchLibros = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${env.server.endpointGeneral}/libros/paginacion?pagina=${currentPage}&limite=${itemsPorPagina}&ordenarPor=${ordenarPor}&orden=${orden}`
            );
            const data: PaginationData = await response.json();

            setLibros(data.libros);
            setTotalPages(data.paginas);
            setTotalLibros(data.total);

            // Calcular estadísticas solo si estamos en la primera página
            if (currentPage === 1) {
                const statsData = data.libros.reduce((acc: LibroStats, libro: Libro) => ({
                    total: acc.total + libro.inventario.total,
                    disponibles: acc.disponibles + libro.inventario.disponible,
                    prestados: acc.prestados + libro.inventario.prestados,
                    reservados: acc.reservados + libro.inventario.reservados
                }), { total: 0, disponibles: 0, prestados: 0, reservados: 0 });

                setStats(statsData);
            }
        } catch (error) {
            console.error('Error al obtener libros:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!searchTerm.trim()) {
            fetchLibros();
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/libros/buscar?termino=${searchTerm}&pagina=${currentPage}&limite=${itemsPorPagina}`);
            const data = await response.json();

            setLibros(data.libros);
            setTotalLibros(data.resultados);
            setTotalPages(Math.ceil(data.resultados / itemsPorPagina));
        } catch (error) {
            console.error('Error en la búsqueda:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (campo: string) => {
        setOrdenarPor(campo);
        setOrden(orden === 'asc' ? 'desc' : 'asc');
        setCurrentPage(1); // Resetear a primera página al cambiar ordenamiento
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>Panel de Administración</h1>
                    <div className="admin-info">
                        <span className="admin-name">{user?.nombre} {user?.apellido}</span>
                        <span className="admin-role">Administrador</span>
                    </div>
                </div>
            </header>

            <div className="stats-container">
                <div className="stat-card">
                    <h3>Total Libros</h3>
                    <p className="stat-number">{totalLibros}</p>
                </div>
                <div className="stat-card">
                    <h3>Disponibles</h3>
                    <p className="stat-number">{stats.disponibles}</p>
                </div>
                <div className="stat-card">
                    <h3>Prestados</h3>
                    <p className="stat-number">{stats.prestados}</p>
                </div>
                <div className="stat-card">
                    <h3>Reservados</h3>
                    <p className="stat-number">{stats.reservados}</p>
                </div>
            </div>

            <div className="main-content">
                <div className="actions-bar">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Buscar libros..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (!e.target.value) {
                                    setCurrentPage(1);
                                    fetchLibros();
                                }
                            }}
                        />
                        <button type="submit">Buscar</button>
                    </form>
                    <button
                        className="add-button"
                        // onClick={() => setModalOpen(true)}
                    >
                        Agregar Libro
                    </button>
                </div>

                <div className="books-table-container">
                    <table className="books-table">
                        <thead>
                            <tr>
                                <th>Portada</th>
                                <th onClick={() => handleSort('titulo')} className="sortable">
                                    Título {ordenarPor === 'titulo' && (orden === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('autor')} className="sortable">
                                    Autor {ordenarPor === 'autor' && (orden === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>ISBN</th>
                                <th onClick={() => handleSort('inventario.disponible')} className="sortable">
                                    Disponibles {ordenarPor === 'inventario.disponible' && (orden === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {libros.map((libro) => (
                                <tr key={libro._id}>
                                    <td>
                                        <img
                                            src={libro.portada || '/placeholder-book.png'}
                                            alt={libro.titulo}
                                            className="book-cover"
                                        />
                                    </td>
                                    <td>{libro.titulo}</td>
                                    <td>{libro.autor}</td>
                                    <td>{libro.isbn}</td>
                                    <td>{libro.inventario.disponible}</td>
                                    <td>
                                        <span className={`status ${libro.estado.activo ? 'active' : 'inactive'}`}>
                                            {libro.estado.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="edit-btn">Editar</button>
                                        <button className="delete-btn">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;