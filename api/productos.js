const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('macline');
    cachedDb = db;
    return db;
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const db = await connectToDatabase();

        if (req.method === 'GET') {
            // GET /api/productos o GET /api/productos?id=XXX
            // Extraer ID de query o de URL path
            let productId = req.query.id;
            
            // Si no está en query, intentar extraer del path
            if (!productId && req.url) {
                const match = req.url.match(/\/productos\/(\d+)/);
                if (match) {
                    productId = match[1];
                }
            }
            
            if (productId) {
                const producto = await db.collection('productos').findOne(
                    { id: parseInt(productId) },
                    { projection: { _id: 0 } }
                );
                if (!producto) {
                    return res.status(404).json({ error: 'Producto no encontrado' });
                }
                return res.json(producto);
            } else {
                const productos = await db.collection('productos')
                    .find({}, { projection: { _id: 0 } })
                    .toArray();
                return res.json(productos);
            }
        }

        if (req.method === 'POST') {
            const nuevoProducto = {
                ...req.body,
                id: Date.now()
            };
            await db.collection('productos').insertOne(nuevoProducto);
            return res.json(nuevoProducto);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const cambios = { ...req.body };
            delete cambios._id;

            const result = await db.collection('productos').findOneAndUpdate(
                { id: parseInt(id) },
                { $set: cambios },
                { returnDocument: 'after', projection: { _id: 0 } }
            );

            if (!result) {
                return res.status(404).json({ error: 'No encontrado' });
            }
            return res.json(result);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            const result = await db.collection('productos').findOneAndDelete(
                { id: parseInt(id) }
            );
            if (!result) {
                return res.status(404).json({ error: 'No encontrado' });
            }
            return res.json({ mensaje: 'Eliminado' });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error del servidor', details: error.message });
    }
};
