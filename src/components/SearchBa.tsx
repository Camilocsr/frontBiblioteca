import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Home/SearchBar.css';
import { env } from '../config/envConfig';

interface Libro {
    _id: string;
    titulo: string;
    autor: string;
    editorial: string;
    añoPublicacion: number;
    generos: string[];
    idioma: string;
    descripcion: string;
    inventario: {
        disponible: number;
    };
    estado: {
        condicion: string;
    };
}

export default function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Libro[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchBooks = async () => {
            if (!searchTerm.trim()) {
                setSearchResults([]);
                setShowResults(false);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(`${env.server.endpointGeneral}/libros/buscar`, {
                    params: {
                        termino: searchTerm,
                    }
                });

                setSearchResults(response.data.libros);
                setShowResults(true);
            } catch (error) {
                console.error('Error en la búsqueda:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            searchBooks();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const searchContainer = document.querySelector('.search-bar-container');
            if (searchContainer && !searchContainer.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="search-bar-container">
            <div className="search-icon">
                <Search size={24} />
            </div>
            <input
                type="text"
                placeholder="Buscar libros..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.trim()) {
                        setShowResults(true);
                    }
                }}
                onFocus={() => {
                    if (searchTerm.trim()) {
                        setShowResults(true);
                    }
                }}
            />

            {showResults && (
                <div className="search-results">
                    {loading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <span>Buscando...</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((book) => (
                            <div key={book._id} className="search-result-item">
                                <div className="search-result-main">
                                    <h3 className="search-result-title">{book.titulo}</h3>
                                    <p className="search-result-author">{book.autor}</p>
                                </div>
                                <div className="search-result-details">
                                    <span className="search-result-year">{book.añoPublicacion}</span>
                                    <span className="search-result-genre">{book.generos.join(', ')}</span>
                                    <span className="search-result-editorial">{book.editorial}</span>
                                    <span className={`search-result-available ${book.inventario.disponible > 0 ? '' : 'not-available'}`}>
                                        {book.inventario.disponible > 0 ? 'Disponible' : 'No disponible'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            No se encontraron resultados para "{searchTerm}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}