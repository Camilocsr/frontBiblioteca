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
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="lib-loading">
                <div className="lib-spinner"></div>
                <p>Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="lib-main">
            <header className="lib-header">
                <div className="lib-header-wrap">
                    <h1>Panel de Administración</h1>
                    <div className="lib-user-info">
                        <span className="lib-user-name">{user?.nombre} {user?.apellido}</span>
                        <span className="lib-user-role">Administrador</span>
                    </div>
                </div>
            </header>

            <div className="lib-stats-grid">
                <div className="lib-stat-box">
                    <h3>Total Libros</h3>
                    <p className="lib-stat-number">{totalLibros}</p>
                </div>
                <div className="lib-stat-box">
                    <h3>Disponibles</h3>
                    <p className="lib-stat-number">{stats.disponibles}</p>
                </div>
                <div className="lib-stat-box">
                    <h3>Prestados</h3>
                    <p className="lib-stat-number">{stats.prestados}</p>
                </div>
                <div className="lib-stat-box">
                    <h3>Reservados</h3>
                    <p className="lib-stat-number">{stats.reservados}</p>
                </div>
            </div>

            <div className="lib-content">
                <div className="lib-toolbar">
                    <form onSubmit={handleSearch} className="lib-search-form">
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
                    <button className="lib-add-button">
                        Agregar Libro
                    </button>
                </div>

                <div className="lib-table-container">
                    <table className="lib-table">
                        <thead>
                            <tr>
                                <th>Portada</th>
                                <th onClick={() => handleSort('titulo')} className="lib-sortable">
                                    Título {ordenarPor === 'titulo' && (orden === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('autor')} className="lib-sortable">
                                    Autor {ordenarPor === 'autor' && (orden === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>ISBN</th>
                                <th onClick={() => handleSort('inventario.disponible')} className="lib-sortable">
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
                                            className="lib-book-cover"
                                        />
                                    </td>
                                    <td>{libro.titulo}</td>
                                    <td>{libro.autor}</td>
                                    <td>{libro.isbn}</td>
                                    <td>{libro.inventario.disponible}</td>
                                    <td>
                                        <span className={`lib-status ${libro.estado.activo ? 'lib-status-active' : 'lib-status-inactive'}`}>
                                            {libro.estado.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="lib-actions">
                                        <button className="lib-edit-btn">Editar</button>
                                        <button className="lib-delete-btn">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="lib-pagination">
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