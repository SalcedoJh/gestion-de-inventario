import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Redirect if already logged in
    if (user) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(username, password);
            if (response.success) {
                navigate('/');
            } else {
                setError(response.message || 'Credenciales inválidas');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>Almacén</h1>
                        <p>Sistema de Gestión de Pedidos</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Usuario</label>
                            <input
                                type="text"
                                className="form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingrese su usuario"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingrese su contraseña"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="login-footer">
                     
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
