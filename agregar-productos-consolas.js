// Script para agregar productos de consolas a MongoDB
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

const productosConsolas = [
    // PLAYSTATION 5
    {
        id: Date.now().toString() + '001',
        nombre: 'PlayStation 5 Standard Edition',
        categoria: 'consolas',
        descripcion: 'Consola PlayStation 5 con lector de discos. Incluye DualSense Wireless Controller. Experimenta velocidad ultrarrápida con SSD de alta velocidad, inmersión más profunda con compatibilidad para retroalimentación háptica, gatillos adaptativos y audio 3D, además de una generación completamente nueva de juegos increíbles.',
        precioOriginal: 649990,
        descuento: 15,
        precio: 552492,
        stock: 8,
        emoji: '🎮',
        imagenPortada: '/imagenes/ps5-standard.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '002',
        nombre: 'PlayStation 5 Digital Edition',
        categoria: 'consolas',
        descripcion: 'Consola PlayStation 5 totalmente digital sin lector de discos. Disfruta de los mismos juegos y experiencias que la PS5 Standard, pero descargando todo desde la PlayStation Store. Incluye DualSense Wireless Controller.',
        precioOriginal: 549990,
        descuento: 12,
        precio: 483991,
        stock: 12,
        emoji: '🎮',
        imagenPortada: '/imagenes/ps5-digital.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '003',
        nombre: 'PlayStation 5 + Spider-Man 2',
        categoria: 'consolas',
        descripcion: 'Bundle PlayStation 5 Standard con el juego Marvel\'s Spider-Man 2 incluido. Vive la aventura de Peter Parker y Miles Morales en una historia épica. Consola con lector de discos + DualSense + juego físico.',
        precioOriginal: 749990,
        descuento: 18,
        precio: 614992,
        stock: 5,
        emoji: '🎮',
        imagenPortada: '/imagenes/ps5-spiderman.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '004',
        nombre: 'Control DualSense PS5',
        categoria: 'consolas',
        descripcion: 'Control inalámbrico DualSense para PlayStation 5. Experimenta retroalimentación háptica, efectos de gatillo dinámicos y un micrófono integrado, todo en un diseño icónico y cómodo. Disponible en múltiples colores.',
        precioOriginal: 74990,
        descuento: 10,
        precio: 67491,
        stock: 25,
        emoji: '🎮',
        imagenPortada: '/imagenes/dualsense.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    
    // PLAYSTATION 4
    {
        id: Date.now().toString() + '005',
        nombre: 'PlayStation 4 Slim 1TB',
        categoria: 'consolas',
        descripcion: 'Consola PlayStation 4 Slim con 1TB de almacenamiento. Incluye control DualShock 4. Juega a los mejores exclusivos de PlayStation, streaming de entretenimiento y más. Perfecta para comenzar tu colección de juegos.',
        precioOriginal: 349990,
        descuento: 20,
        precio: 279992,
        stock: 15,
        emoji: '🎮',
        imagenPortada: '/imagenes/ps4-slim.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '006',
        nombre: 'PlayStation 4 Pro 1TB',
        categoria: 'consolas',
        descripcion: 'PlayStation 4 Pro con resolución 4K y HDR. 1TB de almacenamiento. Experimenta gráficos mejorados, juegos más fluidos y un rendimiento superior. Incluye control DualShock 4.',
        precioOriginal: 449990,
        descuento: 22,
        precio: 350992,
        stock: 8,
        emoji: '🎮',
        imagenPortada: '/imagenes/ps4-pro.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '007',
        nombre: 'Control DualShock 4 PS4',
        categoria: 'consolas',
        descripcion: 'Control inalámbrico DualShock 4 para PlayStation 4. Con touchpad, sensor de movimiento, puerto para auriculares y batería recargable. Compatible con PS4 y PC. Disponible en varios colores.',
        precioOriginal: 64990,
        descuento: 15,
        precio: 55242,
        stock: 30,
        emoji: '🎮',
        imagenPortada: '/imagenes/dualshock4.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    
    // NINTENDO SWITCH
    {
        id: Date.now().toString() + '008',
        nombre: 'Nintendo Switch OLED',
        categoria: 'consolas',
        descripcion: 'Nintendo Switch modelo OLED con pantalla de 7 pulgadas OLED vibrante. Incluye base con puerto LAN, 64GB de almacenamiento interno, audio mejorado y soporte ajustable. Juega en casa o en movimiento. Incluye Joy-Con y base.',
        precioOriginal: 449990,
        descuento: 12,
        precio: 395991,
        stock: 10,
        emoji: '🎮',
        imagenPortada: '/imagenes/switch-oled.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '009',
        nombre: 'Nintendo Switch Standard',
        categoria: 'consolas',
        descripcion: 'Nintendo Switch versión estándar con pantalla LCD de 6.2 pulgadas. Tres modos de juego: TV, sobremesa y portátil. Incluye Joy-Con (izquierdo y derecho), base, y agarre para Joy-Con. 32GB de almacenamiento.',
        precioOriginal: 379990,
        descuento: 10,
        precio: 341991,
        stock: 18,
        emoji: '🎮',
        imagenPortada: '/imagenes/switch-standard.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '010',
        nombre: 'Nintendo Switch Lite',
        categoria: 'consolas',
        descripcion: 'Nintendo Switch Lite, diseñada específicamente para juego portátil. Más compacta y ligera. Pantalla táctil de 5.5 pulgadas. Compatible con todos los juegos de Nintendo Switch que admitan el modo portátil. Disponible en varios colores.',
        precioOriginal: 269990,
        descuento: 15,
        precio: 229492,
        stock: 20,
        emoji: '🎮',
        imagenPortada: '/imagenes/switch-lite.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '011',
        nombre: 'Joy-Con Nintendo Switch (Par)',
        categoria: 'consolas',
        descripcion: 'Par de controles Joy-Con para Nintendo Switch. Incluye Joy-Con izquierdo y derecho. Se pueden usar independientemente en cada mano o juntos en el agarre. Sensor de movimiento y vibración HD. Disponible en varios colores.',
        precioOriginal: 89990,
        descuento: 10,
        precio: 80991,
        stock: 15,
        emoji: '🎮',
        imagenPortada: '/imagenes/joycon.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    },
    {
        id: Date.now().toString() + '012',
        nombre: 'Nintendo Switch Pro Controller',
        categoria: 'consolas',
        descripcion: 'Control Pro de Nintendo Switch con agarre tradicional. Batería de hasta 40 horas, vibración HD, sensor de movimiento y NFC para amiibo. Ideal para sesiones largas de juego. Conexión inalámbrica y por cable USB-C.',
        precioOriginal: 79990,
        descuento: 12,
        precio: 70391,
        stock: 12,
        emoji: '🎮',
        imagenPortada: '/imagenes/pro-controller.jpg', // Agregar foto
        imagenes: [],
        createdAt: new Date()
    }
];

async function agregarProductos() {
    let client;
    try {
        console.log('🎮 Conectando a MongoDB...');
        client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        console.log('📦 Agregando productos de consolas...\n');
        
        for (const producto of productosConsolas) {
            await productosCollection.insertOne(producto);
            console.log(`✅ ${producto.nombre}`);
            console.log(`   Precio: $${producto.precioOriginal.toLocaleString('es-CL')} → $${producto.precio.toLocaleString('es-CL')} (-${producto.descuento}%)`);
            console.log(`   Stock: ${producto.stock}\n`);
        }
        
        console.log(`\n🎉 ¡${productosConsolas.length} productos agregados exitosamente!`);
        console.log('\n📸 IMPORTANTE: Ahora ve al panel de admin y agrega las fotos:');
        console.log('   1. Abre http://localhost:3000/admin.html');
        console.log('   2. Busca cada producto de consolas');
        console.log('   3. Click en ✏️ Editar');
        console.log('   4. Sube las 6 imágenes');
        console.log('   5. Guarda');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

agregarProductos();
