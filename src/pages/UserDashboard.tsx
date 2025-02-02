// src/pages/UserDashboard.tsx
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header de bienvenida */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Bienvenido, {user?.nombre} {user?.apellido}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {user?.email}
                    </p>
                </div>

                {/* Estadísticas/Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Libros Prestados
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">3</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Reservas Activas
                        </h3>
                        <p className="text-3xl font-bold text-green-600">1</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Multas Pendientes
                        </h3>
                        <p className="text-3xl font-bold text-red-600">$0</p>
                    </div>
                </div>

                {/* Lista de Actividad Reciente */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Actividad Reciente
                        </h2>
                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <p className="text-gray-800">Préstamo: "El Señor de los Anillos"</p>
                                <p className="text-sm text-gray-500">Fecha de devolución: 15/03/2024</p>
                            </div>
                            <div className="border-b pb-4">
                                <p className="text-gray-800">Reserva: "Cien años de soledad"</p>
                                <p className="text-sm text-gray-500">Disponible desde: 10/03/2024</p>
                            </div>
                            <div className="pb-4">
                                <p className="text-gray-800">Devolución: "1984"</p>
                                <p className="text-sm text-gray-500">Devuelto el: 01/03/2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de Cerrar Sesión */}
                <div className="mt-6">
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;