const { MongoClient } = require('mongodb');

// Configuración
const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
const DATABASE_NAME = 'macline';
const COLLECTION_NAME = 'productos';

// Lista de celulares
const celulares = [
  // IPHONE
  { nombre: "iPhone 17 Pro Max", categoria: "celulares", descripcion: "Pantalla 6.9\" ProMotion 120Hz, Chip A19 Pro, Cámara triple 48MP, Titanio, 5G", precio: 1549990, precioOriginal: 1899990, descuento: 18, stock: 5, emoji: "📱" },
  { nombre: "iPhone 17 Pro", categoria: "celulares", descripcion: "Pantalla 6.3\" ProMotion 120Hz, Chip A19 Pro, Cámara triple 48MP, Titanio, 5G", precio: 1349990, precioOriginal: 1649990, descuento: 18, stock: 8, emoji: "📱" },
  { nombre: "iPhone 17", categoria: "celulares", descripcion: "Pantalla 6.3\" Super Retina 120Hz, Chip A19, Cámara dual 48MP, Dynamic Island, 5G", precio: 1149990, precioOriginal: 1399990, descuento: 18, stock: 10, emoji: "📱" },
  { nombre: "iPhone Air", categoria: "celulares", descripcion: "Ultra delgado, Pantalla 6.6\" Super Retina, Chip A19, Cámara 48MP, USB-C, 5G", precio: 999990, precioOriginal: 1199990, descuento: 17, stock: 7, emoji: "📱" },
  { nombre: "iPhone 16 Pro Max", categoria: "celulares", descripcion: "Pantalla 6.9\" ProMotion, Chip A18 Pro, Cámara triple 48MP, Control de Cámara, 5G", precio: 1449990, precioOriginal: 1799990, descuento: 19, stock: 6, emoji: "📱" },
  { nombre: "iPhone 16 Pro", categoria: "celulares", descripcion: "Pantalla 6.3\" ProMotion, Chip A18 Pro, Cámara triple 48MP, Botón Acción, 5G", precio: 1249990, precioOriginal: 1549990, descuento: 19, stock: 9, emoji: "📱" },
  { nombre: "iPhone 16 Plus", categoria: "celulares", descripcion: "Pantalla 6.7\" Super Retina, Chip A18, Cámara dual 48MP, USB-C, 5G", precio: 1049990, precioOriginal: 1299990, descuento: 19, stock: 12, emoji: "📱" },
  { nombre: "iPhone 16", categoria: "celulares", descripcion: "Pantalla 6.1\" Super Retina, Chip A18, Cámara dual 48MP, Dynamic Island, 5G", precio: 949990, precioOriginal: 1149990, descuento: 17, stock: 15, emoji: "📱" },
  { nombre: "iPhone 15 Pro Max", categoria: "celulares", descripcion: "Pantalla 6.7\" ProMotion, Chip A17 Pro, Titanio, Cámara 48MP, Botón Acción, 5G", precio: 1199990, precioOriginal: 1599990, descuento: 25, stock: 8, emoji: "📱" },
  { nombre: "iPhone 15 Pro", categoria: "celulares", descripcion: "Pantalla 6.1\" ProMotion, Chip A17 Pro, Titanio, Cámara 48MP, USB-C, 5G", precio: 1049990, precioOriginal: 1399990, descuento: 25, stock: 10, emoji: "📱" },
  { nombre: "iPhone 15 Plus", categoria: "celulares", descripcion: "Pantalla 6.7\" Super Retina, Chip A16 Bionic, Cámara 48MP, USB-C, 5G", precio: 899990, precioOriginal: 1199990, descuento: 25, stock: 12, emoji: "📱" },
  { nombre: "iPhone 15", categoria: "celulares", descripcion: "Pantalla 6.1\" Super Retina, Chip A16 Bionic, Cámara 48MP, Dynamic Island, 5G", precio: 799990, precioOriginal: 1049990, descuento: 24, stock: 15, emoji: "📱" },
  { nombre: "iPhone 14", categoria: "celulares", descripcion: "Pantalla 6.1\" Super Retina, Chip A15 Bionic, Cámara dual 12MP, 5G", precio: 649990, precioOriginal: 899990, descuento: 28, stock: 10, emoji: "📱" },
  { nombre: "iPhone 13", categoria: "celulares", descripcion: "Pantalla 6.1\" Super Retina, Chip A15 Bionic, Cámara dual 12MP, 5G", precio: 549990, precioOriginal: 799990, descuento: 31, stock: 8, emoji: "📱" },

  // SAMSUNG
  { nombre: "Samsung Galaxy S25 Ultra", categoria: "celulares", descripcion: "Pantalla 6.9\" AMOLED 120Hz, Snapdragon 8 Elite, Cámara 200MP, S Pen, Galaxy AI, 5G", precio: 1399990, precioOriginal: 1699990, descuento: 18, stock: 6, emoji: "📱" },
  { nombre: "Samsung Galaxy S25 Plus", categoria: "celulares", descripcion: "Pantalla 6.7\" AMOLED 120Hz, Snapdragon 8 Elite, Cámara 50MP triple, Galaxy AI, 5G", precio: 1199990, precioOriginal: 1449990, descuento: 17, stock: 8, emoji: "📱" },
  { nombre: "Samsung Galaxy S25", categoria: "celulares", descripcion: "Pantalla 6.2\" AMOLED 120Hz, Snapdragon 8 Elite, Cámara 50MP triple, Compacto, 5G", precio: 999990, precioOriginal: 1199990, descuento: 17, stock: 12, emoji: "📱" },
  { nombre: "Samsung Galaxy S24 Ultra", categoria: "celulares", descripcion: "Pantalla 6.8\" AMOLED 120Hz, Snapdragon 8 Gen 3, Cámara 200MP, S Pen, Galaxy AI, 5G", precio: 1299990, precioOriginal: 1649990, descuento: 21, stock: 7, emoji: "📱" },
  { nombre: "Samsung Galaxy S24 Plus", categoria: "celulares", descripcion: "Pantalla 6.7\" AMOLED 120Hz, Snapdragon 8 Gen 3, Cámara 50MP triple, 5G", precio: 1099990, precioOriginal: 1399990, descuento: 21, stock: 9, emoji: "📱" },
  { nombre: "Samsung Galaxy S24", categoria: "celulares", descripcion: "Pantalla 6.2\" AMOLED 120Hz, Exynos 2400, Cámara 50MP triple, Galaxy AI, 5G", precio: 899990, precioOriginal: 1149990, descuento: 22, stock: 15, emoji: "📱" },
  { nombre: "Samsung Galaxy S24 FE", categoria: "celulares", descripcion: "Pantalla 6.7\" AMOLED 120Hz, Exynos 2400e, Cámara 50MP triple, Batería 4700mAh, 5G", precio: 749990, precioOriginal: 949990, descuento: 21, stock: 10, emoji: "📱" },
  { nombre: "Samsung Galaxy Z Flip6", categoria: "celulares", descripcion: "Plegable tipo concha, Snapdragon 8 Gen 3, Pantalla externa grande, Cámara dual, 5G", precio: 1199990, precioOriginal: 1499990, descuento: 20, stock: 4, emoji: "📱" },
  { nombre: "Samsung Galaxy A56", categoria: "celulares", descripcion: "Pantalla 6.7\" AMOLED 120Hz, Exynos 1580, Cámara 50MP, Batería 5000mAh, 5G", precio: 449990, precioOriginal: 599990, descuento: 25, stock: 20, emoji: "📱" },
  { nombre: "Samsung Galaxy A55", categoria: "celulares", descripcion: "Pantalla 6.6\" AMOLED 120Hz, Exynos 1480, Cámara 50MP triple, IP67, 5G", precio: 399990, precioOriginal: 549990, descuento: 27, stock: 18, emoji: "📱" },
  { nombre: "Samsung Galaxy A54", categoria: "celulares", descripcion: "Pantalla 6.4\" AMOLED 120Hz, Exynos 1380, Cámara 50MP triple, IP67, 5G", precio: 349990, precioOriginal: 499990, descuento: 30, stock: 15, emoji: "📱" },
  { nombre: "Samsung Galaxy A35", categoria: "celulares", descripcion: "Pantalla 6.6\" AMOLED 120Hz, Exynos 1380, Cámara 50MP, Batería 5000mAh, 5G", precio: 329990, precioOriginal: 449990, descuento: 27, stock: 22, emoji: "📱" },
  { nombre: "Samsung Galaxy A16", categoria: "celulares", descripcion: "Pantalla 6.7\" AMOLED 90Hz, Exynos 1330, Cámara 50MP, Batería 5000mAh, 5G", precio: 249990, precioOriginal: 329990, descuento: 24, stock: 25, emoji: "📱" },

  // HONOR
  { nombre: "Honor Magic7 Pro", categoria: "celulares", descripcion: "Pantalla 6.8\" OLED 120Hz, Snapdragon 8 Elite, Cámara triple 200MP, IP68, 5G", precio: 1149990, precioOriginal: 1399990, descuento: 18, stock: 5, emoji: "📱" },
  { nombre: "Honor Magic6 Pro", categoria: "celulares", descripcion: "Pantalla 6.8\" OLED 120Hz, Snapdragon 8 Gen 3, Cámara 180MP, Batería 5600mAh, 5G", precio: 999990, precioOriginal: 1249990, descuento: 20, stock: 6, emoji: "📱" },
  { nombre: "Honor Magic5 Pro", categoria: "celulares", descripcion: "Pantalla 6.81\" OLED QHD+ 120Hz, Snapdragon 8 Gen 2, Cámara triple, 5G", precio: 849990, precioOriginal: 1149990, descuento: 26, stock: 8, emoji: "📱" },
  { nombre: "Honor 200 Pro", categoria: "celulares", descripcion: "Pantalla 6.78\" OLED 120Hz, Snapdragon 8 Gen 1, Cámara 108MP, Carga 100W, 5G", precio: 599990, precioOriginal: 799990, descuento: 25, stock: 10, emoji: "📱" },
  { nombre: "Honor 200", categoria: "celulares", descripcion: "Pantalla 6.7\" AMOLED, Snapdragon 7 Gen 3, Cámara triple 50MP, Diseño premium, 5G", precio: 499990, precioOriginal: 649990, descuento: 23, stock: 12, emoji: "📱" },
  { nombre: "Honor 90", categoria: "celulares", descripcion: "Pantalla 6.7\" AMOLED 120Hz, Snapdragon 7 Gen 1, Cámara 200MP, Diseño delgado, 5G", precio: 449990, precioOriginal: 599990, descuento: 25, stock: 15, emoji: "📱" },
  { nombre: "Honor 90 Lite", categoria: "celulares", descripcion: "Pantalla 6.7\" 90Hz, Dimensity 6020, Cámara 100MP, 256GB almacenamiento, 5G", precio: 349990, precioOriginal: 449990, descuento: 22, stock: 18, emoji: "📱" },
  { nombre: "Honor Magic7 Lite", categoria: "celulares", descripcion: "Pantalla 6.78\" AMOLED 120Hz, Snapdragon 685, Cámara 108MP con OIS, 5G", precio: 399990, precioOriginal: 529990, descuento: 25, stock: 12, emoji: "📱" },
  { nombre: "Honor Magic5 Lite", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 120Hz, Snapdragon 695, Cámara triple, Carga rápida 40W, 5G", precio: 329990, precioOriginal: 449990, descuento: 27, stock: 15, emoji: "📱" },
  { nombre: "Honor 70", categoria: "celulares", descripcion: "Pantalla 6.67\" OLED, Snapdragon 778G, Cámara 54MP, Carga ultrarrápida 66W", precio: 379990, precioOriginal: 519990, descuento: 27, stock: 10, emoji: "📱" },

  // HUAWEI
  { nombre: "Huawei Pura 70 Ultra", categoria: "celulares", descripcion: "Pantalla 6.8\" OLED, Kirin 9010, Cámara emergente 50MP sensor 1\", Batería 5200mAh", precio: 1199990, precioOriginal: 1499990, descuento: 20, stock: 4, emoji: "📱" },
  { nombre: "Huawei Pura 70 Pro", categoria: "celulares", descripcion: "Pantalla 6.8\" OLED 120Hz, Kirin 9010, Triple cámara profesional, Carga 100W", precio: 999990, precioOriginal: 1249990, descuento: 20, stock: 5, emoji: "📱" },
  { nombre: "Huawei P60 Pro", categoria: "celulares", descripcion: "Pantalla 6.67\" OLED 120Hz, Snapdragon 8+ Gen 1, Cámara variable XMAGE, 5G", precio: 899990, precioOriginal: 1199990, descuento: 25, stock: 6, emoji: "📱" },
  { nombre: "Huawei Mate 60 Pro", categoria: "celulares", descripcion: "Pantalla 6.8\" OLED, Kirin 9000S, Conectividad satelital, Batería 5000mAh", precio: 1099990, precioOriginal: 1399990, descuento: 21, stock: 5, emoji: "📱" },
  { nombre: "Huawei Mate 50 Pro", categoria: "celulares", descripcion: "Pantalla 6.8\" OLED 120Hz, Snapdragon 8+ Gen 1, Cámara XMAGE, IP68, HarmonyOS", precio: 849990, precioOriginal: 1149990, descuento: 26, stock: 7, emoji: "📱" },
  { nombre: "Huawei Nova 12i", categoria: "celulares", descripcion: "Pantalla 6.7\", Snapdragon 680, Cámara 108MP, Batería 5000mAh, Carga 40W", precio: 299990, precioOriginal: 399990, descuento: 25, stock: 20, emoji: "📱" },
  { nombre: "Huawei Nova 12 SE", categoria: "celulares", descripcion: "Pantalla 6.67\" OLED, Snapdragon 778G, Cámara triple, HarmonyOS optimizado", precio: 349990, precioOriginal: 469990, descuento: 26, stock: 15, emoji: "📱" },
  { nombre: "Huawei Nova 10", categoria: "celulares", descripcion: "Pantalla 6.67\" OLED 120Hz, Snapdragon 778G, Cámara 50MP, Carga rápida 66W", precio: 399990, precioOriginal: 549990, descuento: 27, stock: 12, emoji: "📱" },

  // XIAOMI
  { nombre: "Xiaomi 15 Ultra", categoria: "celulares", descripcion: "Pantalla 6.73\" AMOLED 120Hz, Snapdragon 8 Elite, Cámara Leica 50MP triple, IP68", precio: 1199990, precioOriginal: 1499990, descuento: 20, stock: 5, emoji: "📱" },
  { nombre: "Xiaomi 15 Pro", categoria: "celulares", descripcion: "Pantalla 6.73\" AMOLED 120Hz, Snapdragon 8 Elite, Cámara Leica, Batería 6100mAh", precio: 1049990, precioOriginal: 1299990, descuento: 19, stock: 6, emoji: "📱" },
  { nombre: "Xiaomi 14 Ultra", categoria: "celulares", descripcion: "Pantalla 6.73\" AMOLED 120Hz, Snapdragon 8 Gen 3, Kit fotográfico Leica profesional", precio: 1099990, precioOriginal: 1399990, descuento: 21, stock: 5, emoji: "📱" },
  { nombre: "Xiaomi 14 Pro", categoria: "celulares", descripcion: "Pantalla 6.73\" AMOLED 120Hz, Snapdragon 8 Gen 3, Cámara Leica triple 50MP, IP68", precio: 949990, precioOriginal: 1199990, descuento: 21, stock: 7, emoji: "📱" },
  { nombre: "Xiaomi 14T Pro", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 144Hz, Dimensity 9300+, Cámara Leica, Carga ultrarrápida 120W", precio: 699990, precioOriginal: 899990, descuento: 22, stock: 10, emoji: "📱" },
  { nombre: "Xiaomi 15T Pro", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 144Hz, Dimensity 9400+, Cámara Leica, Carga 120W, HyperOS", precio: 749990, precioOriginal: 949990, descuento: 21, stock: 8, emoji: "📱" },
  { nombre: "Xiaomi 15T", categoria: "celulares", descripcion: "Pantalla 6.83\" AMOLED 120Hz, Dimensity 8400-Ultra, Cámara Leica Summilux, HyperOS", precio: 599990, precioOriginal: 749990, descuento: 20, stock: 12, emoji: "📱" },
  { nombre: "POCO F8 Ultra", categoria: "celulares", descripcion: "Pantalla 6.9\" AMOLED 120Hz, Snapdragon 8 Elite Gen 5, Gaming pro, IP68", precio: 799990, precioOriginal: 999990, descuento: 20, stock: 8, emoji: "📱" },
  { nombre: "POCO X7 Pro", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 120Hz, Dimensity 8400-Ultra, Batería 6000mAh, Carga 90W", precio: 449990, precioOriginal: 579990, descuento: 22, stock: 15, emoji: "📱" },
  { nombre: "POCO F6 Pro", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 120Hz, Snapdragon 8 Gen 2, Batería 5000mAh, Gaming", precio: 499990, precioOriginal: 649990, descuento: 23, stock: 12, emoji: "📱" },
  { nombre: "POCO X6 Pro", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 120Hz, Dimensity 8300-Ultra, Cámara 64MP, Perfecto para gaming", precio: 399990, precioOriginal: 529990, descuento: 25, stock: 18, emoji: "📱" },
  { nombre: "Redmi Note 14 Pro+", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 120Hz, Snapdragon 7s Gen 3, Cámara 200MP, Carga ultrarrápida 120W", precio: 449990, precioOriginal: 599990, descuento: 25, stock: 20, emoji: "📱" },
  { nombre: "Redmi Note 14 Pro", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 120Hz, Helio G100-Ultra, Cámara 200MP, Batería 5000mAh", precio: 379990, precioOriginal: 499990, descuento: 24, stock: 25, emoji: "📱" },
  { nombre: "Redmi Note 14", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 120Hz, Helio G99-Ultra, Cámara 108MP, Batería 5500mAh", precio: 299990, precioOriginal: 399990, descuento: 25, stock: 30, emoji: "📱" },
  { nombre: "Redmi Note 13 Pro+", categoria: "celulares", descripcion: "Pantalla 6.67\" AMOLED 120Hz, Dimensity 7200-Ultra, Cámara 200MP, IP68", precio: 429990, precioOriginal: 579990, descuento: 26, stock: 15, emoji: "📱" },
  { nombre: "Redmi 15", categoria: "celulares", descripcion: "Pantalla 6.9\" FHD+ 90Hz, Snapdragon 685, Batería gigante 7000mAh, Carga 33W", precio: 249990, precioOriginal: 329990, descuento: 24, stock: 25, emoji: "📱" },
  { nombre: "Redmi 14C", categoria: "celulares", descripcion: "Pantalla 6.88\" 120Hz, Helio G81-Ultra, Cámara dual, Jack 3.5mm, microSD", precio: 199990, precioOriginal: 269990, descuento: 26, stock: 30, emoji: "📱" }
];

async function agregarCelulares() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔄 Conectando a MongoDB...');
        await client.connect();
        console.log('✅ Conectado exitosamente a MongoDB');
        
        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);
        
        // Limpiar productos existentes de categoría celulares (opcional)
        console.log('🗑️  Eliminando celulares antiguos...');
        await collection.deleteMany({ categoria: 'celulares' });
        
        console.log(`📱 Agregando ${celulares.length} celulares...`);
        
        // Agregar ID a cada producto
        const celularesConId = celulares.map((cel, index) => ({
            ...cel,
            id: Date.now() + index,
            fechaCreacion: new Date()
        }));
        
        // Insertar todos los celulares
        const result = await collection.insertMany(celularesConId);
        
        console.log(`✅ ${result.insertedCount} celulares agregados exitosamente!`);
        console.log('');
        console.log('📊 RESUMEN:');
        console.log('   - iPhone: 14 modelos');
        console.log('   - Samsung: 13 modelos');
        console.log('   - Honor: 10 modelos');
        console.log('   - Huawei: 8 modelos');
        console.log('   - Xiaomi: 17 modelos');
        console.log('');
        console.log('🎉 ¡Todos los celulares están ahora en tu tienda!');
        console.log('🌐 Visita: https://mac-line.onrender.com');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔌 Desconectado de MongoDB');
    }
}

// Ejecutar
agregarCelulares();
