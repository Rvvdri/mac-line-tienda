const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

/**
 * SISTEMA DE VARIANTES: CAPACIDAD + COLOR
 * ========================================
 * Cada producto tendrá:
 * - precioBase: precio de la variante más básica
 * - variantes: array con combinaciones de capacidad y color
 */

const productosConVariantes = [
    {
        nombre: 'iPhone 17 Pro Max',
        precioBase: 1549990,
        colores: [
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 17 Pro',
        precioBase: 1349990,
        colores: [
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 17 Plus',
        precioBase: 1199990,
        colores: [
            { nombre: 'Ultramarino', hex: '#2F4F72' },
            { nombre: 'Verde Azulado', hex: '#4A8B8B' },
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 17',
        precioBase: 999990,
        colores: [
            { nombre: 'Ultramarino', hex: '#2F4F72' },
            { nombre: 'Verde Azulado', hex: '#4A8B8B' },
            { nombre: 'Rosa', hex: '#E8A0A0' },
            { nombre: 'Blanco', hex: '#F5F5F5' },
            { nombre: 'Negro', hex: '#2C2C2C' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 130000 },
            { capacidad: '512GB', incremento: 260000 }
        ]
    },
    {
        nombre: 'iPhone 16 Pro Max',
        precioBase: 1449990,
        colores: [
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' },
            { nombre: 'Titanio Desierto', hex: '#C9B18F' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'iPhone 16 Pro',
        precioBase: 1249990,
        colores: [
            { nombre: 'Titanio Natural', hex: '#8A8A8D' },
            { nombre: 'Titanio Azul', hex: '#2F4F72' },
            { nombre: 'Titanio Blanco', hex: '#E3E4E5' },
            { nombre: 'Titanio Negro', hex: '#3B3B3B' },
            { nombre: 'Titanio Desierto', hex: '#C9B18F' }
        ],
        capacidades: [
            { capacidad: '128GB', incremento: 0 },
            { capacidad: '256GB', incremento: 150000 },
            { capacidad: '512GB', incremento: 300000 },
            { capacidad: '1TB', incremento: 500000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S25 Ultra',
        precioBase: 1299990,
        colores: [
            { nombre: 'Titanio Negro', hex: '#2C2C2C' },
            { nombre: 'Titanio Gris', hex: '#8A8A8D' },
            { nombre: 'Titanio Violeta', hex: '#8B7FA8' },
            { nombre: 'Titanio Amarillo', hex: '#E8D08F' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    },
    {
        nombre: 'Samsung Galaxy S24 Ultra',
        precioBase: 1199990,
        colores: [
            { nombre: 'Titanio Negro', hex: '#2C2C2C' },
            { nombre: 'Titanio Gris', hex: '#8A8A8D' },
            { nombre: 'Titanio Violeta', hex: '#8B7FA8' },
            { nombre: 'Titanio Amarillo', hex: '#E8D08F' }
        ],
        capacidades: [
            { capacidad: '256GB', incremento: 0 },
            { capacidad: '512GB', incremento: 200000 },
            { capacidad: '1TB', incremento: 400000 }
        ]
    }
    // Agrega más productos aquí siguiendo el mismo patrón
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
        
        console.log('📝 Agregando variantes...\n');
        
        for (const prod of productosConVariantes) {
            const result = await productosCollection.updateOne(
                { nombre: prod.nombre },
                { 
                    $set: { 
                        precioBase: prod.precioBase,
                        colores: prod.colores,
                        capacidades: prod.capacidades,
                        precio: prod.precioBase // Actualizar precio al base
                    } 
                }
            );
            
            if (result.matchedCount > 0) {
                console.log(`✅ ${prod.nombre}`);
                console.log(`   Colores: ${prod.colores.length}`);
                console.log(`   Capacidades: ${prod.capacidades.length}`);
                actualizados++;
            } else {
                console.log(`⚠️  ${prod.nombre} - NO ENCONTRADO`);
                noEncontrados++;
            }
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log('📊 RESUMEN:');
        console.log('═'.repeat(70));
        console.log(`✅ Actualizados: ${actualizados}`);
        console.log(`⚠️  No encontrados: ${noEncontrados}`);
        console.log('═'.repeat(70));
        console.log('\n💡 Ahora los productos tienen:');
        console.log('   - precioBase: precio de la capacidad mínima');
        console.log('   - colores: array de colores disponibles');
        console.log('   - capacidades: array de opciones de almacenamiento');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Desconectado');
    }
}

agregarVariantes();
