const { MongoClient } = require('mongodb');
const axios = require('axios');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const MP_API_URL = 'https://api.mercadopago.com';

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const client = await MongoClient.connect(MONGODB_URI);
    cachedDb = client.db('macline');
    return cachedDb;
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { nombre, email, telefono, direccion, items, total } = req.body;

        if (!nombre || !email || !items || !total) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos'
            });
        }

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
                success: `${BASE_URL}/success.html`,
                failure: `${BASE_URL}/failed.html`,
                pending: `${BASE_URL}/pending.html`
            },
            auto_return: 'approved',
            notification_url: `${BASE_URL}/api/webhook`
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

        // Guardar venta en BD
        const db = await connectToDatabase();
        const venta = {
            id: Date.now(),
            cliente: { nombre, email, telefono, direccion },
            items,
            total,
            estado: 'pendiente',
            mpPreferenceId: response.data.id,
            mpInitPoint: response.data.init_point,
            fechaCreacion: new Date().toISOString()
        };
        await db.collection('ventas').insertOne(venta);

        return res.json({
            success: true,
            enlacePago: response.data.init_point,
            preferenceId: response.data.id
        });

    } catch (error) {
        console.error('Error Mercado Pago:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: error.response?.data?.message || 'Error al procesar pago'
        });
    }
};
