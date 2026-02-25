const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
app.use(express.json());
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
        const itemsHTML = venta.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nombre}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.precio.toLocaleString('es-CL')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
            </tr>
        `).join('');
        
        const mailOptions = {
            from: '"MAC LINE" <' + (process.env.EMAIL_USER || 'noreply@macline.cl') + '>',
            to: EMAIL_DUENO,
            subject: `🎉 Nueva Venta - $${venta.total.toLocaleString('es-CL')} - ${venta.cliente.nombre}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #eee; }
                        .total { background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .cliente-info { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🖥️ MAC LINE</h1>
                            <h2>¡Nueva Venta Recibida!</h2>
                        </div>
                        <div class="content">
                            <div class="total">
                                <h2 style="margin: 0; color: #22c55e;">Total: $${venta.total.toLocaleString('es-CL')}</h2>
                            </div>
                            
                            <div class="cliente-info">
                                <h3>📋 Datos del Cliente:</h3>
                                <p><strong>Nombre:</strong> ${venta.cliente.nombre}</p>
                                <p><strong>Email:</strong> ${venta.cliente.email}</p>
                                <p><strong>Teléfono:</strong> ${venta.cliente.telefono}</p>
                                <p><strong>Dirección:</strong> ${venta.cliente.direccion}</p>
                            </div>
                            
                            <h3>🛒 Productos Comprados:</h3>
                            <table>
                                <thead>
                                    <tr style="background: #f9fafb;">
                                        <th style="padding: 10px; text-align: left;">Producto</th>
                                        <th style="padding: 10px; text-align: center;">Cant.</th>
                                        <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHTML}
                                </tbody>
                            </table>
                            
                            <p style="color: #666; margin-top: 30px;">
                                <small>Fecha: ${new Date().toLocaleString('es-CL')}</small><br>
                                <small>ID Venta: ${venta._id}</small>
                            </p>
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
        const itemsHTML = venta.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nombre}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
            </tr>
        `).join('');
        
        const mailOptions = {
            from: '"MAC LINE" <' + (process.env.EMAIL_USER || 'noreply@macline.cl') + '>',
            to: venta.cliente.email,
            subject: `✅ Confirmación de Compra - MAC LINE`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: white; padding: 30px; border: 1px solid #eee; }
                        .total { background: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🖥️ MAC LINE</h1>
                            <h2>¡Gracias por tu compra!</h2>
                        </div>
                        <div class="content">
                            <p>Hola <strong>${venta.cliente.nombre}</strong>,</p>
                            <p>Tu pago ha sido procesado correctamente. Aquí están los detalles de tu pedido:</p>
                            
                            <table>
                                <thead>
                                    <tr style="background: #f9fafb;">
                                        <th style="padding: 10px; text-align: left;">Producto</th>
                                        <th style="padding: 10px; text-align: center;">Cantidad</th>
                                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHTML}
                                </tbody>
                            </table>
                            
                            <div class="total">
                                <h2 style="margin: 0; color: #16a34a;">Total Pagado: $${venta.total.toLocaleString('es-CL')}</h2>
                            </div>
                            
                            <p><strong>📦 Envío a:</strong><br>${venta.cliente.direccion}</p>
                            
                            <p style="margin-top: 30px;">Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>
                            
                            <p style="color: #666; margin-top: 30px;">
                                <small>Número de orden: ${venta._id}</small><br>
                                <small>Fecha: ${new Date().toLocaleString('es-CL')}</small>
                            </p>
                            
                            <p style="text-align: center; margin-top: 40px;">
                                <a href="https://mac-line.cl" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Volver a la tienda</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado al cliente:', venta.cliente.email);
        
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
