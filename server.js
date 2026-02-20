const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== MONGODB ====================
const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
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

// ==================== FUNCIÓN HELPER PARA BUSCAR PRODUCTOS ====================
function construirFiltroProducto(id) {
    // Intenta buscar por 'id' personalizado o por '_id' de MongoDB
    const filtros = [];
    
    // Buscar por id personalizado (string o número)
    filtros.push({ id: id });
    filtros.push({ id: String(id) });
    filtros.push({ id: Number(id) });
    
    // Si parece un ObjectId de MongoDB (24 caracteres hex), búscalo
    if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        try {
            filtros.push({ _id: new ObjectId(id) });
        } catch (e) {
            // No es un ObjectId válido
        }
    }
    
    return { $or: filtros };
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
        
        console.log(`✏️ Actualizando producto con ID: ${id}`);
        
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
        
        // Construir filtro que busque por 'id' O '_id'
        const filtro = construirFiltroProducto(id);
        
        console.log('Filtro de búsqueda:', JSON.stringify(filtro));
        console.log('Datos a actualizar:', datosActualizados);
        
        const result = await productosCollection.updateOne(
            filtro,
            { $set: datosActualizados }
        );
        
        console.log('Resultado:', { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
        
        if (result.matchedCount === 0) {
            console.log(`❌ Producto no encontrado con ID: ${id}`);
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
        res.status(500).json({ error: 'Error al actualizar producto: ' + error.message });
    }
});

// DELETE - Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️  Intentando eliminar producto con ID: ${id}`);
        
        // Construir filtro que busque por 'id' O '_id'
        const filtro = construirFiltroProducto(id);
        
        console.log('Filtro de búsqueda:', JSON.stringify(filtro));
        
        const result = await productosCollection.deleteOne(filtro);
        
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

// GET - Obtener todas las ventas
app.get('/api/ventas', async (req, res) => {
    try {
        const ventas = await ventasCollection.find({}).sort({ fecha: -1 }).toArray();
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ error: 'Error al obtener ventas' });
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

const PORT = process.env.PORT || 3000;

conectarMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n✓ Servidor corriendo en http://localhost:${PORT}`);
        console.log('✓ Panel Admin: http://localhost:' + PORT + '/admin.html\n');
    });
});
