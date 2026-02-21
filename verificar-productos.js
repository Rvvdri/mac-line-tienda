// Script para verificar productos en MongoDB
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

async function verificarProductos() {
    let client;
    try {
        console.log('🔍 Conectando a MongoDB...');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        // Contar productos
        const total = await productosCollection.countDocuments();
        console.log(`\n📦 Total productos: ${total}\n`);
        
        // Mostrar primeros 10 productos con sus IDs
        const productos = await productosCollection.find({}).limit(10).toArray();
        
        console.log('🔗 Primeros 10 productos (ID y nombre):\n');
        productos.forEach((p, index) => {
            console.log(`${index + 1}. ID: ${p.id || p._id}`);
            console.log(`   Nombre: ${p.nombre}`);
            console.log(`   Categoría: ${p.categoria}`);
            console.log(`   URL: http://localhost:3000/producto.html?id=${p.id || p._id}\n`);
        });
        
        // Verificar si tienen variantes
        const conVariantes = await productosCollection.countDocuments({ tieneVariantes: true });
        console.log(`✅ Productos con variantes: ${conVariantes}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

verificarProductos();
