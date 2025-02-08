import { useEffect, useState } from 'react';
import { BookOpen, Star, Heart } from 'lucide-react';
import '../../css/Home/BookGrid.css';
import axios from 'axios';
import { env } from '../../config/envConfig';

interface Book {
  _id: string;
  titulo: string;
  autor: string;
  generos: string[];
  portada: string;
  descripcion: string;
  estado: { activo: boolean };
  precio: { alquiler: { diario: number } };
  editorial: string;
  añoPublicacion: number;
}

const BookGrid = () => {
  const [books, setBooks] = useState<Book[]>([]); // <-- Tipar el estado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get<{ libros: Book[]; paginas: number }>(
          `${env.server.endpointGeneral}/libros/paginacion`,
          { params: { pagina: page, limite: limit } }
        );

        setBooks(response.data.libros || []);
        setTotalPages(response.data.paginas || 1);
        setLoading(false);
      } catch {
        setError('Error al cargar los libros');
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="books-container">
      <p>Tu espacio para explorar, leer y aprender</p>
      <div className="books-grid">
        {books.map((book) => (
          <div key={book._id} className="book-card">
            <div className="book-cover-container">
              <img src={book.portada} alt={book.titulo} className="book-cover" />
              <div className="book-overlay">
                <p className="book-description">{book.descripcion}</p>
              </div>
              <Heart className={`favorite-icon ${book.estado.activo ? 'is-favorite' : ''}`} size={24} />
            </div>
            <div className="book-info">
              <div className="book-header">
                <span className="book-genre">{book.generos.join(', ')}</span>
                <div className="book-rating">
                  <Star className="star-icon" size={16} />
                  <span>{book.precio.alquiler.diario || 'N/A'}</span>
                </div>
              </div>
              <h2 className="book-title">{book.titulo}</h2>
              <div className="book-author">
                <BookOpen size={16} />
                <span>{book.autor}</span>
              </div>
              <div className="book-details">
                <span className="book-editorial">Editorial: {book.editorial}</span>
                <span className="book-year">{book.añoPublicacion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default BookGrid;