const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

async function configurarImagenesIPhone17ProMax() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Conectando a MongoDB...');
        await client.connect();
        console.log('✅ Conectado\n');
        
        const db = client.db('macline');
        const producto = await db.collection('productos').findOne({ nombre: 'iPhone 17 Pro Max' });
        
        if (!producto) {
            console.log('❌ No se encontró iPhone 17 Pro Max en la base de datos');
            return;
        }
        
        const productoId = producto.id;
        console.log(`📱 iPhone 17 Pro Max encontrado`);
        console.log(`   ID: ${productoId}\n`);
        
        // Rutas de las imágenes
        const carpetaImagenes = path.join(__dirname, 'public', 'images', 'productos');
        
        // Verificar si existen las imágenes originales
        const imagenesOriginales = [
            'iphone_17_pro_max_1.png',
            'iphone_17_pro_max_2.png',
            'iphone_17_pro_max_3.png',
            'iphone_17_pro_max_4.png',
            'iphone_17_pro_max_5.png'
        ];
        
        console.log('🔍 Buscando imágenes...\n');
        
        let todasExisten = true;
        for (const img of imagenesOriginales) {
            const rutaCompleta = path.join(carpetaImagenes, img);
            if (fs.existsSync(rutaCompleta)) {
                console.log(`✅ ${img}`);
            } else {
                console.log(`❌ ${img} - NO ENCONTRADA`);
                todasExisten = false;
            }
        }
        
        if (!todasExisten) {
            console.log('\n⚠️  Faltan archivos. Asegúrate de que todas las imágenes estén en:');
            console.log(`   ${carpetaImagenes}`);
            return;
        }
        
        console.log('\n📝 Renombrando archivos...\n');
        
        // Renombrar archivos
        const renombramientos = [
            { viejo: 'iphone_17_pro_max_1.png', nuevo: `producto-${productoId}-portada.png` },
            { viejo: 'iphone_17_pro_max_2.png', nuevo: `producto-${productoId}-1.png` },
            { viejo: 'iphone_17_pro_max_3.png', nuevo: `producto-${productoId}-2.png` },
            { viejo: 'iphone_17_pro_max_4.png', nuevo: `producto-${productoId}-3.png` },
            { viejo: 'iphone_17_pro_max_5.png', nuevo: `producto-${productoId}-4.png` }
        ];
        
        for (const { viejo, nuevo } of renombramientos) {
            const rutaVieja = path.join(carpetaImagenes, viejo);
            const rutaNueva = path.join(carpetaImagenes, nuevo);
            
            fs.renameSync(rutaVieja, rutaNueva);
            console.log(`✅ ${viejo} → ${nuevo}`);
        }
        
        // Copiar la última imagen para tener 5 en la galería
        const ultimaImagen = path.join(carpetaImagenes, `producto-${productoId}-4.png`);
        const quintaImagen = path.join(carpetaImagenes, `producto-${productoId}-5.png`);
        fs.copyFileSync(ultimaImagen, quintaImagen);
        console.log(`✅ Creada imagen 5 (copia de imagen 4)`);
        
        console.log('\n💾 Actualizando MongoDB...\n');
        
        // Actualizar MongoDB con las rutas
        const imagenPortada = `/images/productos/producto-${productoId}-portada.png`;
        const imagenes = [
            `/images/productos/producto-${productoId}-1.png`,
            `/images/productos/producto-${productoId}-2.png`,
            `/images/productos/producto-${productoId}-3.png`,
            `/images/productos/producto-${productoId}-4.png`,
            `/images/productos/producto-${productoId}-5.png`
        ];
        
        await db.collection('productos').updateOne(
            { _id: producto._id },
            { 
                $set: { 
                    imagenPortada: imagenPortada,
                    imagenes: imagenes
                } 
            }
        );
        
        console.log('✅ MongoDB actualizado\n');
        console.log('═'.repeat(70));
        console.log('🎉 ¡LISTO!');
        console.log('═'.repeat(70));
        console.log('El iPhone 17 Pro Max ahora tiene sus imágenes configuradas.');
        console.log('Reinicia el servidor (npm start) para ver los cambios.\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

configurarImagenesIPhone17ProMax();
