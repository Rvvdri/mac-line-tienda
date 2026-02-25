const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== CREDENCIALES ====================
const EMAIL_USER = 'linemac910@gmail.com';
const EMAIL_PASSWORD = 'kqlxbwylmztcipco';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER, // 'linemac910@gmail.com'
        pass: EMAIL_PASSWORD  // 'kqlxbwylmztcipco'
    }
});

const EMAIL_FROM_NAME = 'Mac Line';

const MP_PUBLIC_KEY = process.env.MP_PUBLIC_KEY || 'APP_USR-b1762627-5e4b-4409-88d4-5098974ea645';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || 'APP_USR-1539674871672378-021917-5d3634d0ef2f478d31ea2f5db8abeb5d-3208244091';
const MP_API_URL = 'https://api.mercadopago.com';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
const PORT = process.env.PORT || 3000;

// ==================== MONGODB ====================
let db;
let productosCollection;
let ventasCollection;

// Conectar a MongoDB
async function conectarMongoDB() {
    try {
        const client = await MongoClient.connect(MONGODB_URI);
        db = client.db('macline');
        productosCollection = db.collection('productos');
        ventasCollection = db.collection('ventas');
        console.log('✓ MongoDB conectado correctamente');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
}

// ==================== RUTAS DE PRODUCTOS ====================

// GET - Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await productosCollection.find({}).toArray();
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET - Obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await productosCollection.findOne({ id: req.params.id });
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(producto);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// POST - Agregar nuevo producto
app.post('/api/productos', async (req, res) => {
    try {
        const nuevoProducto = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            precioOriginal: req.body.precioOriginal || null,
            stock: req.body.stock,
            descuento: req.body.descuento || 0,
            emoji: req.body.emoji || '📦',
            imagenPortada: req.body.imagenPortada || null,
            imagenes: req.body.imagenes || [],
            createdAt: new Date()
        };
        
        const result = await productosCollection.insertOne(nuevoProducto);
        
        res.status(201).json({ 
            success: true, 
            mensaje: 'Producto agregado exitosamente',
            producto: nuevoProducto 
        });
        
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

// PUT - Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizados = {
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            precio: req.body.precio,
            stock: req.body.stock,
            descuento: req.body.descuento || 0,
            updatedAt: new Date()
        };
        
        // Eliminar campos undefined
        Object.keys(datosActualizados).forEach(key => 
            datosActualizados[key] === undefined && delete datosActualizados[key]
        );
        
        const result = await productosCollection.updateOne(
            { id: id },
            { $set: datosActualizados }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ 
            success: true,
            mensaje: 'Producto actualizado exitosamente',
            modificados: result.modifiedCount
        });
        
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// DELETE - Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️  Intentando eliminar producto con ID: ${id}`);
        
        const result = await productosCollection.deleteOne({ id: id });
        
        if (result.deletedCount === 0) {
            console.log(`❌ Producto con ID ${id} no encontrado`);
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        console.log(`✅ Producto eliminado exitosamente: ${id}`);
        
        res.json({ 
            success: true,
            mensaje: 'Producto eliminado exitosamente',
            id: id
        });
        
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto: ' + error.message });
    }
});

// ==================== RUTAS DE VENTAS ====================

// RUTA MERCADO PAGO
app.post('/api/crear-preferencia', async (req, res) => {
    try {
        const { items, nombre, email } = req.body;

        const preferencia = {
            items: items.map(item => ({
                title: item.nombre,
                unit_price: Number(item.precio),
                quantity: Number(item.cantidad),
                currency_id: 'CLP'
            })),
            payer: { name: nombre, email: email },
            back_urls: {
                success: `${req.headers.origin}/success.html`,
                failure: `${req.headers.origin}/cart.html`,
            },
            auto_return: 'approved'
        };

        const response = await axios.post(
            'https://api.mercadopago.com/checkout/preferences',
            preferencia,
            {
                headers: {
                    'Authorization': `Bearer ${MP_ACCESS_TOKEN}`, // Tu token del archivo
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ init_point: response.data.init_point });
    } catch (error) {
        console.error('Error MP:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al crear pago' });
    }
});

// RUTA NODEMAILER
app.post('/api/enviar-pedido', async (req, res) => {
    try {
        const { nombre, email, telefono, direccion, items, total } = req.body;

        const htmlProductos = items.map(p => `<li>${p.nombre} (x${p.cantidad}) - $${p.precio}</li>`).join('');

        await transporter.sendMail({
            from: `"${EMAIL_FROM_NAME}" <${EMAIL_USER}>`, //
            to: EMAIL_USER, 
            subject: `🛒 Nuevo Pedido de ${nombre}`,
            html: `<h3>Datos del Cliente</h3>
                   <p>Nombre: ${nombre}<br>Email: ${email}<br>Tel: ${telefono}<br>Dir: ${direccion}</p>
                   <h3>Productos</h3><ul>${htmlProductos}</ul>
                   <h4>Total: $${total}</h4>`
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar mail' });
    }
});

// POST - Registrar nueva venta
app.post('/api/ventas', async (req, res) => {
    try {
        const nuevaVenta = {
            id: Date.now().toString(),
            fecha: new Date(),
            cliente: {
                nombre: req.body.nombre,
                email: req.body.email,
                telefono: req.body.telefono,
                direccion: req.body.direccion
            },
            productos: req.body.items,
            total: req.body.total,
            estado: 'completada'
        };
        
        await ventasCollection.insertOne(nuevaVenta);
        
        res.json({ 
            success: true,
            mensaje: 'Venta registrada',
            venta: nuevaVenta
        });
        
    } catch (error) {
        console.error('Error al registrar venta:', error);
        res.status(500).json({ error: 'Error al registrar venta' });
    }
});

// ==================== RUTA PARA EL FRONTEND ====================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== INICIAR SERVIDOR ====================

conectarMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`);
        console.log('✓ Panel Admin: http://localhost:' + PORT + '/admin.html\n');
    });
});
