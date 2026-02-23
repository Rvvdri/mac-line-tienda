const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const app = express();

app.use(cors());

// ========== AUMENTAR LÍMITE A 50MB PARA 6 IMÁGENES ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// ==================== MONGODB ====================
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

// ==================== HELPER PARA GUARDAR IMÁGENES ====================
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

// ==================== FUNCIÓN HELPER PARA BUSCAR PRODUCTOS ====================
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

// ==================== RUTAS DE PRODUCTOS ====================

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

// POST - Agregar nuevo producto CON 6 IMÁGENES
app.post('/api/productos', async (req, res) => {
    try {
        const nuevoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        console.log('📦 Agregando producto:', req.body.nombre);
        console.log('📸 Imágenes recibidas:', {
            portada: req.body.imagenPortada ? 'Sí' : 'No',
            adicionales: req.body.imagenes ? req.body.imagenes.length : 0
        });
        
        // Procesar imagen de portada
        let imagenPortada = req.body.imagenPortada;
        if (imagenPortada && imagenPortada.startsWith('data:image')) {
            imagenPortada = guardarImagenBase64(imagenPortada, nuevoId, 'portada');
        }
        
        // Procesar imágenes adicionales
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

// PUT - Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`✏️ Actualizando producto: ${id}`);
        
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
        
        // Procesar nueva imagen de portada si viene
        if (req.body.imagenPortada && req.body.imagenPortada.startsWith('data:image')) {
            const nuevaPortada = guardarImagenBase64(req.body.imagenPortada, id, 'portada');
            if (nuevaPortada) {
                datosActualizados.imagenPortada = nuevaPortada;
            }
        }
        
        // Procesar nuevas imágenes adicionales si vienen
        if (req.body.imagenes && Array.isArray(req.body.imagenes)) {
            const nuevasImagenes = req.body.imagenes
                .map((img, index) => {
                    if (img && img.startsWith('data:image')) {
                        return guardarImagenBase64(img, id, `img${index + 1}`);
                    }
                    return img; // Mantener URL si ya es una ruta
                })
                .filter(img => img !== null);
            
            if (nuevasImagenes.length > 0) {
                datosActualizados.imagenes = nuevasImagenes;
            }
        }
        
        Object.keys(datosActualizados).forEach(key => 
            datosActualizados[key] === undefined && delete datosActualizados[key]
        );
        
        const filtro = construirFiltroProducto(id);
        const result = await productosCollection.updateOne(
            filtro,
            { $set: datosActualizados }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        console.log(`✅ Producto actualizado: ${id}`);
        
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

// ==================== RUTAS DE VENTAS ====================

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

// ==================== RUTA PARA EL FRONTEND ====================

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 3000;

conectarMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n╔═══════════════════════════════════════════╗`);
        console.log(`║  🖥️  MAC LINE - SERVIDOR 50MB LÍMITE     ║`);
        console.log(`║  ✓ Puerto: ${PORT}                           ║`);
        console.log(`║  ✓ MongoDB: Conectado                    ║`);
        console.log(`║  ✓ Límite: 50MB (6 imágenes)             ║`);
        console.log(`║  ✓ Base64 → Archivos JPG                 ║`);
        console.log(`╚═══════════════════════════════════════════╝\n`);
        console.log(`📍 Tienda:  http://localhost:${PORT}/`);
        console.log(`⚙️  Admin:   http://localhost:${PORT}/admin.html\n`);
    });
});
