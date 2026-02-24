// agregar-capacidades-celulares.js
// Script para agregar capacidades de 128GB a 1TB a todos los celulares

const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
const DB_NAME = 'macline';

async function agregarCapacidadesCelulares() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB');
        
        const db = client.db(DB_NAME);
        const productosCollection = db.collection('productos');
        
        // Definir capacidades estándar para celulares
        const capacidades = [
            { nombre: '128GB', precioIncremental: 0 },
            { nombre: '256GB', precioIncremental: 50000 },
            { nombre: '512GB', precioIncremental: 100000 },
            { nombre: '1TB', precioIncremental: 200000 }
        ];
        
        // Buscar todos los productos de categoría "celulares" (en minúsculas)
        const celulares = await productosCollection.find({ 
            categoria: 'celulares' 
        }).toArray();
        
        console.log(`📱 Encontrados ${celulares.length} celulares`);
        
        let actualizados = 0;
        let yaTenanCapacidades = 0;
        
        for (const celular of celulares) {
            // Verificar si ya tiene las 4 capacidades correctas
            const tieneCapacidadesCompletas = celular.capacidades && 
                                              celular.capacidades.length === 4 &&
                                              celular.capacidades.some(c => c.nombre === '1TB');
            
            if (tieneCapacidadesCompletas) {
                console.log(`⏭️  ${celular.nombre} - Ya tiene capacidades completas`);
                yaTenanCapacidades++;
                continue;
            }
            
            // Actualizar con capacidades
            const resultado = await productosCollection.updateOne(
                { _id: celular._id },
                { 
                    $set: { 
                        capacidades: capacidades
                    } 
                }
            );
            
            if (resultado.modifiedCount > 0) {
                console.log(`✅ ${celular.nombre} - Capacidades actualizadas`);
                actualizados++;
            }
        }
        
        console.log('\n📊 RESUMEN:');
        console.log(`   Total celulares: ${celulares.length}`);
        console.log(`   Ya tenían capacidades: ${yaTenanCapacidades}`);
        console.log(`   Actualizados: ${actualizados}`);
        console.log('\n✅ Proceso completado!');
        
        // Mostrar ejemplo de cómo quedan los precios
        console.log('\n💰 EJEMPLO DE PRECIOS:');
        if (celulares.length > 0) {
            const ejemplo = celulares[0];
            console.log(`   ${ejemplo.nombre}:`);
            console.log(`   - 128GB: $${ejemplo.precio.toLocaleString('es-CL')}`);
            console.log(`   - 256GB: $${(ejemplo.precio + 50000).toLocaleString('es-CL')}`);
            console.log(`   - 512GB: $${(ejemplo.precio + 100000).toLocaleString('es-CL')}`);
            console.log(`   - 1TB: $${(ejemplo.precio + 200000).toLocaleString('es-CL')}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n👋 Desconectado de MongoDB');
    }
}

// Ejecutar
agregarCapacidadesCelulares();
