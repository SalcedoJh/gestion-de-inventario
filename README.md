# Almacén AVANLAB - Sistema de Gestión de Pedidos

Sistema interno de gestión de pedidos desarrollado con React + JavaScript y Express.

## 🚀 Características

- ✅ Autenticación con credenciales
- ✅ Control de acceso basado en roles (Admin, Acceso Completo, Acceso Limitado)
- ✅ Catálogo de productos con búsqueda y filtros
- ✅ Carrito de compras con variaciones de productos
- ✅ Historial de pedidos
- ✅ Panel de administración con analytics
- ✅ Exportación a Excel
- ✅ Diseño responsivo

## 📋 Requisitos

- Node.js 16+ 
- npm o yarn

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install
```

## 🎯 Uso

### Iniciar el servidor backend (Puerto 5000)

```bash
npm run server
```

### Iniciar el servidor frontend (Puerto 3000)

```bash
npm run dev
```

Abrir http://localhost:3000 en el navegador.

## 👥 Usuarios de Prueba

### Administrador
- Usuario: `admin`
- Contraseña: `admin123`
- Permisos: Acceso completo + panel de administración

### Usuarios con Acceso Completo
- `chorrillos` / `chorrillos123`
- `magda` / `magda123`
- `lab` / `lab123`
- `iza` / `iza123`

Pueden ver todos los productos y realizar pedidos.

### Usuarios con Acceso Limitado
- `arequipa` / `arequipa123`
- `cuzco` / `cuzco123`
- `sullana` / `sullana123`
- `piura` / `piura123`
- `juliaca` / `juliaca123`

No pueden ver productos de limpieza.

## 📁 Estructura del Proyecto

```
almacen/
├── server.js                 # Servidor Express backend
├── db.json                   # Base de datos JSON
├── src/
│   ├── main.jsx             # Punto de entrada React
│   ├── App.jsx              # Componente principal
│   ├── index.css            # Estilos globales
│   ├── context/             # Contextos de React
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/               # Páginas
│   │   ├── Login.jsx
│   │   ├── Products.jsx
│   │   ├── OrderHistory.jsx
│   │   └── AdminDashboard.jsx
│   ├── components/          # Componentes
│   │   ├── Navbar.jsx
│   │   ├── Cart.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductModal.jsx
│   │   └── ProtectedRoute.jsx
│   ├── services/            # Servicios API
│   │   └── api.js
│   └── utils/               # Utilidades
│       └── excelExport.js
└── package.json
```

## 🔐 Seguridad

⚠️ **Nota**: Este sistema usa autenticación simple para desarrollo/uso interno. Para producción, se recomienda:
- Implementar hash de contraseñas (bcrypt)
- Usar JWT tokens
- Configurar HTTPS
- Usar una base de datos real (PostgreSQL, MongoDB, etc.)

## 📊 Funcionalidades por Rol

### Administrador
- ✅ Ver todos los productos
- ✅ Agregar/editar/eliminar productos
- ✅ Ver todos los pedidos
- ✅ Dashboard con analytics mensuales
- ✅ Exportar pedidos a Excel

### Acceso Completo
- ✅ Ver todos los productos
- ✅ Realizar pedidos
- ✅ Ver historial propio

### Acceso Limitado
- ✅ Ver productos (excepto limpieza)
- ✅ Realizar pedidos
- ✅ Ver historial propio

## 🎨 Tecnologías

- **Frontend**: React 18, React Router, Axios
- **Backend**: Express, JSON Server
- **Estilos**: CSS personalizado con variables
- **Exportación**: XLSX (SheetJS)

## 📝 Licencia

Uso interno - AVANLAB
