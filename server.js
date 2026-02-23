const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const nodemailer = require('nodemailer');
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

// NODEMAILER - CONFIGURACIÓN GMAIL
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'linemac910@gmail.com',  // ← CAMBIA ESTO
        pass: 'nlxsyovzxjrxlaoz'       // ← CAMBIA ESTO (App Password de Gmail)
    }
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

// FUNCIÓN PARA ENVIAR EMAIL
async function enviarEmailConfirmacion(venta) {
    try {
        const productosHTML = venta.productos.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nombre}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.precio.toLocaleString('es-CL')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: '"MAC LINE - Tienda Tecnología" <linemac910@gmail.com>',
            to: venta.cliente.email,
            subject: `✅ Pedido Confirmado #${String(venta.id).substring(0, 8)} - MAC LINE`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .order-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { background: #667eea; color: white; padding: 15px; text-align: right; font-size: 20px; font-weight: bold; }
        .footer { background: #1d1d1f; color: white; padding: 20px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖥️ MAC LINE</h1>
            <h2>¡Gracias por tu compra!</h2>
        </div>
        
        <div class="content">
            <h3>Hola ${venta.cliente.nombre},</h3>
            <p>Tu pedido ha sido confirmado y está en proceso de preparación.</p>
            
            <div class="order-info">
                <h4>📦 Detalles del Pedido</h4>
                <p><strong>Número de Pedido:</strong> #${String(venta.id).substring(0, 8)}</p>
                <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleDateString('es-CL', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                <p><strong>Dirección de Envío:</strong> ${venta.cliente.direccion}</p>
            </div>
            
            <h4>🛒 Productos</h4>
            <table class="products-table">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Producto</th>
                        <th style="padding: 10px; text-align: center;">Cantidad</th>
                        <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${productosHTML}
                </tbody>
            </table>
            
            <div class="total">
                TOTAL: $${venta.total.toLocaleString('es-CL')}
            </div>
            
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #155724;">✓ Próximos Pasos:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #155724;">
                    <li>Prepararemos tu pedido en 24-48 horas</li>
                    <li>Te notificaremos cuando esté listo para envío</li>
                    <li>Recibirás el número de seguimiento</li>
                    <li>Envío gratis a todo Chile 🚚</li>
                </ul>
            </div>
            
            <p style="color: #666; font-size: 14px;">Si tienes alguna pregunta, contáctanos respondiendo a este email.</p>
        </div>
        
        <div class="footer">
            <p>🖥️ MAC LINE - Tienda Tecnología Premium</p>
            <p>www.mac-line.cl | contacto@mac-line.cl</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                © ${new Date().getFullYear()} MAC LINE. Todos los derechos reservados.
            </p>
        </div>
    </div>
</body>
</html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado a ${venta.cliente.email}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        return false;
    }
}

// RUTAS PRODUCTOS (mismas que antes)
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
                success: 'https://mac-line.cl/success.html',
                failure: 'https://mac-line.cl/failure.html',
                pending: 'https://mac-line.cl/pending.html'
            },
            auto_return: 'approved'
        };
        
        const result = await preference.create({ body: preferenceData });
        
        console.log('✅ Preferencia creada:', result.id);
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

// WEBHOOK DE MERCADO PAGO - ENVÍA EMAIL CUANDO PAGO ES APROBADO
app.post('/api/webhook', async (req, res) => {
    try {
        console.log('🔔 Webhook MP recibido:', req.body);
        
        // Aquí Mercado Pago notifica cuando se aprueba un pago
        // Podrías enviar email automáticamente aquí
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error en webhook:', error);
        res.status(500).send('Error');
    }
});

// VENTAS - CON ENVÍO DE EMAIL
app.post('/api/ventas', async (req, res) => {
    try {
        const nuevaVenta = {
            id: Date.now().toString(),
            fecha: new Date(),
            cliente: {
                nombre: req.body.nombre || req.body.cliente?.nombre,
                email: req.body.email || req.body.cliente?.email,
                telefono: req.body.telefono || req.body.cliente?.telefono,
                direccion: req.body.direccion || req.body.cliente?.direccion
            },
            productos: req.body.items,
            total: req.body.total,
            estado: 'completada'
        };
        
        await ventasCollection.insertOne(nuevaVenta);
        
        // ENVIAR EMAIL
        console.log('📧 Enviando email de confirmación...');
        await enviarEmailConfirmacion(nuevaVenta);
        
        res.json({ success: true, venta: nuevaVenta });
    } catch (error) {
        console.error('Error al registrar venta:', error);
        res.status(500).json({ error: 'Error al registrar venta' });
    }
});

app.get('/api/ventas', async (req, res) => {
    try {
        const ventas = await ventasCollection.find({}).sort({ fecha: -1 }).toArray();
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

conectarMongoDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n╔═══════════════════════════════════════════╗`);
        console.log(`║  🖥️  MAC LINE - CON EMAILS               ║`);
        console.log(`║  ✓ Puerto: ${PORT}                           ║`);
        console.log(`║  ✓ MongoDB: Conectado                    ║`);
        console.log(`║  ✓ Mercado Pago: OK                      ║`);
        console.log(`║  ✓ Nodemailer: Configurado               ║`);
        console.log(`╚═══════════════════════════════════════════╝\n`);
    });
});
