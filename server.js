const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
let db;
let productosCollection;
let ventasCollection;

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

function guardarImagenBase64(base64String, productoId, numero = '') {
    if (!base64String || !base64String.startsWith('data:image')) {
        return null;
    }
    
    try {
        const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) return null;
        
        const extension = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        
        const filename = `producto-${productoId}${numero ? `-${numero}` : ''}-${Date.now()}.${extension}`;
        const filepath = path.join(__dirname, 'public', 'imagenes', filename);
        
        const dir = path.join(__dirname, 'public', 'imagenes');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(filepath, buffer);
        console.log(`✅ Imagen guardada: ${filename}`);
        return `/imagenes/${filename}`;
    } catch (error) {
        console.error('❌ Error guardando imagen:', error);
        return null;
    }
}

function construirFiltroProducto(id) {
    const filtros = [];
    filtros.push({ id: id });
    filtros.push({ id: String(id) });
    filtros.push({ id: Number(id) });
    
    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        try {
            filtros.push({ _id: new ObjectId(id) });
        } catch (e) {}
    }
    
    return { $or: filtros };
}

app.get('/api/productos', async (req, res) => {
    try {
        const productos = await productosCollection.find({}).toArray();
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
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
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const nuevoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        console.log('📦 Agregando producto:', req.body.nombre);
        
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
            precioOriginal: req.body.precioOriginal,
            precio: req.body.precio,
            descuento: req.body.descuento || 0,
            stock: req.body.stock,
            emoji: req.body.emoji || '📦',
            imagenPortada: imagenPortada,
            imagenes: imagenesAdicionales,
            createdAt: new Date()
        };
        
        await productosCollection.insertOne(nuevoProducto);
        
        console.log('✅ Producto agregado exitosamente');
        console.log(`   - Portada: ${imagenPortada ? 'Guardada' : 'No'}`);
        console.log(`   - Imágenes adicionales: ${imagenesAdicionales.length}`);
        
        res.status(201).json({ 
            success: true, 
            mensaje: 'Producto agregado exitosamente',
            producto: {
                ...nuevoProducto,
                imagenPortada: imagenPortada ? 'Guardada' : null,
                imagenes: `${imagenesAdicionales.length} imágenes`
            }
        });
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ error: 'Error al agregar producto: ' + error.message });
    }
});

// ========== PUT - ACTUALIZAR PRODUCTO - FIX COMPLETO ==========
app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`\n✏️ ========== ACTUALIZANDO PRODUCTO ${id} ==========`);
        console.log('📦 Nombre:', req.body.nombre);
        
        const datosActualizados = {
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            descripcion: req.body.descripcion,
            precioOriginal: req.body.precioOriginal,
            precio: req.body.precio,
            descuento: req.body.descuento || 0,
            stock: req.body.stock,
            updatedAt: new Date()
        };
        
        // PORTADA: Si viene nueva (base64), guardarla
        if (req.body.imagenPortada && req.body.imagenPortada.startsWith('data:image')) {
            const nuevaPortada = guardarImagenBase64(req.body.imagenPortada, id, 'portada');
            if (nuevaPortada) {
                datosActualizados.imagenPortada = nuevaPortada;
                console.log('📸 Nueva portada guardada:', nuevaPortada);
            }
        } else if (req.body.imagenPortada && req.body.imagenPortada.startsWith('/imagenes/')) {
            // Si viene una ruta (imagen existente), mantenerla
            datosActualizados.imagenPortada = req.body.imagenPortada;
            console.log('📸 Portada mantenida:', req.body.imagenPortada);
        }
        
        // IMÁGENES ADICIONALES: Procesar cada una
        if (req.body.imagenes && Array.isArray(req.body.imagenes)) {
            console.log('📸 Recibidas', req.body.imagenes.length, 'imágenes');
            
            const imagenesFinales = req.body.imagenes.map((img, index) => {
                if (!img) {
                    console.log(`📸 Imagen ${index + 1}: null (vacía)`);
                    return null;
                }
                
                if (img.startsWith('data:image')) {
                    // Es una imagen nueva en base64, guardarla
                    const guardada = guardarImagenBase64(img, id, `img${index + 1}`);
                    console.log(`📸 Imagen ${index + 1}: NUEVA guardada →`, guardada);
                    return guardada;
                } else if (img.startsWith('/imagenes/')) {
                    // Es una ruta existente, mantenerla
                    console.log(`📸 Imagen ${index + 1}: EXISTENTE mantenida →`, img);
                    return img;
                } else {
                    console.log(`📸 Imagen ${index + 1}: Formato desconocido →`, img.substring(0, 50));
                    return img;
                }
            }).filter(img => img !== null);
            
            datosActualizados.imagenes = imagenesFinales;
            console.log('✅ Total imágenes finales:', imagenesFinales.length);
        }
        
        // Eliminar campos undefined
        Object.keys(datosActualizados).forEach(key => 
            datosActualizados[key] === undefined && delete datosActualizados[key]
        );
        
        console.log('💾 Guardando en MongoDB...');
        const filtro = construirFiltroProducto(id);
        const result = await productosCollection.updateOne(
            filtro,
            { $set: datosActualizados }
        );
        
        if (result.matchedCount === 0) {
            console.log('❌ Producto no encontrado');
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        console.log(`✅ Producto actualizado (${result.modifiedCount} modificado)`);
        console.log('========== FIN ACTUALIZACIÓN ==========\n');
        
        res.json({ 
            success: true,
            mensaje: 'Producto actualizado exitosamente',
            modificados: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto: ' + error.message });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️  Eliminando producto: ${id}`);
        
        const filtro = construirFiltroProducto(id);
        const result = await productosCollection.deleteOne(filtro);
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        console.log(`✅ Producto eliminado: ${id}`);
        res.json({ 
            success: true,
            mensaje: 'Producto eliminado exitosamente',
            id: id
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

app.get('/api/ventas', async (req, res) => {
    try {
        const ventas = await ventasCollection.find({}).sort({ fecha: -1 }).toArray();
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

conectarMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n╔═══════════════════════════════════════════╗`);
        console.log(`║  🖥️  MAC LINE - SERVIDOR FIX IMÁGENES    ║`);
        console.log(`║  ✓ Puerto: ${PORT}                           ║`);
        console.log(`║  ✓ MongoDB: Conectado                    ║`);
        console.log(`║  ✓ Límite: 50MB                          ║`);
        console.log(`║  ✓ Imágenes: Base64 + Rutas existentes  ║`);
        console.log(`╚═══════════════════════════════════════════╝\n`);
        console.log(`📍 Tienda:  http://localhost:${PORT}/`);
        console.log(`⚙️  Admin:   http://localhost:${PORT}/admin.html\n`);
    });
});
