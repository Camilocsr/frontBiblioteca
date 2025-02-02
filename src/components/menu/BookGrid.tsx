import React, { useEffect, useState } from 'react';
import { BookOpen, Star, Heart } from 'lucide-react';
import '../../css/Home/BookGrid.css';
import axios from 'axios';
import { env } from '../../config/envConfig';

// Definir la interfaz para un libro
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

interface Precio {
  alquiler: {
    diario: number;
    deposito: number;
  };
  compra: number;
}

interface Estado {
  activo: boolean;
  condicion: string;
}

interface Libro {
  _id: string;
  isbn: string;
  titulo: string;
  autor: string;
  editorial: string;
  añoPublicacion: number;
  generos: string[];
  idioma: string;
  descripcion: string;
  portada: string;
  palabrasClave: string[];
  createdAt: string;
  updatedAt: string;
  ubicacion: Ubicacion;
  inventario: Inventario;
  precio: Precio;
  estado: Estado;
}

// Tipar el estado del componente
const BookGrid: React.FC = () => {
  const [books, setBooks] = useState<Libro[]>([]); // Aquí tipamos el estado `books` como un arreglo de `Libro`
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${env.server.endpointGeneral}/libros`);
        setBooks(response.data.libros);
        setLoading(false);
      } catch {
        setError('Error al cargar los libros');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []); // El arreglo vacío asegura que se ejecute solo una vez al cargar el componente

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
              <Heart
                className={`favorite-icon ${book.estado.activo ? 'is-favorite' : ''}`}
                size={24}
              />
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
                <span className="book-editorial">editorial: {book.editorial}</span>
                <span className="book-year">{book.añoPublicacion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookGrid;