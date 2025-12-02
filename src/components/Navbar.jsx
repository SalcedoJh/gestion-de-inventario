import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Cart from './Cart';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { toggleCart, itemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Detectar scroll para añadir sombra
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevenir scroll cuando el menú móvil está abierto
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }, [logout, navigate]);

    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen(prev => !prev);
    }, []);

    const handleLogoutAndClose = useCallback(async () => {
        closeMobileMenu();
        await handleLogout();
    }, [closeMobileMenu, handleLogout]);

    // Cerrar menú con tecla Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && mobileMenuOpen) {
                closeMobileMenu();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [mobileMenuOpen, closeMobileMenu]);

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="navbar-content">
                        <Link
                            to="/"
                            className="navbar-brand"
                            aria-label="Ir a la página principal"
                        >
                            <span className="brand-icon" aria-hidden="true">📦</span>
                            <span className="brand-text">Almacén</span>
                        </Link>

                        <button
                            className={`hamburger-btn ${mobileMenuOpen ? 'active' : ''}`}
                            onClick={toggleMobileMenu}
                            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="navbar-menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        <div
                            id="navbar-menu"
                            className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}
                            role="navigation"
                        >
                            <Link
                                to="/"
                                className="nav-link"
                                aria-current={location.pathname === '/' ? 'page' : undefined}
                            >
                                Productos
                            </Link>
                            <Link
                                to="/orders"
                                className="nav-link"
                                aria-current={location.pathname === '/orders' ? 'page' : undefined}
                            >
                                Mis Pedidos
                            </Link>
                            {isAdmin && (
                                <>
                                    <Link
                                        to="/admin"
                                        className="nav-link"
                                        aria-current={location.pathname === '/admin' ? 'page' : undefined}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/admin/products"
                                        className="nav-link"
                                        aria-current={location.pathname === '/admin/products' ? 'page' : undefined}
                                    >
                                        Gestión de Productos
                                    </Link>
                                    <Link
                                        to="/admin/users"
                                        className="nav-link"
                                        aria-current={location.pathname === '/admin/users' ? 'page' : undefined}
                                    >
                                        Gestión de Usuarios
                                    </Link>
                                </>
                            )}
                            <button
                                className="nav-link mobile-only"
                                onClick={handleLogoutAndClose}
                                aria-label="Cerrar sesión"
                            >
                                Salir
                            </button>
                        </div>

                        <div className="navbar-actions">
                            <button
                                className="cart-btn"
                                onClick={toggleCart}
                                aria-label={`Carrito de compras${itemCount > 0 ? `, ${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}` : ', vacío'}`}
                            >
                                <span className="cart-icon" aria-hidden="true">🛒</span>
                                {itemCount > 0 && (
                                    <span className="cart-badge" aria-label={`${itemCount} artículos`}>
                                        {itemCount}
                                    </span>
                                )}
                            </button>

                            <div className="user-menu">
                                <span className="user-name">{user?.nombre}</span>
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={handleLogout}
                                    aria-label="Cerrar sesión"
                                >
                                    Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div
                    className="mobile-menu-overlay active"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            <Cart />
        </>
    );
};

export default Navbar;
