// Script para agregar variantes (colores y capacidades) a productos existentes
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

// Base de datos de variantes por producto
const VARIANTES_DB = {
    // ========== CELULARES ==========
    'iPhone 15 Pro Max': {
        colores: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },      // Base
            { almacenamiento: '512GB', incremento: 200000 },
            { almacenamiento: '1TB', incremento: 400000 }
        ]
    },
    'iPhone 15 Pro': {
        colores: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        capacidades: [
            { almacenamiento: '128GB', incremento: 0 },
            { almacenamiento: '256GB', incremento: 150000 },
            { almacenamiento: '512GB', incremento: 300000 },
            { almacenamiento: '1TB', incremento: 450000 }
        ]
    },
    'iPhone 15 Plus': {
        colores: ['Negro', 'Azul', 'Verde', 'Amarillo', 'Rosa'],
        capacidades: [
            { almacenamiento: '128GB', incremento: 0 },
            { almacenamiento: '256GB', incremento: 120000 },
            { almacenamiento: '512GB', incremento: 250000 }
        ]
    },
    'iPhone 15': {
        colores: ['Negro', 'Azul', 'Verde', 'Amarillo', 'Rosa'],
        capacidades: [
            { almacenamiento: '128GB', incremento: 0 },
            { almacenamiento: '256GB', incremento: 100000 },
            { almacenamiento: '512GB', incremento: 220000 }
        ]
    },
    'iPhone 14 Pro Max': {
        colores: ['Morado Oscuro', 'Dorado', 'Plata', 'Negro Espacial'],
        capacidades: [
            { almacenamiento: '128GB', incremento: 0 },
            { almacenamiento: '256GB', incremento: 130000 },
            { almacenamiento: '512GB', incremento: 260000 },
            { almacenamiento: '1TB', incremento: 390000 }
        ]
    },
    'iPhone 14': {
        colores: ['Azul', 'Morado', 'Medianoche', 'Luz Estelar', 'Rojo'],
        capacidades: [
            { almacenamiento: '128GB', incremento: 0 },
            { almacenamiento: '256GB', incremento: 100000 },
            { almacenamiento: '512GB', incremento: 200000 }
        ]
    },
    'iPhone 13': {
        colores: ['Rosa', 'Azul', 'Medianoche', 'Luz Estelar', 'Rojo', 'Verde'],
        capacidades: [
            { almacenamiento: '128GB', incremento: 0 },
            { almacenamiento: '256GB', incremento: 80000 },
            { almacenamiento: '512GB', incremento: 180000 }
        ]
    },
    'Samsung Galaxy S24 Ultra': {
        colores: ['Titanio Gris', 'Titanio Negro', 'Titanio Violeta', 'Titanio Amarillo'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 150000 },
            { almacenamiento: '1TB', incremento: 350000 }
        ]
    },
    'Samsung Galaxy S24+': {
        colores: ['Negro Onyx', 'Gris Mármol', 'Violeta Cobalto', 'Amarillo Ámbar'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 120000 }
        ]
    },
    'Samsung Galaxy S23 Ultra': {
        colores: ['Phantom Black', 'Cream', 'Green', 'Lavender'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 130000 },
            { almacenamiento: '1TB', incremento: 300000 }
        ]
    },
    'Samsung Galaxy Z Fold 5': {
        colores: ['Phantom Black', 'Cream', 'Icy Blue'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 150000 },
            { almacenamiento: '1TB', incremento: 350000 }
        ]
    },
    'Samsung Galaxy Z Flip 5': {
        colores: ['Cream', 'Graphite', 'Lavender', 'Mint'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 120000 }
        ]
    },
    'Xiaomi 14 Ultra': {
        colores: ['Negro', 'Blanco'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 100000 }
        ]
    },
    'Xiaomi 13T Pro': {
        colores: ['Negro Medianoche', 'Azul Alpino', 'Verde Pradera'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 80000 }
        ]
    },
    
    // ========== COMPUTADORES ==========
    'MacBook Pro 16"': {
        colores: ['Gris Espacial', 'Plata'],
        capacidades: [
            { almacenamiento: '512GB', incremento: 0 },
            { almacenamiento: '1TB', incremento: 250000 },
            { almacenamiento: '2TB', incremento: 550000 }
        ]
    },
    'MacBook Pro 14"': {
        colores: ['Gris Espacial', 'Plata'],
        capacidades: [
            { almacenamiento: '512GB', incremento: 0 },
            { almacenamiento: '1TB', incremento: 200000 },
            { almacenamiento: '2TB', incremento: 450000 }
        ]
    },
    'MacBook Air M3': {
        colores: ['Medianoche', 'Luz Estelar', 'Gris Espacial', 'Plata'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 150000 },
            { almacenamiento: '1TB', incremento: 350000 }
        ]
    },
    'MacBook Air M2': {
        colores: ['Medianoche', 'Luz Estelar', 'Gris Espacial', 'Plata'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 130000 },
            { almacenamiento: '1TB', incremento: 300000 }
        ]
    },
    'Dell XPS 15': {
        colores: ['Platino', 'Grafito'],
        capacidades: [
            { almacenamiento: '512GB', incremento: 0 },
            { almacenamiento: '1TB', incremento: 150000 },
            { almacenamiento: '2TB', incremento: 350000 }
        ]
    },
    'HP Spectre x360': {
        colores: ['Negro Nocturno', 'Plata Natural'],
        capacidades: [
            { almacenamiento: '512GB', incremento: 0 },
            { almacenamiento: '1TB', incremento: 120000 }
        ]
    },
    'Lenovo ThinkPad X1 Carbon': {
        colores: ['Negro'],
        capacidades: [
            { almacenamiento: '256GB', incremento: 0 },
            { almacenamiento: '512GB', incremento: 100000 },
            { almacenamiento: '1TB', incremento: 220000 }
        ]
    },
    'ASUS ROG Zephyrus G14': {
        colores: ['Eclipse Gray', 'Moonlight White'],
        capacidades: [
            { almacenamiento: '512GB', incremento: 0 },
            { almacenamiento: '1TB', incremento: 150000 }
        ]
    },
    
    // ========== CONSOLAS ==========
    'PlayStation 5 Standard Edition': {
        colores: ['Blanco', 'Negro (Edición Especial)'],
        capacidades: [
            { almacenamiento: '825GB', incremento: 0 },
            { almacenamiento: '825GB + 1TB SSD', incremento: 150000 }
        ]
    },
    'PlayStation 5 Digital Edition': {
        colores: ['Blanco'],
        capacidades: [
            { almacenamiento: '825GB', incremento: 0 }
        ]
    },
    'Nintendo Switch OLED': {
        colores: ['Blanco', 'Neón (Azul/Rojo)'],
        capacidades: [
            { almacenamiento: '64GB', incremento: 0 },
            { almacenamiento: '64GB + 256GB SD', incremento: 50000 },
            { almacenamiento: '64GB + 512GB SD', incremento: 90000 }
        ]
    },
    'Nintendo Switch Standard': {
        colores: ['Neón (Azul/Rojo)', 'Gris'],
        capacidades: [
            { almacenamiento: '32GB', incremento: 0 },
            { almacenamiento: '32GB + 256GB SD', incremento: 45000 },
            { almacenamiento: '32GB + 512GB SD', incremento: 85000 }
        ]
    },
    'Nintendo Switch Lite': {
        colores: ['Turquesa', 'Amarillo', 'Gris', 'Coral', 'Azul'],
        capacidades: [
            { almacenamiento: '32GB', incremento: 0 },
            { almacenamiento: '32GB + 128GB SD', incremento: 30000 },
            { almacenamiento: '32GB + 256GB SD', incremento: 45000 }
        ]
    }
};

async function agregarVariantes() {
    let client;
    try {
        console.log('🔄 Conectando a MongoDB...');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        console.log('\n📱 Agregando variantes a productos...\n');
        
        let actualizados = 0;
        
        for (const [nombreProducto, variantes] of Object.entries(VARIANTES_DB)) {
            // Buscar producto por nombre (flexible)
            const producto = await productosCollection.findOne({
                nombre: { $regex: nombreProducto, $options: 'i' }
            });
            
            if (!producto) {
                console.log(`⚠️  No encontrado: ${nombreProducto}`);
                continue;
            }
            
            // Calcular capacidades con precios
            const capacidades = variantes.capacidades.map(cap => ({
                almacenamiento: cap.almacenamiento,
                precio: producto.precio + cap.incremento
            }));
            
            // Actualizar producto
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
            
            console.log(`✅ ${nombreProducto}`);
            console.log(`   Colores: ${variantes.colores.join(', ')}`);
            console.log(`   Capacidades: ${capacidades.map(c => `${c.almacenamiento} ($${c.precio.toLocaleString('es-CL')})`).join(' | ')}\n`);
            
            actualizados++;
        }
        
        console.log(`\n🎉 ${actualizados} productos actualizados con variantes!\n`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

agregarVariantes();
