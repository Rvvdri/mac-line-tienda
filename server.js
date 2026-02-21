const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MERCADO PAGO
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-1539674871672378-021917-5d3634d0ef2f478d31ea2f5db8abeb5d-3208244091'
});

// MONGODB
const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
let db, productosCollection, ventasCollection;

async function conectarMongoDB() {
    try {
        const mongoClient = await MongoClient.connect(MONGODB_URI);
        db = mongoClient.db('macline');
        productosCollection = db.collection('productos');
        ventasCollection = db.collection('ventas');
        console.log('✓ MongoDB conectado');
    } catch (error) {
        console.error('❌ Error MongoDB:', error);
        process.exit(1);
    }
}

function construirFiltroProducto(id) {
    const filtros = [
        { id: id },
        { id: String(id) },
        { id: Number(id) }
    ];
    
    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        try {
            filtros.push({ _id: new ObjectId(id) });
        } catch (e) {}
    }
    
    return { $or: filtros };
}

function guardarImagenBase64(base64String, productoId, numero = '') {
    if (!base64String || !base64String.startsWith('data:image')) return null;
    
    try {
        const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) return null;
        
        const extension = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const filename = `producto-${productoId}${numero ? `-${numero}` : ''}-${Date.now()}.${extension}`;
        const filepath = path.join(__dirname, 'public', 'imagenes', filename);
        
        const dir = path.join(__dirname, 'public', 'imagenes');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        fs.writeFileSync(filepath, buffer);
        return `/imagenes/${filename}`;
    } catch (error) {
        console.error('❌ Error guardando imagen:', error);
        return null;
    }
}

// RUTAS PRODUCTOS
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await productosCollection.find({}).toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

app.get('/api/productos/:id', async (req, res) => {
    try {
        const filtro = construirFiltroProducto(req.params.id);
        const producto = await productosCollection.findOne(filtro);
        
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const nuevoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const precioOriginal = parseFloat(req.body.precioOriginal);
        const descuento = parseFloat(req.body.descuento) || 0;
        const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
        
        let imagenPortada = req.body.imagenPortada;
        if (imagenPortada && imagenPortada.startsWith('data:image')) {
            imagenPortada = guardarImagenBase64(imagenPortada, nuevoId, 'portada');
        }
        
        let imagenesAdicionales = [];
        if (req.body.imagenes && Array.isArray(req.body.imagenes)) {
            imagenesAdicionales = req.body.imagenes
                .map((img, index) => {
                    if (img && img.startsWith('data:image')) {
                        return guardarImagenBase64(img, nuevoId, `img${index + 1}`);
                    }
                    return null;
                })
                .filter(img => img !== null);
        }
        
        const nuevoProducto = {
            id: nuevoId,
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            descripcion: req.body.descripcion,
            precioOriginal: precioOriginal,
            precio: precioFinal,
            descuento: descuento,
            stock: req.body.stock,
            emoji: req.body.emoji || '📦',
            imagenPortada: imagenPortada,
            imagenes: imagenesAdicionales,
            createdAt: new Date()
        };
        
        await productosCollection.insertOne(nuevoProducto);
        res.status(201).json({ success: true, producto: nuevoProducto });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const precioOriginal = parseFloat(req.body.precioOriginal);
        const descuento = parseFloat(req.body.descuento) || 0;
        const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
        
        const datosActualizados = {
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            descripcion: req.body.descripcion,
            precioOriginal: precioOriginal,
            precio: precioFinal,
            descuento: descuento,
            stock: req.body.stock,
            updatedAt: new Date()
        };
        
        if (req.body.imagenPortada) {
            if (req.body.imagenPortada.startsWith('data:image')) {
                datosActualizados.imagenPortada = guardarImagenBase64(req.body.imagenPortada, id, 'portada');
            } else {
                datosActualizados.imagenPortada = req.body.imagenPortada;
            }
        }
        
        if (req.body.imagenes && Array.isArray(req.body.imagenes)) {
            datosActualizados.imagenes = req.body.imagenes.map((img, index) => {
                if (!img) return null;
                if (img.startsWith('data:image')) {
                    return guardarImagenBase64(img, id, `img${index + 1}`);
                }
                return img;
            }).filter(img => img !== null);
        }
        
        Object.keys(datosActualizados).forEach(key => 
            datosActualizados[key] === undefined && delete datosActualizados[key]
        );
        
        const filtro = construirFiltroProducto(id);
        const result = await productosCollection.updateOne(filtro, { $set: datosActualizados });
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ success: true, modificados: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const filtro = construirFiltroProducto(req.params.id);
        const result = await productosCollection.deleteOne(filtro);
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// MERCADO PAGO
app.post('/api/crear-preferencia', async (req, res) => {
    try {
        const { items, cliente } = req.body;
        
        console.log('\n💳 ========== CREANDO PREFERENCIA MP ==========');
        console.log('Cliente:', cliente.nombre);
        console.log('Items:', items.length);
        
        const preference = new Preference(client);
        
        const preferenceData = {
            items: items.map(item => ({
                title: item.nombre,
                quantity: Number(item.cantidad),
                unit_price: Number(item.precio),
                currency_id: 'CLP'
            })),
            payer: {
                name: cliente.nombre,
                email: cliente.email
            },
            back_urls: {
                success: 'http://localhost:3000/success.html',
                failure: 'http://localhost:3000/failure.html',
                pending: 'http://localhost:3000/pending.html'
            },
            auto_return: 'approved'
        };
        
        console.log('📋 Datos de preferencia:', JSON.stringify(preferenceData, null, 2));
        
        const result = await preference.create({ body: preferenceData });
        
        console.log('✅ Preferencia creada:', result.id);
        console.log('🔗 URL:', result.init_point);
        console.log('========== FIN ==========\n');
        
        res.json({
            id: result.id,
            init_point: result.init_point
        });
        
    } catch (error) {
        console.error('❌ Error MP:', error);
        res.status(500).json({ error: 'Error al crear preferencia: ' + error.message });
    }
});

app.post('/api/webhook', async (req, res) => {
    console.log('🔔 Webhook:', req.body);
    res.status(200).send('OK');
});

// VENTAS
app.get('/api/ventas', async (req, res) => {
    try {
        const ventas = await ventasCollection.find({}).sort({ fecha: -1 }).toArray();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

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
        res.json({ success: true, venta: nuevaVenta });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar venta' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

conectarMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n╔═══════════════════════════════════════════╗`);
        console.log(`║  🖥️  MAC LINE - MERCADO PAGO FIX         ║`);
        console.log(`║  ✓ Puerto: ${PORT}                           ║`);
        console.log(`║  ✓ MongoDB: Conectado                    ║`);
        console.log(`║  ✓ Mercado Pago: OK                      ║`);
        console.log(`╚═══════════════════════════════════════════╝\n`);
    });
});
