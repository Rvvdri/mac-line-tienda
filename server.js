const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== CREDENCIALES ====================
const EMAIL_USER = 'linemac910@gmail.com';
const EMAIL_PASSWORD = 'kqlxbwylmztcipco';
const EMAIL_FROM_NAME = 'Mac Line';

const MP_PUBLIC_KEY = process.env.MP_PUBLIC_KEY || 'APP_USR-b1762627-5e4b-4409-88d4-5098974ea645';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-1539674871672378-021917-5d3634d0ef2f478d31ea2f5db8abeb5d-3208244091';
const MP_API_URL = 'https://api.mercadopago.com';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/?appName=Cluster0';
const PORT = process.env.PORT || 3000;

// LISTA DE PRODUCTOS (Copia aquí tus productos reales)
const productos = [
    {
        id: 1771387260264,
        nombre: "MacBook Air M2",
        precio: 1290000,
        imagen: "macbook.jpg",
        categoria: "Notebooks"
    },
    // Agrega el resto de tus productos aquí...
];

// Ruta para obtener todos los productos
app.get('/api/productos', (req, res) => {
    res.json(productos);
});

// Ruta para obtener un solo producto por ID
app.get('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const producto = productos.find(p => p.id == id);
    
    if (producto) {
        res.json(producto);
    } else {
        res.status(404).json({ error: "Producto no encontrado" });
    }
});

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

async function inicializarProductos() {
    const count = await db.collection('productos').countDocuments();
    if (count === 0) {
        await db.collection('productos').insertMany(productosDefault);
        console.log('✓ Productos iniciales cargados en MongoDB');
    }
}

// ==================== EMAIL ====================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD }
});

transporter.verify((error) => {
    if (error) console.log('❌ Email Error:', error.message);
    else console.log('✓ Email: Conexión exitosa');
});

// ==================== RUTAS PRODUCTOS ====================

app.get('/api/productos', async (req, res) => {
    try {
        const productos = await db.collection('productos').find({}, { projection: { _id: 0 } }).toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.get('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Intentamos buscarlo de dos formas para estar seguros
        const producto = await db.collection('productos').findOne({ 
            $or: [
                { id: id },           // Busca como texto
                { id: Number(id) }    // Busca como número
            ]
        }, { projection: { _id: 0 } });
        
        if (producto) {
            res.json(producto);
        } else {
            console.log("Producto no hallado con ID:", id); // Esto saldrá en tu terminal
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await db.collection('productos').findOne({ id: parseInt(req.params.id) }, { projection: { _id: 0 } });
        if (!producto) return res.status(404).json({ error: 'No encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, categoria, descripcion, precio, precioOriginal, descuento, stock, emoji } = req.body;
        if (!nombre || !categoria || !precio) return res.status(400).json({ error: 'Faltan datos' });

        const ultimo = await db.collection('productos').findOne({}, { sort: { id: -1 } });
        const nuevoId = ultimo ? ultimo.id + 1 : 1;

        const nuevoProducto = {
            id: nuevoId,
            nombre,
            categoria,
            descripcion: descripcion || '',
            precio: parseInt(precio),
            precioOriginal: precioOriginal ? parseInt(precioOriginal) : null,
            descuento: descuento ? parseInt(descuento) : 0,
            stock: parseInt(stock),
            emoji: emoji || '📦'
        };

        await db.collection('productos').insertOne(nuevoProducto);
        const { _id, ...productoSinId } = nuevoProducto;
        res.status(201).json(productoSinId);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cambios = {};
        
        // Campos básicos
        if (req.body.nombre) cambios.nombre = req.body.nombre;
        if (req.body.categoria) cambios.categoria = req.body.categoria;
        if (req.body.descripcion) cambios.descripcion = req.body.descripcion;
        if (req.body.precio) cambios.precio = parseInt(req.body.precio);
        if (req.body.precioOriginal) cambios.precioOriginal = parseInt(req.body.precioOriginal);
        if (req.body.stock !== undefined) cambios.stock = parseInt(req.body.stock);
        if (req.body.descuento !== undefined) cambios.descuento = parseInt(req.body.descuento);
        
        // Imágenes
        if (req.body.imagenPortada) cambios.imagenPortada = req.body.imagenPortada;
        if (req.body.imagenes) cambios.imagenes = req.body.imagenes;
        
        // Variantes (colores y capacidades)
        if (req.body.colores !== undefined) cambios.colores = req.body.colores;
        if (req.body.capacidades !== undefined) cambios.capacidades = req.body.capacidades;

        const result = await db.collection('productos').findOneAndUpdate(
            { id },
            { $set: cambios },
            { returnDocument: 'after', projection: { _id: 0 } }
        );

        if (!result) return res.status(404).json({ error: 'No encontrado' });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await db.collection('productos').findOneAndDelete({ id });
        if (!result) return res.status(404).json({ error: 'No encontrado' });
        res.json({ mensaje: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// ==================== MERCADO PAGO ====================

app.post('/api/crear-preferencia', async (req, res) => {
    try {
        console.log('\n📦 Request body recibido:', JSON.stringify(req.body, null, 2));
        
        const { nombre, email, telefono, direccion, items, total } = req.body;

        if (!nombre || !email || !items || !total) {
            console.error('❌ Datos incompletos:', { nombre: !!nombre, email: !!email, items: !!items, total: !!total });
            return res.status(400).json({ 
                success: false, 
                error: 'Datos incompletos',
                faltantes: {
                    nombre: !nombre,
                    email: !email,
                    items: !items,
                    total: !total
                }
            });
        }
        
        // Validar que items tenga los campos necesarios
        const itemsInvalidos = items.filter(item => !item.id || !item.nombre || !item.precio);
        if (itemsInvalidos.length > 0) {
            console.error('❌ Items inválidos:', itemsInvalidos);
            return res.status(400).json({
                success: false,
                error: 'Items inválidos',
                itemsInvalidos
            });
        }

        console.log('\n💳 CREANDO PREFERENCIA EN MERCADO PAGO...');

        const preferencia = {
            items: items.map(item => ({
                id: String(item.id || Date.now()),
                title: item.nombre || 'Producto',
                quantity: parseInt(item.cantidad) || 1,
                unit_price: parseFloat(item.precio) || 0
            })),
            payer: {
                name: nombre,
                email: email,
                phone: { area_code: '+56', number: telefono.replace(/\D/g, '') },
                address: { street_name: direccion }
            },
            back_urls: {
                success: `${process.env.BASE_URL || 'http://localhost:3000'}/success.html`,
                failure: `${process.env.BASE_URL || 'http://localhost:3000'}/failed.html`,
                pending: `${process.env.BASE_URL || 'http://localhost:3000'}/pending.html`
            },
            ...(process.env.BASE_URL && { auto_return: 'approved' }),
            ...(process.env.BASE_URL && { notification_url: `${process.env.BASE_URL}/api/webhook` })
        };

        const response = await axios.post(
            `${MP_API_URL}/checkout/preferences`,
            preferencia,
            {
                headers: {
                    'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': Date.now().toString()
                }
            }
        );

        console.log('✓ Preferencia creada:', response.data.init_point);

        const venta = {
            id: Date.now(),
            cliente: { nombre, email, telefono, direccion },
            items,
            total,
            estado: 'pendiente',
            mpPreferenceId: response.data.id,
            mpInitPoint: response.data.init_point,
            emailEnviado: false,
            fechaCreacion: new Date().toISOString()
        };

        await db.collection('ventas').insertOne(venta);

        return res.json({
            success: true,
            enlacePago: response.data.init_point,
            preferenceId: response.data.id
        });

    } catch (error) {
        console.error('❌ Error Mercado Pago:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.message || 'Error al procesar con Mercado Pago'
        });
    }
});

app.post('/api/webhook', async (req, res) => {
    try {
        console.log('Webhook recibido:', req.body);
        res.json({ recibido: true });
    } catch (error) {
        res.status(500).json({ error: 'Error procesando webhook' });
    }
});

app.get('/api/pagos', async (req, res) => {
    try {
        const ventas = await db.collection('ventas').find({}, { projection: { _id: 0 } }).toArray();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

// ==================== INICIAR SERVIDOR ====================
// Quitamos la necesidad de esperar a MongoDB para que Vercel no de error
app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  🖥️  MAC LINE - SERVIDOR INICIADO     ║`);
    console.log(`║  ✓ Puerto: ${PORT}                           ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
});

// Opcional: Intenta conectar pero no apagues el servidor si falla
conectarMongoDB().catch(err => console.log("⚠️ Trabajando sin MongoDB Atlas"));

module.exports = app;
