const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
// Aumentamos el límite a 50MB para que acepte las 6 imágenes WebP sin problemas
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== NODEMAILER ====================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'linemac910@gmail.com',
        pass: 'kqlxbwylmztcipco'
    }
});

// Email del dueño (donde llegarán las notificaciones de venta)
const EMAIL_DUENO = 'linemac910@gmail.com';

// ==================== MERCADO PAGO ====================
// CONFIGURACIÓN CON CREDENCIALES REALES
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-1539674871672378-021917-5d3634d0ef2f478d31ea2f5db8abeb5d-3208244091'
});
console.log('✅ Mercado Pago configurado correctamente');

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
        const idBuscado = req.params.id;
        console.log('🔍 Buscando producto con ID:', idBuscado);
        
        let producto = null;
        
        // 1. Buscar por campo 'id' como string
        producto = await productosCollection.findOne({ id: idBuscado });
        
        // 2. Si no existe, buscar por 'id' como número
        if (!producto && !isNaN(idBuscado)) {
            producto = await productosCollection.findOne({ id: Number(idBuscado) });
        }
        
        // 3. Si no existe, intentar buscar por _id de MongoDB (ObjectId)
        if (!producto) {
            try {
                producto = await productosCollection.findOne({ _id: new ObjectId(idBuscado) });
            } catch (e) {
                // Si no es un ObjectId válido, intentar como string
                producto = await productosCollection.findOne({ _id: idBuscado });
            }
        }
        
        if (!producto) {
            console.log('❌ Producto no encontrado con ID:', idBuscado);
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        console.log('✅ Producto encontrado:', producto.nombre);
        res.json(producto);
    } catch (error) {
        console.error('❌ Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// POST - Agregar nuevo producto
app.post('/api/productos', async (req, res) => {
    try {
        console.log('📦 Creando producto:', req.body.nombre);
        
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
            colores: req.body.colores || [],
            capacidades: req.body.capacidades || [],
            createdAt: new Date()
        };
        
        const result = await productosCollection.insertOne(nuevoProducto);
        
        console.log('✅ Producto creado con ID:', result.insertedId);
        
        res.status(201).json({ 
            success: true, 
            mensaje: 'Producto agregado exitosamente',
            producto: nuevoProducto 
        });
        
    } catch (error) {
        console.error('❌ Error al agregar producto:', error);
        res.status(500).json({ 
            error: 'Error al agregar producto',
            details: error.message 
        });
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

// En server.js, asegúrate de que guardas el cuerpo completo (req.body)
app.post('/api/ventas', async (req, res) => {
    try {
        const nuevaVenta = {
            ...req.body, // Aquí ya vienen nombre, ciudad, comuna, calle, items, etc.
            fecha: new Date(),
            estado: 'pendiente'
        };
        await db.collection('ventas').insertOne(nuevaVenta);
        // ... (aquí va tu código de envío de mail que ya funciona)
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== MERCADO PAGO - CREAR PREFERENCIA ====================

app.post('/api/crear-preferencia', async (req, res) => {
    try {
        const { cliente, items, total } = req.body;
        
        console.log('📦 Creando preferencia de Mercado Pago...');
        console.log('👤 Cliente:', cliente);
        console.log('🛒 Items:', items);
        console.log('💰 Total:', total);
        
        const preference = new Preference(client);
        
        // Crear items en formato de Mercado Pago
        const mpItems = items.map(item => ({
            title: String(item.nombre),
            unit_price: Number(item.precio),
            quantity: Number(item.cantidad),
            currency_id: 'CLP'
        }));
        
        console.log('📋 Items formateados:', mpItems);
        
        // Generar referencia única
        const externalReference = `ORDER-${Date.now()}`;
        
        // Obtener host correctamente
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;
        
        console.log('🌐 Base URL:', baseUrl);
        
        // Crear preferencia con configuración mínima
        const body = {
            items: mpItems,
            payer: {
                name: String(cliente.nombre),
                email: String(cliente.email)
            },
            back_urls: {
                success: `${baseUrl}/pago-exitoso`,
                failure: `${baseUrl}/pago-fallido`,
                pending: `${baseUrl}/pago-pendiente`
            },
            statement_descriptor: 'MAC LINE',
            external_reference: externalReference,
            payment_methods: {
                installments: 12,  // Hasta 12 cuotas
                default_installments: 1  // Por defecto sin cuotas
            }
        };
        
        console.log('📤 Body enviado a Mercado Pago:', JSON.stringify(body, null, 2));
        console.log('🔧 Creando preferencia en Mercado Pago...');
        
        const response = await preference.create({ body });
        
        console.log('✅ Preferencia de Mercado Pago creada:', response.id);
        console.log('🔗 Init point:', response.init_point);
        
        // GUARDAR VENTA EN BD CON REFERENCIA
        const venta = {
            cliente: cliente,
            items: items,
            total: total,
            fecha: new Date(),
            estado: 'pendiente',
            mercadopago: {
                preference_id: response.id,
                external_reference: externalReference
            }
        };
        
        const resultado = await ventasCollection.insertOne(venta);
        console.log('💾 Venta guardada en BD:', resultado.insertedId);
        
        res.json({
            id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        });
        
    } catch (error) {
        console.error('❌ ERROR COMPLETO:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error cause:', error.cause);
        
        // Si hay detalles del error de Mercado Pago
        if (error.cause && error.cause.length > 0) {
            console.error('❌ Detalles de Mercado Pago:', error.cause);
        }
        
        res.status(500).json({ 
            error: 'Error al crear preferencia de pago',
            details: error.message,
            mpError: error.error || null
        });
    }
});

// ==================== WEBHOOK MERCADO PAGO ====================

app.post('/api/webhook-mercadopago', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        console.log('📬 Webhook recibido:', type, data);
        
        if (type === 'payment') {
            const paymentId = data.id;
            console.log('💳 Procesando pago ID:', paymentId);
            
            // Obtener información del pago desde Mercado Pago
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: paymentId });
            
            console.log('💳 Estado del pago:', paymentInfo.status);
            console.log('💳 External reference:', paymentInfo.external_reference);
            
            if (paymentInfo.status === 'approved') {
                // Buscar la venta por external_reference
                const venta = await ventasCollection.findOne({ 
                    'mercadopago.external_reference': paymentInfo.external_reference 
                });
                
                if (venta) {
                    console.log('✅ Pago APROBADO - Enviando emails...');
                    
                    // ENVIAR EMAIL AL DUEÑO
                    await enviarEmailDueno(venta);
                    
                    // ENVIAR EMAIL AL CLIENTE
                    await enviarEmailCliente(venta);
                    
                    // Actualizar estado en MongoDB
                    await ventasCollection.updateOne(
                        { _id: venta._id },
                        { 
                            $set: { 
                                estado: 'pagado', 
                                'mercadopago.payment_id': paymentId,
                                'mercadopago.status': 'approved',
                                'mercadopago.fecha_pago': new Date()
                            } 
                        }
                    );
                    
                    console.log('✅ Venta actualizada y emails enviados');
                } else {
                    console.log('⚠️ No se encontró la venta con referencia:', paymentInfo.external_reference);
                }
            }
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Error en webhook:', error);
        res.status(500).send('Error');
    }
});

// ==================== FUNCIONES DE EMAIL ====================

async function enviarEmailDueno(venta) {
    try {
        const c = venta.cliente;

        const itemsHTML = venta.items.map(item => {
            const variantes = [item.color, item.capacidad].filter(Boolean).join(' · ');
            return `
            <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.nombre}</strong>
                    ${variantes ? `<br><span style="background:#ede9fe; color:#6d28d9; font-size:12px; font-weight:600; padding:2px 8px; border-radius:10px;">${variantes}</span>` : ''}
                </td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right;">$${Number(item.precio).toLocaleString('es-CL')}</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${(Number(item.precio) * Number(item.cantidad)).toLocaleString('es-CL')}</td>
            </tr>
        `}).join('');

        // Armar dirección completa (campos exactos del formulario index.html)
        const direccionCompleta = [
            c.direccion,
            c.numero ? `N° ${c.numero}` : '',
            c.complemento || '',
            c.comuna,
            c.region
        ].filter(Boolean).join(', ');

        const mailOptions = {
            from: '"MAC LINE" <linemac910@gmail.com>',
            to: EMAIL_DUENO,
            subject: `🎉 Nueva Venta - $${Number(venta.total).toLocaleString('es-CL')} - ${c.nombre}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
                        .container { max-width: 620px; margin: 0 auto; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
                        .header h1 { margin: 0 0 5px; font-size: 26px; }
                        .header h2 { margin: 0; font-size: 18px; font-weight: 400; opacity: 0.9; }
                        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 12px 12px; }
                        .badge-total { background: #dcfce7; border: 2px solid #22c55e; padding: 18px; border-radius: 10px; text-align: center; margin-bottom: 25px; }
                        .badge-total h2 { margin: 0; color: #16a34a; font-size: 26px; }
                        .section { background: #fef9ec; border-left: 4px solid #f59e0b; padding: 18px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
                        .section h3 { margin: 0 0 12px; color: #92400e; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
                        .section p { margin: 5px 0; color: #333; font-size: 14px; }
                        .section p strong { color: #111; min-width: 140px; display: inline-block; }
                        .entrega-badge { display: inline-block; background: #ede9fe; color: #6d28d9; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-top: 4px; }
                        table { width: 100%; border-collapse: collapse; margin: 5px 0 10px; }
                        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 13px; color: #555; }
                        td { font-size: 14px; color: #333; }
                        .footer { text-align: center; margin-top: 25px; color: #999; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🖥️ MAC LINE</h1>
                            <h2>¡Nueva Venta Recibida!</h2>
                        </div>
                        <div class="content">

                            <div class="badge-total">
                                <h2>💰 Total: $${Number(venta.total).toLocaleString('es-CL')}</h2>
                            </div>

                            <div class="section">
                                <h3>👤 Datos del Cliente</h3>
                                <p><strong>Nombre completo:</strong> ${c.nombre}</p>
                                <p><strong>Email:</strong> ${c.email}</p>
                                <p><strong>Teléfono:</strong> ${c.telefono || '—'}</p>
                            </div>

                            <div class="section">
                                <h3>📦 Dirección de Envío</h3>
                                <p><strong>Región:</strong> ${c.region || '—'}</p>
                                <p><strong>Comuna:</strong> ${c.comuna || '—'}</p>
                                <p><strong>Calle / Avenida:</strong> ${c.direccion || '—'}</p>
                                <p><strong>Número:</strong> ${c.numero || '—'}</p>
                                ${c.complemento ? `<p><strong>Depto / Casa / Of.:</strong> ${c.complemento}</p>` : ''}
                                <p><strong>Dirección completa:</strong> ${direccionCompleta}</p>
                                <p><strong>Método de entrega:</strong> <span class="entrega-badge">${c.metodoEntrega || '—'}</span></p>
                            </div>

                            <h3 style="color: #374151; margin-bottom: 5px;">🛒 Productos Comprados</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th style="padding: 10px; text-align: left;">Producto</th>
                                        <th style="padding: 10px; text-align: center;">Cant.</th>
                                        <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHTML}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" style="padding: 12px 10px; text-align: right; font-weight: bold; color: #555;">TOTAL:</td>
                                        <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #16a34a;">$${Number(venta.total).toLocaleString('es-CL')}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div class="footer">
                                <p>Fecha: ${new Date().toLocaleString('es-CL')} &nbsp;|&nbsp; ID Orden: ${venta._id}</p>
                                <p>MAC LINE — mac-line.cl</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado al dueño:', EMAIL_DUENO);

    } catch (error) {
        console.error('❌ Error enviando email al dueño:', error);
    }
}

async function enviarEmailCliente(venta) {
    try {
        const c = venta.cliente;

        const itemsHTML = venta.items.map(item => {
            const variantes = [item.color, item.capacidad].filter(Boolean).join(' · ');
            return `
            <tr>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0;">
                    <strong>${item.nombre}</strong>
                    ${variantes ? `<br><span style="background:#ede9fe; color:#6d28d9; font-size:12px; font-weight:600; padding:2px 8px; border-radius:10px;">${variantes}</span>` : ''}
                </td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.cantidad}</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: bold; color: #16a34a;">$${(Number(item.precio) * Number(item.cantidad)).toLocaleString('es-CL')}</td>
            </tr>
        `}).join('');

        // Armar dirección completa (campos exactos del formulario index.html)
        const partesDireccion = [
            c.direccion,
            c.numero ? `N° ${c.numero}` : '',
            c.complemento || '',
            c.comuna,
            c.region
        ].filter(Boolean);

        const mailOptions = {
            from: '"MAC LINE" <linemac910@gmail.com>',
            to: c.email,
            subject: `✅ Tu compra en MAC LINE fue confirmada`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
                        .container { max-width: 620px; margin: 0 auto; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 35px 30px; text-align: center; border-radius: 12px 12px 0 0; }
                        .header h1 { margin: 0 0 5px; font-size: 26px; }
                        .header p { margin: 0; opacity: 0.9; font-size: 15px; }
                        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 12px 12px; }
                        .saludo { font-size: 16px; color: #333; margin-bottom: 20px; }
                        .badge-ok { background: #dcfce7; border: 2px solid #22c55e; border-radius: 10px; padding: 15px 20px; margin-bottom: 25px; display: flex; align-items: center; gap: 10px; }
                        .badge-ok span { font-size: 22px; }
                        .badge-ok p { margin: 0; color: #15803d; font-weight: 600; font-size: 15px; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th { background: #f8fafc; padding: 10px; text-align: left; font-size: 13px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
                        .total-row td { padding: 14px 10px; background: #f0fdf4; font-weight: bold; font-size: 16px; }
                        .envio-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
                        .envio-box h3 { margin: 0 0 10px; color: #1e40af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                        .envio-box p { margin: 4px 0; font-size: 14px; color: #374151; }
                        .metodo-badge { display: inline-block; background: #ede9fe; color: #6d28d9; padding: 3px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 13px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
                        .nota { font-size: 13px; color: #888; margin-top: 20px; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🖥️ MAC LINE</h1>
                            <p>Confirmación de Compra</p>
                        </div>
                        <div class="content">

                            <p class="saludo">Hola <strong>${c.nombre}</strong>, ¡gracias por tu compra!</p>

                            <div class="badge-ok">
                                <span>✅</span>
                                <p>Tu pago fue aprobado y tu pedido está en proceso.</p>
                            </div>

                            <h3 style="color: #374151; margin-bottom: 8px;">🛒 Resumen de tu pedido</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th style="padding:10px; text-align:left;">Producto</th>
                                        <th style="padding:10px; text-align:center;">Cant.</th>
                                        <th style="padding:10px; text-align:right;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHTML}
                                </tbody>
                                <tfoot>
                                    <tr class="total-row">
                                        <td colspan="2" style="padding:14px 10px; text-align:right; color:#555;">TOTAL PAGADO:</td>
                                        <td style="padding:14px 10px; text-align:right; color:#16a34a;">$${Number(venta.total).toLocaleString('es-CL')}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div class="envio-box">
                                <h3>📦 Información de Envío</h3>
                                ${partesDireccion.length > 0 ? partesDireccion.map(p => `<p>${p}</p>`).join('') : '<p>—</p>'}
                                <p style="margin-top:10px;"><strong>Método de entrega:</strong> <span class="metodo-badge">${c.metodoEntrega || '—'}</span></p>
                            </div>

                            <p class="nota">
                                Nos pondremos en contacto contigo pronto para coordinar la entrega.<br>
                                Si tienes alguna consulta, escríbenos a <a href="mailto:${EMAIL_DUENO}" style="color:#667eea;">${EMAIL_DUENO}</a>.
                            </p>

                            <div class="footer">
                                <a href="https://mac-line.cl" class="btn">Volver a la tienda</a>
                                <p style="color:#aaa; font-size:12px; margin-top:20px;">
                                    N° de Orden: ${venta._id}<br>
                                    Fecha: ${new Date().toLocaleString('es-CL')}
                                </p>
                            </div>

                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado al cliente:', c.email);

    } catch (error) {
        console.error('❌ Error enviando email al cliente:', error);
    }
}

// ==================== PÁGINAS DE RESULTADO ====================

app.get('/pago-exitoso', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Pago Exitoso - MAC LINE</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .container {
                    background: white;
                    padding: 3rem;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 500px;
                }
                .icon {
                    font-size: 5rem;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #22c55e;
                    margin-bottom: 1rem;
                }
                p {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 10px;
                    text-decoration: none;
                    display: inline-block;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">✅</div>
                <h1>¡Pago Exitoso!</h1>
                <p>Tu compra ha sido procesada correctamente. Recibirás un correo con los detalles de tu pedido.</p>
                <p><strong>¡Gracias por tu compra en MAC LINE!</strong></p>
                <a href="/" class="btn">Volver a la tienda</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/pago-fallido', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Pago Fallido - MAC LINE</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                }
                .container {
                    background: white;
                    padding: 3rem;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 500px;
                }
                .icon {
                    font-size: 5rem;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #ef4444;
                    margin-bottom: 1rem;
                }
                p {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 10px;
                    text-decoration: none;
                    display: inline-block;
                    font-weight: 600;
                    margin: 0.5rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">❌</div>
                <h1>Pago No Procesado</h1>
                <p>No pudimos procesar tu pago. Por favor, intenta nuevamente.</p>
                <a href="/" class="btn">Volver a la tienda</a>
                <a href="javascript:history.back()" class="btn">Reintentar pago</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/pago-pendiente', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Pago Pendiente - MAC LINE</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }
                .container {
                    background: white;
                    padding: 3rem;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 500px;
                }
                .icon {
                    font-size: 5rem;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #3b82f6;
                    margin-bottom: 1rem;
                }
                p {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .btn {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 10px;
                    text-decoration: none;
                    display: inline-block;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">⏳</div>
                <h1>Pago Pendiente</h1>
                <p>Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
                <p><strong>Gracias por tu paciencia.</strong></p>
                <a href="/" class="btn">Volver a la tienda</a>
            </div>
        </body>
        </html>
    `);
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
