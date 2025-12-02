import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Products from './pages/Products';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import UserManagement from './pages/UserManagement';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <Navbar />
                                    <Routes>
                                        <Route path="/" element={<Products />} />
                                        <Route path="/orders" element={<OrderHistory />} />
                                        <Route path="/admin" element={<AdminDashboard />} />
                                        <Route path="/admin/products" element={<ProductManagement />} />
                                        <Route path="/admin/users" element={<UserManagement />} />
                                    </Routes>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
