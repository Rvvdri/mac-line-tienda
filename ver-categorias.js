// ver-categorias.js
// Script para ver qué categorías existen en la BD

const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
const DB_NAME = 'macline';

async function verCategorias() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB\n');
        
        const db = client.db(DB_NAME);
        const productosCollection = db.collection('productos');
        
        // Obtener todas las categorías únicas
        const categorias = await productosCollection.distinct('categoria');
        
        console.log('📊 CATEGORÍAS ENCONTRADAS:');
        console.log('─────────────────────────────');
        categorias.forEach(cat => {
            console.log(`   - ${cat}`);
        });
        console.log('─────────────────────────────');
        
        // Contar productos por categoría
        console.log('\n📦 PRODUCTOS POR CATEGORÍA:');
        console.log('─────────────────────────────');
        for (const cat of categorias) {
            const count = await productosCollection.countDocuments({ categoria: cat });
            console.log(`   ${cat}: ${count} productos`);
        }
        console.log('─────────────────────────────');
        
        // Mostrar algunos ejemplos de productos
        console.log('\n🔍 EJEMPLOS DE PRODUCTOS:');
        console.log('─────────────────────────────');
        for (const cat of categorias.slice(0, 3)) {
            const ejemplos = await productosCollection.find({ categoria: cat }).limit(2).toArray();
            console.log(`\n${cat}:`);
            ejemplos.forEach(p => {
                console.log(`   - ${p.nombre}`);
                console.log(`     Precio: $${p.precio?.toLocaleString('es-CL')}`);
                console.log(`     Capacidades: ${p.capacidades ? p.capacidades.length : 0}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n👋 Desconectado de MongoDB');
    }
}

verCategorias();
