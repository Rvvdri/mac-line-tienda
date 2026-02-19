const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

/**
 * SISTEMA DE VARIANTES DE PRODUCTOS
 * ==================================
 * Agrega capacidades de almacenamiento con precios incrementales
 * 
 * Estructura:
 * - precioBase: precio de la capacidad mínima (128GB)
 * - variantes: array de opciones con incremento de precio
 */

const productosConVariantes = [
    // ========== IPHONES ==========
    {
        nombre: 'iPhone 17 Pro Max',
        precioBase: 1549990, // 128GB
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 17 Pro',
        precioBase: 1349990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 17 Plus',
        precioBase: 1199990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 17',
        precioBase: 999990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 16 Pro Max',
        precioBase: 1449990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 16 Pro',
        precioBase: 1249990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 16 Plus',
        precioBase: 1099990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 16',
        precioBase: 899990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 15 Pro Max',
        precioBase: 1349990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 140000 },
            { capacidad: '512GB', incremento: 280000 },
            { capacidad: '1TB', incremento: 450000 }
        ]
    },
    {
        nombre: 'iPhone 15 Pro',
        precioBase: 1149990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 140000 },
            { capacidad: '512GB', incremento: 280000 },
            { capacidad: '1TB', incremento: 450000 }
        ]
    },
    {
        nombre: 'iPhone 15 Plus',
        precioBase: 999990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 120000 },
            { capacidad: '512GB', incremento: 240000 }
        ]
    },
    {
        nombre: 'iPhone 15',
        precioBase: 799990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 120000 },
            { capacidad: '512GB', incremento: 240000 }
        ]
    },
    
    // ========== SAMSUNG GALAXY S SERIES ==========
    {
        nombre: 'Samsung Galaxy S25 Ultra',
        precioBase: 1299990,
        variantes: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S25+',
        precioBase: 1099990,
        variantes: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 180000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S25',
        precioBase: 899990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 280000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S24 Ultra',
        precioBase: 1199990,
        variantes: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S24+',
        precioBase: 999990,
        variantes: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 180000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S24',
        precioBase: 799990,
        variantes: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 280000 }
        ]
    },
    
    // ========== XIAOMI ==========
    {
        nombre: 'Xiaomi 15 Ultra',
        precioBase: 899990,
        variantes: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 150000 },
            { capacidad: '1TB', incremento: 300000 }
        ]
    },
    {
        nombre: 'Xiaomi 14 Ultra',
        precioBase: 799990,
        variantes: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 150000 }
        ]
    },
    
    // Puedes agregar más productos aquí...
];

async function agregarVariantes() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Conectando a MongoDB...');
        await client.connect();
        console.log('✅ Conectado\n');
        
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        let actualizados = 0;
        let noEncontrados = 0;
        
        for (const prod of productosConVariantes) {
            const result = await productosCollection.updateOne(
                { nombre: prod.nombre },
                { 
                    $set: { 
                        precioBase: prod.precioBase,
                        variantes: prod.variantes,
                        // El precio actual será el precio base (primera variante)
                        precio: prod.precioBase
                    } 
                }
            );
            
            if (result.matchedCount > 0) {
                console.log(`✅ ${prod.nombre}`);
                actualizados++;
            } else {
                console.log(`⚠️  ${prod.nombre} - NO ENCONTRADO en la BD`);
                noEncontrados++;
            }
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log('📊 RESUMEN:');
        console.log('═'.repeat(70));
        console.log(`✅ Actualizados con variantes: ${actualizados}`);
        console.log(`⚠️  No encontrados: ${noEncontrados}`);
        console.log('═'.repeat(70));
        console.log('\n💡 Los productos ahora tienen:');
        console.log('   - precioBase: precio de la capacidad mínima');
        console.log('   - variantes: array con opciones de almacenamiento');
        console.log('   - El frontend mostrará un selector para elegir');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Desconectado');
    }
}

// Ejecutar
agregarVariantes();
