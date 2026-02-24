// Script para actualizar las rutas de imágenes en MongoDB a .webp
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

async function actualizarRutasWebP() {
    let client;
    try {
        console.log('🔄 Conectando a MongoDB...\n');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        const productos = await productosCollection.find({}).toArray();
        console.log(`📦 Total productos: ${productos.length}\n`);
        
        let actualizados = 0;
        
        for (const producto of productos) {
            let actualizar = false;
            const update = {};
            
            // Actualizar imagenPortada
            if (producto.imagenPortada && !producto.imagenPortada.endsWith('.webp')) {
                const rutaWebP = producto.imagenPortada.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                update.imagenPortada = rutaWebP;
                actualizar = true;
            }
            
            // Actualizar imagenes array
            if (producto.imagenes && Array.isArray(producto.imagenes)) {
                const imagenesWebP = producto.imagenes.map(img => {
                    if (img && typeof img === 'string' && !img.endsWith('.webp')) {
                        return img.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    }
                    return img;
                }).filter(Boolean);
                
                if (JSON.stringify(imagenesWebP) !== JSON.stringify(producto.imagenes)) {
                    update.imagenes = imagenesWebP;
                    actualizar = true;
                }
            }
            
            if (actualizar) {
                await productosCollection.updateOne(
                    { _id: producto._id },
                    { $set: update }
                );
                console.log(`✅ ${producto.nombre}`);
                actualizados++;
            }
        }
        
        console.log(`\n╔════════════════════════════════════════╗`);
        console.log(`║  ✅ ${actualizados} productos actualizados      ║`);
        console.log(`╚════════════════════════════════════════╝\n`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

actualizarRutasWebP();
