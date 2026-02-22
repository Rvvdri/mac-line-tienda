// Script INTELIGENTE que agrega variantes automáticamente a productos existentes
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

// Base de datos de variantes REALES por producto
const VARIANTES_DB = {
    // ========== IPHONES ==========
    'iPhone 17 Pro Max': {
        colores: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        capacidades: [
            { gb: 256, incremento: 0 },       // Precio base
            { gb: 512, incremento: 200000 },  // +$200.000
            { gb: 1024, incremento: 400000 }  // +$400.000 (1TB)
        ]
    },
    'iPhone 17 Pro': {
        colores: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 150000 },
            { gb: 512, incremento: 300000 },
            { gb: 1024, incremento: 450000 }
        ]
    },
    'iPhone 17': {
        colores: ['Negro', 'Azul', 'Verde', 'Amarillo', 'Rosa'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 100000 },
            { gb: 512, incremento: 220000 }
        ]
    },
    'iPhone 16 Pro Max': {
        colores: ['Titanio Negro', 'Titanio Blanco', 'Titanio Natural', 'Titanio Desierto'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 180000 },
            { gb: 1024, incremento: 380000 }
        ]
    },
    'iPhone 16 Pro': {
        colores: ['Titanio Negro', 'Titanio Blanco', 'Titanio Natural', 'Titanio Desierto'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 140000 },
            { gb: 512, incremento: 280000 },
            { gb: 1024, incremento: 420000 }
        ]
    },
    'iPhone 16 Plus': {
        colores: ['Negro', 'Blanco', 'Rosa', 'Verde Azulado', 'Ultramarino'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 110000 },
            { gb: 512, incremento: 240000 }
        ]
    },
    'iPhone 16': {
        colores: ['Negro', 'Blanco', 'Rosa', 'Verde Azulado', 'Ultramarino'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 90000 },
            { gb: 512, incremento: 210000 }
        ]
    },
    'iPhone 15 Pro Max': {
        colores: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 200000 },
            { gb: 1024, incremento: 400000 }
        ]
    },
    'iPhone 15 Pro': {
        colores: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 150000 },
            { gb: 512, incremento: 300000 },
            { gb: 1024, incremento: 450000 }
        ]
    },
    'iPhone 15 Plus': {
        colores: ['Negro', 'Azul', 'Verde', 'Amarillo', 'Rosa'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 120000 },
            { gb: 512, incremento: 250000 }
        ]
    },
    'iPhone 15': {
        colores: ['Negro', 'Azul', 'Verde', 'Amarillo', 'Rosa'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 100000 },
            { gb: 512, incremento: 220000 }
        ]
    },
    'iPhone 14 Pro Max': {
        colores: ['Morado Oscuro', 'Dorado', 'Plata', 'Negro Espacial'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 130000 },
            { gb: 512, incremento: 260000 },
            { gb: 1024, incremento: 390000 }
        ]
    },
    'iPhone 14 Pro': {
        colores: ['Morado Oscuro', 'Dorado', 'Plata', 'Negro Espacial'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 120000 },
            { gb: 512, incremento: 240000 },
            { gb: 1024, incremento: 360000 }
        ]
    },
    'iPhone 14 Plus': {
        colores: ['Azul', 'Morado', 'Medianoche', 'Luz Estelar', 'Rojo'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 110000 },
            { gb: 512, incremento: 230000 }
        ]
    },
    'iPhone 14': {
        colores: ['Azul', 'Morado', 'Medianoche', 'Luz Estelar', 'Rojo'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 100000 },
            { gb: 512, incremento: 200000 }
        ]
    },
    'iPhone 13': {
        colores: ['Rosa', 'Azul', 'Medianoche', 'Luz Estelar', 'Rojo', 'Verde'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 80000 },
            { gb: 512, incremento: 180000 }
        ]
    },
    
    // ========== SAMSUNG ==========
    'Samsung Galaxy S24 Ultra': {
        colores: ['Titanio Gris', 'Titanio Negro', 'Titanio Violeta', 'Titanio Amarillo'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 150000 },
            { gb: 1024, incremento: 350000 }
        ]
    },
    'Samsung Galaxy S24+': {
        colores: ['Negro Onyx', 'Gris Mármol', 'Violeta Cobalto', 'Amarillo Ámbar'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 120000 }
        ]
    },
    'Samsung Galaxy S24': {
        colores: ['Negro Onyx', 'Gris Mármol', 'Violeta Cobalto', 'Amarillo Ámbar'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 100000 }
        ]
    },
    'Samsung Galaxy S23 Ultra': {
        colores: ['Phantom Black', 'Cream', 'Green', 'Lavender'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 130000 },
            { gb: 1024, incremento: 300000 }
        ]
    },
    'Samsung Galaxy S23': {
        colores: ['Phantom Black', 'Cream', 'Green', 'Lavender'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 90000 }
        ]
    },
    'Samsung Galaxy Z Fold 6': {
        colores: ['Navy', 'Pink', 'Silver Shadow'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 170000 },
            { gb: 1024, incremento: 370000 }
        ]
    },
    'Samsung Galaxy Z Fold 5': {
        colores: ['Phantom Black', 'Cream', 'Icy Blue'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 150000 },
            { gb: 1024, incremento: 350000 }
        ]
    },
    'Samsung Galaxy Z Flip 6': {
        colores: ['Blue', 'Mint', 'Silver Shadow', 'Yellow'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 130000 }
        ]
    },
    'Samsung Galaxy Z Flip 5': {
        colores: ['Cream', 'Graphite', 'Lavender', 'Mint'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 120000 }
        ]
    },
    
    // ========== XIAOMI ==========
    'Xiaomi 14 Ultra': {
        colores: ['Negro', 'Blanco'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 100000 }
        ]
    },
    'Xiaomi 13T Pro': {
        colores: ['Negro Medianoche', 'Azul Alpino', 'Verde Pradera'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 80000 }
        ]
    },
    
    // ========== MACBOOKS ==========
    'MacBook Pro 16': {
        colores: ['Gris Espacial', 'Plata'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 250000 },
            { gb: 2048, incremento: 550000 }
        ]
    },
    'MacBook Pro 14': {
        colores: ['Gris Espacial', 'Plata'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 200000 },
            { gb: 2048, incremento: 450000 }
        ]
    },
    'MacBook Air M3': {
        colores: ['Medianoche', 'Luz Estelar', 'Gris Espacial', 'Plata'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 150000 },
            { gb: 1024, incremento: 350000 },
            { gb: 2048, incremento: 650000 }
        ]
    },
    'MacBook Air M2': {
        colores: ['Medianoche', 'Luz Estelar', 'Gris Espacial', 'Plata'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 130000 },
            { gb: 1024, incremento: 300000 }
        ]
    },
    
    // ========== OTRAS LAPTOPS ==========
    'Dell XPS 15': {
        colores: ['Platino', 'Grafito'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 150000 },
            { gb: 2048, incremento: 350000 }
        ]
    },
    'Dell XPS 13': {
        colores: ['Platino', 'Grafito'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 120000 },
            { gb: 1024, incremento: 280000 }
        ]
    },
    'HP Spectre x360': {
        colores: ['Negro Nocturno', 'Plata Natural'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 120000 }
        ]
    },
    'Lenovo ThinkPad X1 Carbon': {
        colores: ['Negro'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 100000 },
            { gb: 1024, incremento: 220000 }
        ]
    },
    'ASUS ROG Zephyrus G14': {
        colores: ['Eclipse Gray', 'Moonlight White'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 150000 }
        ]
    },
    
    // ========== CONSOLAS ==========
    'PlayStation 5 Standard': {
        colores: ['Blanco', 'Negro (Covers)'],
        capacidades: [
            { gb: 825, incremento: 0, nombre: '825GB Interno' }
        ]
    },
    'PlayStation 5 Digital': {
        colores: ['Blanco'],
        capacidades: [
            { gb: 825, incremento: 0, nombre: '825GB Interno' }
        ]
    },
    'Nintendo Switch OLED': {
        colores: ['Blanco', 'Neón (Azul/Rojo)'],
        capacidades: [
            { gb: 64, incremento: 0, nombre: '64GB' }
        ]
    },
    'Nintendo Switch': {
        colores: ['Neón (Azul/Rojo)', 'Gris'],
        capacidades: [
            { gb: 32, incremento: 0, nombre: '32GB' }
        ]
    },
    'Nintendo Switch Lite': {
        colores: ['Turquesa', 'Amarillo', 'Gris', 'Coral', 'Azul'],
        capacidades: [
            { gb: 32, incremento: 0, nombre: '32GB' }
        ]
    }
};

async function agregarVariantes() {
    let client;
    try {
        console.log('🔄 Conectando a MongoDB...\n');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        console.log('📱 Buscando productos para agregar variantes...\n');
        
        let actualizados = 0;
        let noEncontrados = [];
        
        for (const [nombreProducto, variantes] of Object.entries(VARIANTES_DB)) {
            // Buscar producto por nombre (flexible - busca si contiene el nombre)
            const producto = await productosCollection.findOne({
                nombre: { $regex: nombreProducto.replace(/\s+/g, '.*'), $options: 'i' }
            });
            
            if (!producto) {
                noEncontrados.push(nombreProducto);
                console.log(`⚠️  NO encontrado: ${nombreProducto}`);
                continue;
            }
            
            // Usar el precio ACTUAL del producto como base
            const precioBase = producto.precio;
            
            // Calcular capacidades con precios desde el precio base
            const capacidades = variantes.capacidades.map(cap => ({
                almacenamiento: cap.nombre || `${cap.gb}GB`,
                precio: precioBase + cap.incremento
            }));
            
            // Actualizar producto con variantes
            await productosCollection.updateOne(
                { _id: producto._id },
                {
                    $set: {
                        colores: variantes.colores,
                        capacidades: capacidades,
                        tieneVariantes: true
                    }
                }
            );
            
            console.log(`✅ ${producto.nombre}`);
            console.log(`   📍 Precio base: $${precioBase.toLocaleString('es-CL')}`);
            console.log(`   🎨 Colores: ${variantes.colores.join(', ')}`);
            console.log(`   💾 Capacidades:`);
            capacidades.forEach(cap => {
                console.log(`      - ${cap.almacenamiento}: $${cap.precio.toLocaleString('es-CL')}`);
            });
            console.log('');
            
            actualizados++;
        }
        
        console.log(`\n╔════════════════════════════════════════╗`);
        console.log(`║  ✅ ${actualizados} productos actualizados        ║`);
        if (noEncontrados.length > 0) {
            console.log(`║  ⚠️  ${noEncontrados.length} productos no encontrados       ║`);
        }
        console.log(`╚════════════════════════════════════════╝\n`);
        
        if (noEncontrados.length > 0) {
            console.log('❌ Productos no encontrados en la BD:');
            noEncontrados.forEach(nombre => console.log(`   - ${nombre}`));
            console.log('\n💡 Tip: Agrega estos productos primero o verifica que sus nombres coincidan\n');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

agregarVariantes();
