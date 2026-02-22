// Script para borrar TODOS los productos de televisores de MongoDB
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

async function borrarTelevisores() {
    let client;
    try {
        console.log('📺 Conectando a MongoDB...');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        // Borrar todos los productos con categoría "televisores"
        const resultado = await productosCollection.deleteMany({ categoria: 'televisores' });
        
        console.log(`\n✅ Productos de televisores eliminados: ${resultado.deletedCount}`);
        console.log('🗑️  Categoría "televisores" completamente eliminada de la base de datos.\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

borrarTelevisores();
