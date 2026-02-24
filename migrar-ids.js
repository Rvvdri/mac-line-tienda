// migrar-ids.js - Convertir IDs numéricos a strings en MongoDB

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

async function migrarIDs() {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('macline');
    const productosCollection = db.collection('productos');
    
    console.log('🔄 Iniciando migración de IDs...');
    
    // Buscar todos los productos
    const productos = await productosCollection.find({}).toArray();
    console.log(`📦 Total productos encontrados: ${productos.length}`);
    
    let actualizados = 0;
    
    for (const producto of productos) {
        // Si el ID es un número, convertirlo a string
        if (typeof producto.id === 'number') {
            await productosCollection.updateOne(
                { _id: producto._id },
                { $set: { id: String(producto.id) } }
            );
            console.log(`✅ Convertido ID ${producto.id} → "${producto.id}" (${producto.nombre})`);
            actualizados++;
        }
    }
    
    console.log(`\n✨ Migración completada: ${actualizados} productos actualizados`);
    
    await client.close();
}

migrarIDs().catch(console.error);
