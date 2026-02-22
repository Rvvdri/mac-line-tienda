// Script para diagnosticar problemas con productos
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

async function diagnosticar() {
    let client;
    try {
        console.log('🔍 Conectando a MongoDB...\n');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        // 1. Contar total de productos
        const total = await productosCollection.countDocuments();
        console.log(`📦 Total productos en BD: ${total}\n`);
        
        // 2. Buscar productos de iPhone 17
        console.log('🔎 Buscando productos iPhone 17...\n');
        
        const iphone17ProMax = await productosCollection.findOne({ nombre: /iPhone 17 Pro Max/i });
        const iphone17Pro = await productosCollection.findOne({ nombre: /iPhone 17 Pro/i });
        const iphone17 = await productosCollection.findOne({ nombre: /iPhone 17$/i });
        
        console.log('iPhone 17 Pro Max:', iphone17ProMax ? `✅ EXISTE (ID: ${iphone17ProMax.id || iphone17ProMax._id})` : '❌ NO EXISTE');
        console.log('iPhone 17 Pro:', iphone17Pro ? `✅ EXISTE (ID: ${iphone17Pro.id || iphone17Pro._id})` : '❌ NO EXISTE');
        console.log('iPhone 17:', iphone17 ? `✅ EXISTE (ID: ${iphone17.id || iphone17._id})` : '❌ NO EXISTE');
        
        console.log('\n');
        
        // 3. Listar TODOS los productos con "iPhone 17" en el nombre
        const todosIphone17 = await productosCollection.find({ 
            nombre: { $regex: 'iPhone 17', $options: 'i' } 
        }).toArray();
        
        console.log(`📱 Productos con "iPhone 17" en el nombre: ${todosIphone17.length}\n`);
        
        todosIphone17.forEach((p, index) => {
            console.log(`${index + 1}. ${p.nombre}`);
            console.log(`   ID: ${p.id || p._id}`);
            console.log(`   Categoría: ${p.categoria}`);
            console.log(`   Precio: $${p.precio?.toLocaleString('es-CL')}`);
            console.log(`   Variantes: ${p.tieneVariantes ? 'Sí ✅' : 'No ❌'}`);
            console.log(`   Imágenes: Portada: ${p.imagenPortada ? '✅' : '❌'}, Galería: ${p.imagenes?.length || 0}`);
            console.log(`   URL: http://localhost:3000/producto.html?id=${p.id || p._id}\n`);
        });
        
        // 4. Verificar estructura de IDs
        console.log('🔑 Verificando estructura de IDs...\n');
        
        const muestras = await productosCollection.find({}).limit(5).toArray();
        
        muestras.forEach((p, index) => {
            console.log(`${index + 1}. ${p.nombre}`);
            console.log(`   _id (MongoDB): ${p._id}`);
            console.log(`   id (custom): ${p.id || 'NO TIENE'}`);
            console.log('');
        });
        
        // 5. Contar productos por categoría
        console.log('📊 Productos por categoría:\n');
        
        const categorias = await productosCollection.aggregate([
            { $group: { _id: '$categoria', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
        
        categorias.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

diagnosticar();
