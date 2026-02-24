const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

async function actualizarRutas() {
    let client;
    try {
        console.log('🔄 Conectando a MongoDB...\n');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productos = db.collection('productos');
        
        const todos = await productos.find({}).toArray();
        console.log(`📦 Total productos: ${todos.length}\n`);
        
        let actualizados = 0;
        
        for (const producto of todos) {
            let cambios = {};
            let actualizar = false;
            
            // Actualizar portada
            if (producto.imagenPortada) {
                // Cambiar extensión a .webp
                const nuevaPortada = producto.imagenPortada
                    .replace('/images/', '/imagenes/')
                    .replace(/\.(jpg|jpeg|png)$/i, '.webp');
                
                if (nuevaPortada !== producto.imagenPortada) {
                    cambios.imagenPortada = nuevaPortada;
                    actualizar = true;
                }
            }
            
            // Actualizar galería
            if (producto.imagenes && Array.isArray(producto.imagenes)) {
                const nuevasImagenes = producto.imagenes.map(img => {
                    if (img && typeof img === 'string') {
                        return img
                            .replace('/images/', '/imagenes/')
                            .replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    }
                    return img;
                }).filter(Boolean);
                
                if (JSON.stringify(nuevasImagenes) !== JSON.stringify(producto.imagenes)) {
                    cambios.imagenes = nuevasImagenes;
                    actualizar = true;
                }
            }
            
            if (actualizar) {
                await productos.updateOne(
                    { _id: producto._id },
                    { $set: cambios }
                );
                console.log(`✅ ${producto.nombre}`);
                actualizados++;
            }
        }
        
        console.log(`\n╔════════════════════════════════════════╗`);
        console.log(`║  ✅ ${actualizados} productos actualizados  ║`);
        console.log('╚════════════════════════════════════════╝\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) await client.close();
    }
}

actualizarRutas();
