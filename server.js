import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Read database
const readDB = () => {
    const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8');
    return JSON.parse(data);
};

// Write database
const writeDB = (data) => {
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(data, null, 2));
};

// Session storage (in-memory for simplicity)
const sessions = new Map();

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.username === username && u.password === password);

    if (user) {
        const sessionToken = Math.random().toString(36).substring(7);
        sessions.set(sessionToken, {
            userId: user.id,
            tipo: user.tipo,
            sucursalId: user.sucursalId
        });

        res.json({
            success: true,
            token: sessionToken,
            user: {
                id: user.id,
                username: user.username,
                nombre: user.nombre,
                tipo: user.tipo,
                sucursalId: user.sucursalId
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        sessions.delete(token);
    }
    res.json({ success: true });
});

// Middleware to verify authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const session = sessions.get(token);

    if (!session) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    req.user = session;
    next();
};

// Get products (filtered by user tipo)
app.get('/api/products', authenticate, (req, res) => {
    const db = readDB();
    let products = db.productos;

    // Tipo 2 (limited) cannot see cleaning products
    if (req.user.tipo === 2) {
        const cleaningProductIds = db.product_categories
            .filter(pc => pc.categoryId === 4)
            .map(pc => pc.productId);

        products = products.filter(p => !cleaningProductIds.includes(p.id));
    }

    res.json(products);
});

// Get single product
app.get('/api/products/:id', authenticate, (req, res) => {
    const db = readDB();
    const product = db.productos.find(p => p.id === parseInt(req.params.id));

    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
});

// Get categories
app.get('/api/categories', authenticate, (req, res) => {
    const db = readDB();
    let categories = db.categories;

    // Hide cleaning category for tipo 2 users
    if (req.user.tipo === 2) {
        categories = categories.filter(c => c.id !== 4);
    }

    res.json(categories);
});

// Get sucursales
app.get('/api/sucursales', authenticate, (req, res) => {
    const db = readDB();
    res.json(db.sucursales);
});

// Get orders
app.get('/api/orders', authenticate, (req, res) => {
    const db = readDB();
    let orders = db.orders;

    // Non-admin users only see their own orders
    if (req.user.tipo !== 1) {
        orders = orders.filter(o => o.userId === req.user.userId);
    }

    // Add sucursal info to each order
    orders = orders.map(order => {
        const sucursal = db.sucursales.find(s => s.id === order.sucursalId);
        return { ...order, sucursal };
    });

    res.json(orders);
});

// Get single order
app.get('/api/orders/:id', authenticate, (req, res) => {
    const db = readDB();
    const order = db.orders.find(o => o.id === parseInt(req.params.id));

    if (!order) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Check permissions
    if (req.user.tipo !== 1 && order.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Add sucursal info
    const sucursal = db.sucursales.find(s => s.id === order.sucursalId);
    const user = db.users.find(u => u.id === order.userId);

    res.json({ ...order, sucursal, user });
});

// Create order
app.post('/api/orders', authenticate, (req, res) => {
    const db = readDB();
    const { items } = req.body;

    // Calculate total
    let total = 0;
    const itemsWithPrices = items.map(item => {
        const product = db.productos.find(p => p.id === item.productId);
        const precio = product?.precio || 0;
        total += precio * item.cantidad;
        return { ...item, precio };
    });

    const newOrder = {
        id: db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 1,
        userId: req.user.userId,
        sucursalId: req.user.sucursalId,
        items: itemsWithPrices,
        total: parseFloat(total.toFixed(2)),
        fecha: new Date().toISOString(),
        estado: 'pendiente'
    };

    db.orders.push(newOrder);
    writeDB(db);

    res.json({ success: true, order: newOrder });
});

// Admin: Update order status
app.patch('/api/orders/:id/status', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const orderIndex = db.orders.findIndex(o => o.id === parseInt(req.params.id));

    if (orderIndex === -1) {
        return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const { estado } = req.body;
    db.orders[orderIndex].estado = estado;
    writeDB(db);

    res.json({ success: true, order: db.orders[orderIndex] });
});

// Admin: Add product
app.post('/api/products', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const newProduct = {
        id: db.productos.length > 0 ? Math.max(...db.productos.map(p => p.id)) + 1 : 1,
        ...req.body,
        precio: parseFloat(req.body.precio) || 0
    };

    db.productos.push(newProduct);
    writeDB(db);

    res.json({ success: true, product: newProduct });
});

// Admin: Update product
app.put('/api/products/:id', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const productIndex = db.productos.findIndex(p => p.id === parseInt(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    db.productos[productIndex] = {
        ...db.productos[productIndex],
        ...req.body,
        precio: parseFloat(req.body.precio) || db.productos[productIndex].precio || 0
    };
    writeDB(db);

    res.json({ success: true, product: db.productos[productIndex] });
});

// Admin: Delete product
app.delete('/api/products/:id', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    db.productos = db.productos.filter(p => p.id !== parseInt(req.params.id));
    // Also remove from product_categories
    db.product_categories = db.product_categories.filter(pc => pc.productId !== parseInt(req.params.id));
    writeDB(db);

    res.json({ success: true });
});

// Admin: Assign category to product
app.post('/api/products/:id/category', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const { categoryId } = req.body;
    const productId = parseInt(req.params.id);

    // Remove existing category assignment
    db.product_categories = db.product_categories.filter(pc => pc.productId !== productId);

    // Add new assignment
    if (categoryId) {
        db.product_categories.push({ productId, categoryId: parseInt(categoryId) });
    }

    writeDB(db);
    res.json({ success: true });
});

// Admin: Add category
app.post('/api/categories', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const newCategory = {
        id: db.categories.length > 0 ? Math.max(...db.categories.map(c => c.id)) + 1 : 1,
        ...req.body
    };

    db.categories.push(newCategory);
    writeDB(db);

    res.json({ success: true, category: newCategory });
});

// Admin: Update category
app.put('/api/categories/:id', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const categoryIndex = db.categories.findIndex(c => c.id === parseInt(req.params.id));

    if (categoryIndex === -1) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    db.categories[categoryIndex] = { ...db.categories[categoryIndex], ...req.body };
    writeDB(db);

    res.json({ success: true, category: db.categories[categoryIndex] });
});

// Admin: Delete category
app.delete('/api/categories/:id', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    db.categories = db.categories.filter(c => c.id !== parseInt(req.params.id));
    // Also remove product assignments
    db.product_categories = db.product_categories.filter(pc => pc.categoryId !== parseInt(req.params.id));
    writeDB(db);

    res.json({ success: true });
});

// Get analytics (admin only)
app.get('/api/analytics', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const { month, year } = req.query;

    let orders = db.orders;

    // Filter by month/year if provided
    if (month && year) {
        orders = orders.filter(order => {
            const orderDate = new Date(order.fecha);
            return orderDate.getMonth() + 1 === parseInt(month) &&
                orderDate.getFullYear() === parseInt(year);
        });
    }

    // Calculate statistics
    const productCounts = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const key = item.productId;
            productCounts[key] = (productCounts[key] || 0) + item.cantidad;
        });
    });

    const topProducts = Object.entries(productCounts)
        .map(([productId, count]) => {
            const product = db.productos.find(p => p.id === parseInt(productId));
            return {
                productId: parseInt(productId),
                nombre: product?.articulo || 'Desconocido',
                cantidad: count
            };
        })
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

    res.json({
        totalOrders: orders.length,
        topProducts: topProducts,
        ordersByMonth: orders.length
    });
});

// Admin: Get all users
app.get('/api/users', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    // Don't send passwords to frontend
    const users = db.users.map(({ password, ...user }) => user);
    res.json(users);
});

// Admin: Get single user
app.get('/api/users/:id', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const user = db.users.find(u => u.id === parseInt(req.params.id));

    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// Admin: Create user
app.post('/api/users', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const { username, password, nombre, tipo, sucursalId, viewAllCategories, allowedCategories } = req.body;

    // Check if username already exists
    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    const newUser = {
        id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
        username,
        password,
        nombre,
        tipo: parseInt(tipo),
        sucursalId: sucursalId ? parseInt(sucursalId) : null,
        viewAllCategories: viewAllCategories || false,
        allowedCategories: allowedCategories || []
    };

    db.users.push(newUser);
    writeDB(db);

    // Don't send password back
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
});

// Admin: Update user
app.put('/api/users/:id', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === parseInt(req.params.id));

    if (userIndex === -1) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { username, password, nombre, tipo, sucursalId, viewAllCategories, allowedCategories } = req.body;

    // Check if username is taken by another user
    const existingUser = db.users.find(u => u.username === username && u.id !== parseInt(req.params.id));
    if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    // Update user, keep existing password if not provided
    db.users[userIndex] = {
        ...db.users[userIndex],
        username: username || db.users[userIndex].username,
        password: password || db.users[userIndex].password,
        nombre: nombre || db.users[userIndex].nombre,
        tipo: tipo !== undefined ? parseInt(tipo) : db.users[userIndex].tipo,
        sucursalId: sucursalId !== undefined ? (sucursalId ? parseInt(sucursalId) : null) : db.users[userIndex].sucursalId,
        viewAllCategories: viewAllCategories !== undefined ? viewAllCategories : db.users[userIndex].viewAllCategories,
        allowedCategories: allowedCategories !== undefined ? allowedCategories : db.users[userIndex].allowedCategories
    };

    writeDB(db);

    const { password: _, ...userWithoutPassword } = db.users[userIndex];
    res.json({ success: true, user: userWithoutPassword });
});

// Admin: Delete user
app.delete('/api/users/:id', authenticate, (req, res) => {
    if (req.user.tipo !== 1) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const db = readDB();
    const userId = parseInt(req.params.id);

    // Prevent deleting yourself
    if (userId === req.user.userId) {
        return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
    }

    db.users = db.users.filter(u => u.id !== userId);
    writeDB(db);

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
});
