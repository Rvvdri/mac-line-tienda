# 🖥️ MAC LINE - Tienda de Tecnología Premium

Sistema completo de e-commerce para venta de productos tecnológicos con panel de administración integrado.

## ✨ Características

✅ **Frontend Moderno**
- Diseño responsivo con colores que evocan tecnología (azul cian, magenta, oscuro)
- Catálogo de productos con filtros por categoría
- Carrito de compras con gestión de cantidades
- Promociones automáticas en celulares (25-40%)
- Integración con Mercado Pago

✅ **Panel de Administración**
- Gestión completa de productos
- Actualización de stock en tiempo real
- Historial de ventas con detalles
- Reportes de stock
- Estadísticas de ventas

✅ **Backend Robusto**
- API RESTful con Express.js
- Base de datos en archivos JSON (sin MongoDB)
- Gestión automática de precios e inventario
- Validación de datos

---

## 📦 Estructura de Carpetas

```
mac-line/
├── public/
│   ├── index.html          # Tienda principal
│   ├── admin.html          # Panel de administración
│   ├── styles.css          # Estilos tienda
│   ├── admin-styles.css    # Estilos admin
│   ├── script.js           # Lógica tienda
│   └── admin.js            # Lógica admin
├── backend/
│   ├── server.js           # Servidor principal
│   ├── package.json        # Dependencias
│   └── .env                # Variables de entorno
└── data/
    ├── productos.json      # Base de datos de productos
    └── ventas.json         # Historial de ventas
```

---

## 🚀 Instalación Rápida

### 1️⃣ Requisitos Previos
- **Node.js** (v14 o superior)
- **npm** (viene con Node.js)

### 2️⃣ Descargar Archivos

Descarga todos los archivos y organízalos así:

```
mac-line/
├── public/
│   ├── 01_index.html → renombrar a index.html
│   ├── 02_styles.css → renombrar a styles.css
│   ├── 03_script.js → renombrar a script.js
│   ├── 04_admin.html → renombrar a admin.html
│   ├── 05_admin-styles.css → renombrar a admin-styles.css
│   └── 06_admin.js → renombrar a admin.js
├── backend/
│   ├── 07_package.json → renombrar a package.json
│   ├── 08_server.js → renombrar a server.js
│   └── 09_.env → renombrar a .env
└── data/
    ├── 10_productos.json → renombrar a productos.json
    └── 11_ventas.json → renombrar a ventas.json
```

### 3️⃣ Instalar Dependencias

```bash
cd backend
npm install
```

### 4️⃣ Iniciar el Servidor

```bash
npm start
```

Verás:
```
╔════════════════════════════════════════╗
║  🖥️  MAC LINE - SERVIDOR INICIADO     ║
║  ✓ Puerto: 3000                        ║
║  ✓ URL: http://localhost:3000         ║
║  ✓ API: http://localhost:3000/api     ║
╚════════════════════════════════════════╝
```

### 5️⃣ Acceder a la Tienda

**Tienda Principal:** http://localhost:3000/public/index.html

**Panel de Administración:** http://localhost:3000/public/admin.html

---

## 📋 Guía de Uso

### 🛍️ Como Cliente

1. **Explorar productos**: Navega por las diferentes categorías
2. **Ver detalles**: Cada producto muestra precio, descuento y disponibilidad
3. **Agregar al carrito**: Presiona "Agregar al Carrito"
4. **Gestionar carrito**: Aumenta/disminuye cantidad o elimina productos
5. **Finalizar compra**: Completa datos personales y procesa el pago

### ⚙️ Como Administrador

**Panel de Productos:**
- ✏️ **Editar**: Modifica precio, stock, descuento
- 🗑️ **Eliminar**: Remueve productos del catálogo
- ➕ **Agregar**: Crea nuevos productos

**Gestionar Stock:**
- Ver cantidad de unidades disponibles
- Identificar productos agotados (rojo)
- Detectar stock bajo (amarillo)

**Ver Ventas:**
- Historial completo de compras
- Detalles de cada venta (cliente, productos, total)
- Información de envío

**Reportes:**
- Total de productos
- Productos agotados
- Stock bajo (<5 unidades)
- Total de ventas

---

## 💰 Productos Incluidos (Precios CLP)

### 📱 Celulares (Con Descuento 25-40%)
- iPhone 15 Pro: $900.000 (-40%)
- Samsung Galaxy S24: $875.000 (-30%)
- Xiaomi 14 Ultra: $750.000 (-25%)
- Google Pixel 8 Pro: $925.000 (-36%)

### 📺 Televisores
- 55" LG OLED 4K: $1.200.000
- 65" Samsung QLED: $1.500.000
- 75" Sony Bravia 4K: $1.800.000

### 💻 Computadores
- MacBook Pro 16" M3: $2.200.000
- Dell XPS 15: $1.950.000
- Lenovo ThinkPad X1: $1.450.000

### 🎧 Audífonos
- Sony WH-1000XM5: $350.000
- Apple AirPods Pro 2: $320.000
- Sennheiser Momentum 4: $450.000

---

## 🔧 API Endpoints

### Productos
```
GET    /api/productos              # Obtener todos
GET    /api/productos/:id          # Obtener uno
POST   /api/productos              # Crear nuevo
PUT    /api/productos/:id          # Actualizar
DELETE /api/productos/:id          # Eliminar
PUT    /api/productos/:id/stock    # Actualizar stock
```

### Pagos/Ventas
```
POST   /api/pagos/crear            # Crear venta
GET    /api/pagos/:id              # Obtener venta
GET    /api/pagos                  # Todas las ventas
```

---

## 📝 Agregar Nuevo Producto

1. Ve al panel de administración
2. Clic en "➕ Agregar Producto"
3. Completa los campos:
   - **Nombre**: Nombre del producto
   - **Categoría**: celulares, televisores, computadores, audifonos
   - **Descripción**: Características principales
   - **Precio**: En CLP (números redondos)
   - **Precio Original**: (opcional) Para mostrar descuento
   - **Descuento**: 25, 30, 35, 40 (solo para celulares)
   - **Stock**: Cantidad disponible
   - **Emoji**: Ícono representativo
4. Clic en "Agregar Producto"

---

## 🌐 Despliegue en Producción

### Opción 1: Heroku
```bash
heroku create nombre-app
git push heroku main
```

### Opción 2: Railway
1. Sube a GitHub
2. Conecta tu repositorio en Railway
3. Deploy automático

### Opción 3: Servidor Propio
- Sube a VPS (DigitalOcean, Linode, etc.)
- Usa PM2 para mantener el servidor corriendo
- Configura un domain con SSL

---

## ❓ Solución de Problemas

### "Error al cargar los productos"
- Asegúrate que el servidor está corriendo en puerto 3000
- Verifica que no hay otro proceso usando ese puerto

### "La API no responde"
- Reinicia el servidor: `npm start`
- Verifica que la carpeta `data/` tenga los JSON

### "Cambios en admin no se ven en tienda"
- La tienda se recarga automáticamente cada 30 segundos
- O recarga la página manualmente

---

## 📄 Licencia

Proyecto privado para Mac Line

---

**Creado con ❤️ para tu tienda de tecnología**
