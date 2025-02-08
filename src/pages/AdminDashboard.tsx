import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/admin/AdminDashboard.css';
import { env } from '../config/envConfig';
import CreateLibroForm from '../components/admin/CreateLibroForm';
import ConfirmDeleteModal from '../components/admin/ConfirmDeleteModal';
import EditLibroForm from '../components/admin/EditLibro';
import { Libro } from '../types/index';

interface LibroStats {
    total: number;
    disponibles: number;
    prestados: number;
    reservados: number;
}

interface PaginationData {
    libros: Libro[];
    total: number;
    paginas: number;
    paginaActual: number;
    porPagina: number;
}

const AdminDashboard: React.FC = () => {
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
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedLibro, setSelectedLibro] = useState<Libro | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${env.server.endpointGeneral}/libros/paginacion?pagina=${currentPage}&limite=${itemsPorPagina}&ordenarPor=${ordenarPor}&orden=${orden}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
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
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${env.server.endpointGeneral}/libros/buscar?termino=${searchTerm}&pagina=${currentPage}&limite=${itemsPorPagina}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
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

    const handleEditLibro = (libro: Libro) => {
        setSelectedLibro(libro);
        setShowEditForm(true);
    };

    const handleDeleteLibro = (libro: Libro) => {
        setSelectedLibro(libro);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteLibro = async () => {
        if (!selectedLibro) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${env.server.endpointGeneral}/libros/${selectedLibro._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mensaje || 'Error al eliminar el libro');
            }

            fetchLibros();
            setShowDeleteConfirm(false);
            setSelectedLibro(null);
        } catch (error) {
            console.error('Error al eliminar libro:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
        }
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
                    <button
                        className="lib-add-button"
                        onClick={() => setShowCreateForm(true)}
                    >
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
                                        <button
                                            className="lib-edit-btn"
                                            onClick={() => handleEditLibro(libro)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="lib-delete-btn"
                                            onClick={() => handleDeleteLibro(libro)}
                                        >
                                            Eliminar
                                        </button>
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

            {showCreateForm && (
                <CreateLibroForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        fetchLibros();
                        setShowCreateForm(false);
                    }}
                />
            )}

            {showEditForm && selectedLibro && (
                <EditLibroForm
                    libro={selectedLibro}
                    onClose={() => {
                        setShowEditForm(false);
                        setSelectedLibro(null);
                    }}
                    onSuccess={() => {
                        fetchLibros();
                        setShowEditForm(false);
                        setSelectedLibro(null);
                    }}
                />
            )}

            {showDeleteConfirm && (
                <ConfirmDeleteModal
                    itemName={selectedLibro?.titulo || 'este libro'}
                    onConfirm={confirmDeleteLibro}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                        setSelectedLibro(null);
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;