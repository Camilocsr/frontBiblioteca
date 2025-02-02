import '../css/Foter.css'

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p className="footer-text">
                    © {new Date().getFullYear()} Biblioteca Virtual - Todos los derechos reservados
                </p>
                <div className="footer-creators">
                    <strong>Camilo Solano Rodriguez</strong> • 
                    <strong> Javier Moreno</strong> • 
                    <strong> Holgin</strong>
                </div>
            </div>
        </footer>
    );
};