// src/pages/AdminDashboard.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface User {
    id: string;
    nombre: string;
    email: string;
    estado: {
        activo: boolean;
        vetado: boolean;
    };
    fechaRegistro: string;
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'usuarios' | 'libros' | 'prestamos'>('usuarios');

    // Datos de prueba
    const mockUsers: User[] = [
        {
            id: '1',
            nombre: 'Juan Pérez',
            email: 'juan@example.com',
            estado: { activo: true, vetado: false },
            fechaRegistro: '2024-01-15'
        },
        {
            id: '2',
            nombre: 'María López',
            email: 'maria@example.com',
            estado: { activo: true, vetado: true },
            fechaRegistro: '2024-02-01'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'usuarios':
                return (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Gestión de Usuarios</h3>
                                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                    Agregar Usuario
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {mockUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{user.nombre}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${user.estado.vetado ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {user.estado.vetado ? 'Vetado' : 'Activo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button className="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
                                                    <button className="text-red-600 hover:text-red-900">
                                                        {user.estado.vetado ? 'Desvetar' : 'Vetar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'libros':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Gestión de Libros</h3>
                            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                Agregar Libro
                            </button>
                        </div>
                        <p className="text-gray-600">Sección en desarrollo...</p>
                    </div>
                );
            case 'prestamos':
                return (
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Gestión de Préstamos</h3>
                            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                                Nuevo Préstamo
                            </button>
                        </div>
                        <p className="text-gray-600">Sección en desarrollo...</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                    <p className="text-gray-600 mt-1">
                        Administrador: {user?.nombre} {user?.apellido}
                    </p>
                </div>

                {/* Tabs de navegación */}
                <div className="mb-6">
                    <nav className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('usuarios')}
                            className={`px-4 py-2 rounded-md ${activeTab === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab('libros')}
                            className={`px-4 py-2 rounded-md ${activeTab === 'libros' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Libros
                        </button>
                        <button
                            onClick={() => setActiveTab('prestamos')}
                            className={`px-4 py-2 rounded-md ${activeTab === 'prestamos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Préstamos
                        </button>
                    </nav>
                </div>

                {/* Contenido de la tab activa */}
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;