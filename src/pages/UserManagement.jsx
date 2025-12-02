import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import UserFormModal from '../components/UserFormModal';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await userService.getAll();
            setUsers(res.data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleSave = async (userData) => {
        try {
            if (selectedUser) {
                await userService.update(selectedUser.id, userData);
            } else {
                await userService.create(userData);
            }
            await loadUsers();
        } catch (error) {
            throw error;
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            await userService.delete(userId);
            await loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    const getTipoLabel = (tipo) => {
        switch (tipo) {
            case 1: return 'Administrador';
            case 2: return 'Limitado';
            case 3: return 'Completo';
            default: return 'Desconocido';
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="user-management-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1>Gestión de Usuarios</h1>
                        <p className="text-muted">{users.length} usuarios registrados</p>
                    </div>
                    <button className="btn btn-primary" onClick={handleCreate}>
                        + Nuevo Usuario
                    </button>
                </div>

                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Sucursal</th>
                                <th>Permisos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>
                                        <strong>{user.username}</strong>
                                    </td>
                                    <td>{user.nombre}</td>
                                    <td>
                                        <span className={`badge badge-${user.tipo === 1 ? 'primary' : user.tipo === 2 ? 'warning' : 'success'}`}>
                                            {getTipoLabel(user.tipo)}
                                        </span>
                                    </td>
                                    <td>{user.sucursal?.nombre || '-'}</td>
                                    <td>
                                        {user.viewAllCategories ? (
                                            <span className="badge badge-success">Todas</span>
                                        ) : (
                                            <span className="badge badge-secondary">
                                                {user.allowedCategories?.length || 0} categorías
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleEdit(user)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <UserFormModal
                    user={selectedUser}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default UserManagement;
