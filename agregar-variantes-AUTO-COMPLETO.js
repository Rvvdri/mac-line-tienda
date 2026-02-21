// Script AUTOMÁTICO que encuentra TODOS los productos y les agrega variantes
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

// Reglas de variantes por PATRÓN de nombre
const REGLAS_VARIANTES = [
    // ========== IPHONES ==========
    {
        patron: /iPhone.*17.*Pro Max/i,
        colores: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 200000 },
            { gb: 1024, incremento: 400000 }
        ]
    },
    {
        patron: /iPhone.*17.*Pro(?!.*Max)/i,
        colores: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco', 'Titanio Negro'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 150000 },
            { gb: 512, incremento: 300000 },
            { gb: 1024, incremento: 450000 }
        ]
    },
    {
        patron: /iPhone.*17(?!.*Pro)/i,
        colores: ['Negro', 'Azul', 'Verde', 'Amarillo', 'Rosa'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 100000 },
            { gb: 512, incremento: 220000 }
        ]
    },
    {
        patron: /iPhone.*(16|15).*Pro Max/i,
        colores: ['Titanio Negro', 'Titanio Blanco', 'Titanio Natural', 'Titanio Desierto'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 200000 },
            { gb: 1024, incremento: 400000 }
        ]
    },
    {
        patron: /iPhone.*(16|15).*Pro(?!.*Max)/i,
        colores: ['Titanio Negro', 'Titanio Blanco', 'Titanio Natural', 'Titanio Desierto'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 150000 },
            { gb: 512, incremento: 300000 },
            { gb: 1024, incremento: 450000 }
        ]
    },
    {
        patron: /iPhone.*(16|15|14).*Plus/i,
        colores: ['Negro', 'Azul', 'Verde', 'Amarillo', 'Rosa'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 120000 },
            { gb: 512, incremento: 250000 }
        ]
    },
    {
        patron: /iPhone.*(16|15|14|13)(?!.*(Pro|Plus))/i,
        colores: ['Negro', 'Azul', 'Verde', 'Amarillo', 'Rosa'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 100000 },
            { gb: 512, incremento: 220000 }
        ]
    },
    
    // ========== SAMSUNG ==========
    {
        patron: /Samsung.*S2[34].*Ultra/i,
        colores: ['Titanio Gris', 'Titanio Negro', 'Titanio Violeta', 'Titanio Amarillo'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 150000 },
            { gb: 1024, incremento: 350000 }
        ]
    },
    {
        patron: /Samsung.*S2[34]/i,
        colores: ['Negro Onyx', 'Gris Mármol', 'Violeta Cobalto'],
        capacidades: [
            { gb: 128, incremento: 0 },
            { gb: 256, incremento: 100000 }
        ]
    },
    {
        patron: /Samsung.*(Z Fold|Fold)/i,
        colores: ['Phantom Black', 'Cream', 'Icy Blue'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 150000 },
            { gb: 1024, incremento: 350000 }
        ]
    },
    {
        patron: /Samsung.*(Z Flip|Flip)/i,
        colores: ['Cream', 'Graphite', 'Lavender', 'Mint'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 120000 }
        ]
    },
    
    // ========== MACBOOKS ==========
    {
        patron: /MacBook.*Pro.*16/i,
        colores: ['Gris Espacial', 'Plata'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 250000 },
            { gb: 2048, incremento: 550000 }
        ]
    },
    {
        patron: /MacBook.*Pro.*14/i,
        colores: ['Gris Espacial', 'Plata'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 200000 },
            { gb: 2048, incremento: 450000 }
        ]
    },
    {
        patron: /MacBook.*Air.*M3/i,
        colores: ['Medianoche', 'Luz Estelar', 'Gris Espacial', 'Plata'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 150000 },
            { gb: 1024, incremento: 350000 }
        ]
    },
    {
        patron: /MacBook.*Air.*M2/i,
        colores: ['Medianoche', 'Luz Estelar', 'Gris Espacial', 'Plata'],
        capacidades: [
            { gb: 256, incremento: 0 },
            { gb: 512, incremento: 130000 },
            { gb: 1024, incremento: 300000 }
        ]
    },
    
    // ========== OTRAS LAPTOPS ==========
    {
        patron: /Dell.*XPS/i,
        colores: ['Platino', 'Grafito'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 150000 }
        ]
    },
    {
        patron: /(HP|Lenovo|ASUS)/i,
        colores: ['Negro', 'Plata'],
        capacidades: [
            { gb: 512, incremento: 0 },
            { gb: 1024, incremento: 120000 }
        ]
    },
    
    // ========== CONSOLAS ==========
    {
        patron: /PlayStation.*5.*Standard/i,
        colores: ['Blanco', 'Negro (Covers)'],
        capacidades: [
            { gb: 825, incremento: 0, nombre: '825GB' }
        ]
    },
    {
        patron: /PlayStation.*5.*Digital/i,
        colores: ['Blanco'],
        capacidades: [
            { gb: 825, incremento: 0, nombre: '825GB' }
        ]
    },
    {
        patron: /Nintendo.*Switch.*OLED/i,
        colores: ['Blanco', 'Neón (Azul/Rojo)'],
        capacidades: [
            { gb: 64, incremento: 0, nombre: '64GB' }
        ]
    },
    {
        patron: /Nintendo.*Switch.*Lite/i,
        colores: ['Turquesa', 'Amarillo', 'Gris', 'Coral', 'Azul'],
        capacidades: [
            { gb: 32, incremento: 0, nombre: '32GB' }
        ]
    },
    {
        patron: /Nintendo.*Switch(?!.*(OLED|Lite))/i,
        colores: ['Neón (Azul/Rojo)', 'Gris'],
        capacidades: [
            { gb: 32, incremento: 0, nombre: '32GB' }
        ]
    }
];

async function agregarVariantesAutomatico() {
    let client;
    try {
        console.log('🔄 Conectando a MongoDB...\n');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        // Obtener TODOS los productos
        const todosProductos = await productosCollection.find({}).toArray();
        console.log(`📦 Total productos encontrados: ${todosProductos.length}\n`);
        
        let actualizados = 0;
        let omitidos = 0;
        
        for (const producto of todosProductos) {
            // Buscar regla que coincida
            const regla = REGLAS_VARIANTES.find(r => r.patron.test(producto.nombre));
            
            if (!regla) {
                omitidos++;
                continue;
            }
            
            // Calcular capacidades
            const capacidades = regla.capacidades.map(cap => ({
                almacenamiento: cap.nombre || `${cap.gb}GB`,
                precio: producto.precio + cap.incremento
            }));
            
            // Actualizar producto
            await productosCollection.updateOne(
                { _id: producto._id },
                {
                    $set: {
                        colores: regla.colores,
                        capacidades: capacidades,
                        tieneVariantes: true
                    }
                }
            );
            
            console.log(`✅ ${producto.nombre}`);
            console.log(`   Colores: ${regla.colores.length}`);
            console.log(`   Capacidades: ${capacidades.length}`);
            
            actualizados++;
        }
        
        console.log(`\n╔════════════════════════════════════════╗`);
        console.log(`║  ✅ ${actualizados} productos actualizados        ║`);
        console.log(`║  ⚠️  ${omitidos} productos omitidos             ║`);
        console.log(`╚════════════════════════════════════════╝\n`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

agregarVariantesAutomatico();
