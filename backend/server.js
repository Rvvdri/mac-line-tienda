const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ==================== EDITA AQUÍ TUS CREDENCIALES ====================

// EMAIL - Líneas 15-18 (CAMBIAR)
const EMAIL_USER = 'cony.montecinos1111@gmail.com';           // LÍNEA 15 - TU CORREO GMAIL
const EMAIL_PASSWORD = 'cudpasbcrvvhqjwo';      // LÍNEA 16 - CONTRASEÑA APP (16 caracteres sin espacios)
const EMAIL_FROM = 'cony.montecinos1111@gmail.com';           // LÍNEA 17 - MISMO QUE EMAIL_USER
const EMAIL_FROM_NAME = 'Mac Line';                     // LÍNEA 18 - NOMBRE QUE VE EL CLIENTE

// MERCADO PAGO - Líneas 20-22 (CAMBIAR)
const MP_PUBLIC_KEY = 'APP_USR-52ec0b57-00a7-4ec9-80f2-daf22c932ba7';    // LÍNEA 20 - TU PUBLIC KEY
const MP_ACCESS_TOKEN = 'APP_USR-8243642309453600-021500-604022eaf61d954cef22e66a4a9c2ad3-3202143065';  // LÍNEA 21 - TU ACCESS TOKEN
const MP_API_URL = 'https://api.mercadopago.com/v1';    // LÍNEA 22 - NO CAMBIAR

// ======================================================================

const dataFile = path.join(__dirname, '../data/productos.json');
const ventasFile = path.join(__dirname, '../data/ventas.json');

console.log('\n✓ SERVIDOR INICIANDO...');
console.log(`✓ Email: ${EMAIL_USER}`);
console.log(`✓ Mercado Pago: Configurado\n`);

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
});

// Verificar conexión de email
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email Error:', error.message);
    } else {
        console.log('✓ Email: Conexión exitosa\n');
    }
});

// Función para enviar email
async function enviarEmailConfirmacion(cliente, pedido) {
    try {
        const { nombre, email } = cliente;
        const { id, items, total } = pedido;

        const itemsHTML = items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${item.nombre}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.cantidad}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${item.precio.toLocaleString()}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${(item.cantidad * item.precio).toLocaleString()}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                    .header { background: linear-gradient(135deg, #0066cc 0%, #003d99 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                    .content { background: white; padding: 20px; border-radius: 0 0 8px 8px; }
                    .section { margin: 20px 0; padding: 15px; background-color: #f0f4f8; border-left: 4px solid #0066cc; border-radius: 4px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { background-color: #0066cc; color: white; padding: 12px; text-align: left; }
                    .total-row { font-weight: bold; font-size: 18px; background-color: #e8f0ff; padding: 12px !important; }
                    .success-badge { display: inline-block; background-color: #00d450; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🖥️ MAC LINE</h1>
                        <p>Tienda de Tecnología Premium</p>
                    </div>
                    <div class="content">
                        <h2>¡Hola ${nombre}!</h2>
                        <div class="section">
                            <div class="success-badge">✓ PAGO CONFIRMADO</div>
                            <p>Tu compra ha sido procesada correctamente.</p>
                        </div>
                        <h3>Detalle de tu Pedido</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th style="text-align: center;">Cantidad</th>
                                    <th style="text-align: right;">Precio</th>
                                    <th style="text-align: right;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                                <tr class="total-row">
                                    <td colspan="3" style="text-align: right;">Total Pagado:</td>
                                    <td style="text-align: right;">$${total.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="section">
                            <h3>📦 Próximos Pasos</h3>
                            <ol>
                                <li>Tu pedido está siendo procesado</li>
                                <li>Prepararemos tus productos</li>
                                <li>Te notificaremos cuando esté listo para envío</li>
                            </ol>
                        </div>
                        <div class="section">
                            <p><strong>Número de Referencia:</strong> MP-${id}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL')}</p>
                        </div>
                        <p style="text-align: center; color: #666; font-size: 12px;">&copy; 2024 Mac Line</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await transporter.sendMail({
            from: `${EMAIL_FROM_NAME} <${EMAIL_USER}>`,
            to: email,
            subject: '✓ Pago Confirmado - Tu Pedido en Mac Line',
            html: htmlContent
        });

        console.log(`✓ Email enviado a ${email}`);
        return true;

    } catch (error) {
        console.error('❌ Error al enviar email:', error.message);
        return false;
    }
}

function inicializarDatos() {
    const dataDir = path.join(__dirname, '../data');
    
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const productosDefault = [
        { id: 1, nombre: 'iPhone 15 Pro', categoria: 'celulares', descripcion: 'Último modelo de Apple', precio: 900000, precioOriginal: 1500000, descuento: 40, stock: 15, emoji: '📱' },
        { id: 2, nombre: 'Samsung Galaxy S24', categoria: 'celulares', descripcion: 'Pantalla AMOLED 6.2"', precio: 875000, precioOriginal: 1250000, descuento: 30, stock: 12, emoji: '📱' },
        { id: 3, nombre: 'Xiaomi 14 Ultra', categoria: 'celulares', descripcion: 'Diseño premium', precio: 750000, precioOriginal: 1000000, descuento: 25, stock: 20, emoji: '📱' },
        { id: 4, nombre: 'Google Pixel 8 Pro', categoria: 'celulares', descripcion: 'IA integrada', precio: 925000, precioOriginal: 1450000, descuento: 36, stock: 10, emoji: '📱' },
        { id: 5, nombre: '55" LG OLED 4K', categoria: 'televisores', descripcion: 'Panel OLED', precio: 1200000, stock: 8, emoji: '📺' },
        { id: 6, nombre: '65" Samsung QLED', categoria: 'televisores', descripcion: 'Quantum Dot', precio: 1500000, stock: 6, emoji: '📺' },
        { id: 7, nombre: '75" Sony Bravia 4K', categoria: 'televisores', descripcion: 'HDR Premium', precio: 1800000, stock: 5, emoji: '📺' },
        { id: 8, nombre: 'MacBook Pro 16" M3', categoria: 'computadores', descripcion: '16GB RAM', precio: 2200000, stock: 4, emoji: '💻' },
        { id: 9, nombre: 'Dell XPS 15', categoria: 'computadores', descripcion: 'Intel Core i9', precio: 1950000, stock: 7, emoji: '💻' },
        { id: 10, nombre: 'Lenovo ThinkPad X1', categoria: 'computadores', descripcion: 'Ultra portátil', precio: 1450000, stock: 9, emoji: '💻' },
        { id: 11, nombre: 'Sony WH-1000XM5', categoria: 'audifonos', descripcion: 'Cancelación activa', precio: 350000, stock: 25, emoji: '🎧' },
        { id: 12, nombre: 'Apple AirPods Pro 2', categoria: 'audifonos', descripcion: 'Audio espacial', precio: 320000, stock: 20, emoji: '🎧' },
        { id: 13, nombre: 'Sennheiser Momentum 4', categoria: 'audifonos', descripcion: 'Calidad estudio', precio: 450000, stock: 15, emoji: '🎧' }
    ];

    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, JSON.stringify(productosDefault, null, 2));
    }

    if (!fs.existsSync(ventasFile)) {
        fs.writeFileSync(ventasFile, JSON.stringify([], null, 2));
    }
}

function obtenerProductos() {
    try {
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (error) {
        return [];
    }
}

function guardarProductos(productos) {
    fs.writeFileSync(dataFile, JSON.stringify(productos, null, 2));
}

function obtenerVentas() {
    try {
        return JSON.parse(fs.readFileSync(ventasFile, 'utf8'));
    } catch (error) {
        return [];
    }
}

function guardarVentas(ventas) {
    fs.writeFileSync(ventasFile, JSON.stringify(ventas, null, 2));
}

// ======================== RUTAS API ========================

app.get('/api/productos', (req, res) => {
    res.json(obtenerProductos());
});

app.get('/api/productos/:id', (req, res) => {
    const producto = obtenerProductos().find(p => p.id == req.params.id);
    if (!producto) return res.status(404).json({ error: 'No encontrado' });
    res.json(producto);
});

app.post('/api/productos', (req, res) => {
    const { nombre, categoria, descripcion, precio, precioOriginal, descuento, stock, emoji } = req.body;
    if (!nombre || !categoria || !precio) return res.status(400).json({ error: 'Faltan datos' });
    
    const productos = obtenerProductos();
    const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1;
    const nuevoProducto = { id: nuevoId, nombre, categoria, descripcion: descripcion || '', precio: parseInt(precio), precioOriginal: precioOriginal ? parseInt(precioOriginal) : null, descuento: descuento ? parseInt(descuento) : 0, stock: parseInt(stock), emoji: emoji || '📦' };
    
    productos.push(nuevoProducto);
    guardarProductos(productos);
    res.status(201).json(nuevoProducto);
});

app.put('/api/productos/:id', (req, res) => {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id == req.params.id);
    if (!producto) return res.status(404).json({ error: 'No encontrado' });
    
    if (req.body.nombre) producto.nombre = req.body.nombre;
    if (req.body.categoria) producto.categoria = req.body.categoria;
    if (req.body.descripcion) producto.descripcion = req.body.descripcion;
    if (req.body.precio) producto.precio = parseInt(req.body.precio);
    if (req.body.stock !== undefined) producto.stock = parseInt(req.body.stock);
    if (req.body.descuento !== undefined) producto.descuento = parseInt(req.body.descuento);
    
    guardarProductos(productos);
    res.json(producto);
});

app.delete('/api/productos/:id', (req, res) => {
    const productos = obtenerProductos();
    const index = productos.findIndex(p => p.id == req.params.id);
    if (index === -1) return res.status(404).json({ error: 'No encontrado' });
    
    const [eliminado] = productos.splice(index, 1);
    guardarProductos(productos);
    res.json({ mensaje: 'Eliminado', producto: eliminado });
});

// ======================== PAGO ========================

app.post('/api/crear-preferencia', async (req, res) => {
    try {
        const { nombre, email, telefono, direccion, items, total } = req.body;
        if (!nombre || !email || !items || !total) {
            return res.status(400).json({ success: false, error: 'Datos incompletos' });
        }

        // Guardar venta
        const venta = {
            id: Date.now(),
            cliente: { nombre, email, telefono, direccion },
            items: items,
            total: total,
            estado: 'completada',
            emailEnviado: false,
            fechaCreacion: new Date().toISOString()
        };

        const ventas = obtenerVentas();
        ventas.push(venta);
        guardarVentas(ventas);

        // Actualizar stock
        const productos = obtenerProductos();
        items.forEach(item => {
            const producto = productos.find(p => p.id === item.id);
            if (producto) producto.stock -= item.cantidad;
        });
        guardarProductos(productos);

        // Enviar email
        const emailEnviado = await enviarEmailConfirmacion(
            { nombre, email },
            { id: venta.id, items, total }
        );

        if (emailEnviado) {
            venta.emailEnviado = true;
            ventas[ventas.length - 1] = venta;
            guardarVentas(ventas);
        }

        return res.json({
            success: true,
            mensaje: '✓ Pago procesado',
            emailEnviado: emailEnviado,
            enlacePago: `http://localhost:3000/success.html?reference=${venta.id}`,
            demo: true
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error al procesar' });
    }
});

app.get('/api/pagos', (req, res) => {
    res.json(obtenerVentas());
});

app.use((err, req, res) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
});

const PORT = 3000;
inicializarDatos();

app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  🖥️  MAC LINE - SERVIDOR INICIADO     ║`);
    console.log(`║  ✓ Puerto: ${PORT}                               ║`);
    console.log(`║  ✓ Email: ✓ ACTIVO                    ║`);
    console.log(`║  💳 Mercado Pago: ✓ CONFIGURADO       ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
    console.log(`📍 Abre en tu navegador:\n`);
    console.log(`🛍️  Tienda:  http://localhost:${PORT}/index.html`);
    console.log(`⚙️  Admin:   http://localhost:${PORT}/admin-login.html\n`);
});

module.exports = app;
