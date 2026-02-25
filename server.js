const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Configuración básica
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== PRODUCTOS (VITRINA LOCAL) ====================
const productos = [
    { id: 1, nombre: 'iPhone 15 Pro', categoria: 'celulares', descripcion: 'Último modelo de Apple', precio: 900000, stock: 15, emoji: '📱' },
    { id: 2, nombre: 'Samsung Galaxy S24', categoria: 'celulares', descripcion: 'Pantalla AMOLED 6.2"', precio: 875000, stock: 12, emoji: '📱' },
    { id: 8, nombre: 'MacBook Pro 16" M3', categoria: 'computadores', descripcion: '16GB RAM', precio: 2200000, stock: 4, emoji: '💻' },
    { id: 1771387260264, nombre: "MacBook Air M2", categoria: 'computadores', precio: 1290000, emoji: '💻', descripcion: 'Chip M2' }
];

// ==================== RUTAS API ====================

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
    res.json(productos);
});

// Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
    const producto = productos.find(p => p.id == req.params.id);
    if (producto) res.json(producto);
    else res.status(404).json({ error: 'Producto no encontrado' });
});

// ==================== NODEMAILER (ENVÍO DE PEDIDO) ====================
const EMAIL_USER = 'linemac910@gmail.com'; 
const EMAIL_PASSWORD = 'kqlxbwylmztcipco'; // Tu clave de aplicación

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD }
});

app.post('/api/enviar-pedido', async (req, res) => {
    const { nombre, email, telefono, direccion, carrito, total } = req.body;

    const productosHTML = carrito.map(p => `<li>${p.nombre} (x${p.cantidad})</li>`).join('');

    const mailOptions = {
        from: `"Mac Line Store" <${EMAIL_USER}>`,
        to: EMAIL_USER, // Te llega a ti
        subject: `🛒 Nuevo pedido de ${nombre}`,
        html: `
            <h2>Detalles del Cliente</h2>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Dirección:</strong> ${direccion}</p>
            <h3>Productos:</h3>
            <ul>${productosHTML}</ul>
            <p><strong>Total: $${total}</strong></p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, mensaje: "Pedido enviado" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== INICIO DEL SERVIDOR ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor vitrina corriendo en puerto ${PORT}`);
});

// VITAL PARA VERCEL
module.exports = app;