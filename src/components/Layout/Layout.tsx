import { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/layaut.css'
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../Footer';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="layout-container">
            <div className="bg-overlay" />

            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-content">
                    <Link to="/" className="nav-brand">
                        Biblioteca Virtual
                    </Link>

                    <div className="nav-links">
                        <Link to="/" className="nav-link">
                            Inicio
                        </Link>

                        {user && (
                            <>
                                <Link to="/dashboard" className="nav-link">
                                    Dashboard
                                </Link>

                                {isAdmin && (
                                    <Link to="/admin" className="nav-link">
                                        Admin
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="btn btn-logout hover-lift"
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        )}

                        {!user && (
                            <Link to="/login" className="btn btn-login hover-lift">
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="main-content">
                {children}
            </main>

            <Footer />

        </div>
    );
};

export default Layout;