import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Menu() {
    const { user } = useAuth();

    return (
        <div className="space-x-4">
            {!user ? (
                <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                </Link>
            ) : (
                <Link
                    to="/dashboard"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                    Ir al Dashboard
                </Link>
            )}
        </div>
    );
}