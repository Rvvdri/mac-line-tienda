const { MongoClient } = require('mongodb');
const https = require('https');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

/**
 * SISTEMA AUTOMÁTICO DE IMÁGENES
 * ================================
 * 
 * Este script busca automáticamente imágenes profesionales de productos usando:
 * - Pexels API (80 búsquedas/hora GRATIS, sin límite mensual)
 * - Sin necesidad de tarjeta de crédito
 * 
 * CÓMO OBTENER TU API KEY GRATIS:
 * 1. Ve a: https://www.pexels.com/api/
 * 2. Click en "Get Started"
 * 3. Crea cuenta gratis (con email)
 * 4. Te dan la API Key inmediatamente
 * 5. Pégala aquí abajo:
 */

const PEXELS_API_KEY = 'DDi88crYkdL8e57TeElEeRoBImwzdxei7QoIwRueZrmQuSLE3LVgUYLY';

// Mapeo de nombres de productos a términos de búsqueda en inglés
function generarTerminoBusqueda(producto) {
    const { nombre, marca, categoria } = producto;
    
    // Limpiar el nombre del producto
    let termino = nombre
        .toLowerCase()
        .replace(/[()]/g, '')
        .trim();
    
    // Para iPhone, buscar por generación
    if (marca === 'Apple' && categoria === 'celulares') {
        if (termino.includes('17')) return 'iphone 16 pro max'; // Usar 16 como placeholder de 17
        if (termino.includes('16')) return 'iphone 16 pro';
        if (termino.includes('15')) return 'iphone 15 pro';
        if (termino.includes('14')) return 'iphone 14 pro';
        if (termino.includes('13')) return 'iphone 13 pro';
        return 'iphone';
    }
    
    // Para Samsung Galaxy
    if (marca === 'Samsung' && categoria === 'celulares') {
        if (termino.includes('s25') || termino.includes('s24')) return 'samsung galaxy s24';
        if (termino.includes('s23')) return 'samsung galaxy s23';
        if (termino.includes('z fold')) return 'samsung galaxy z fold';
        if (termino.includes('z flip')) return 'samsung galaxy z flip';
        if (termino.includes('a55') || termino.includes('a54')) return 'samsung galaxy a54';
        return 'samsung galaxy';
    }
    
    // Para otras marcas
    if (marca === 'Xiaomi' && categoria === 'celulares') return 'xiaomi smartphone';
    if (marca === 'Huawei' && categoria === 'celulares') return 'huawei smartphone';
    if (marca === 'Honor' && categoria === 'celulares') return 'honor smartphone';
    
    // Audífonos
    if (categoria === 'audifonos') {
        if (marca === 'Apple') return 'airpods pro';
        if (marca === 'Samsung') return 'samsung galaxy buds';
        return `${marca.toLowerCase()} earbuds`;
    }
    
    // Relojes
    if (categoria === 'relojes') {
        if (marca === 'Apple') return 'apple watch ultra';
        if (marca === 'Samsung') return 'samsung galaxy watch';
        return `${marca.toLowerCase()} smartwatch`;
    }
    
    // Notebooks
    if (categoria === 'notebooks') {
        if (marca === 'Apple') return 'macbook pro';
        if (marca === 'Samsung') return 'samsung galaxy book';
        return `${marca.toLowerCase()} laptop`;
    }
    
    // Televisores
    if (categoria === 'televisores') {
        return `${marca.toLowerCase()} smart tv`;
    }
    
    return termino;
}

// Buscar imágenes en Pexels
function buscarEnPexels(query, count = 5) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`,
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        };
        
        https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.photos && result.photos.length > 0) {
                        resolve(result.photos);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

// Delay para respetar rate limit
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function agregarImagenesCompletas() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Conectando a MongoDB...');
        await client.connect();
        console.log('✅ Conectado a MongoDB\n');
        
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        const productos = await productosCollection.find({}).toArray();
        console.log(`📦 ${productos.length} productos encontrados\n`);
        
        // Verificar si hay API Key
        const usarAPI = PEXELS_API_KEY && PEXELS_API_KEY !== 'TU_API_KEY_DE_PEXELS_AQUI';
        
        if (!usarAPI) {
            console.log('⚠️  API Key de Pexels no configurada');
            console.log('   Usando imágenes de ejemplo por marca...\n');
        }
        
        let procesados = 0;
        let conImagenesReales = 0;
        let conPlaceholders = 0;
        
        for (const producto of productos) {
            procesados++;
            let imagenPortada = null;
            let galeriaImagenes = [];
            
            if (usarAPI) {
                // Buscar imágenes reales
                const terminoBusqueda = generarTerminoBusqueda(producto);
                console.log(`[${procesados}/${productos.length}] 🔍 Buscando: ${producto.nombre}`);
                console.log(`   Query: "${terminoBusqueda}"`);
                
                const fotos = await buscarEnPexels(terminoBusqueda, 5);
                
                if (fotos && fotos.length > 0) {
                    // Imagen de portada (la mejor calidad)
                    imagenPortada = fotos[0].src.large;
                    
                    // Galería (5 imágenes)
                    galeriaImagenes = fotos.map(foto => foto.src.large);
                    
                    console.log(`   ✅ ${galeriaImagenes.length} imágenes encontradas\n`);
                    conImagenesReales++;
                } else {
                    console.log(`   ⚠️  Sin resultados, usando placeholder\n`);
                    imagenPortada = generarPlaceholderMarca(producto);
                    galeriaImagenes = [imagenPortada, imagenPortada, imagenPortada, imagenPortada, imagenPortada];
                    conPlaceholders++;
                }
                
                // Delay para respetar rate limit (80/hora = ~1.1 seg entre llamadas)
                await delay(1200);
                
            } else {
                // Sin API: usar placeholders por marca
                imagenPortada = generarPlaceholderMarca(producto);
                galeriaImagenes = [imagenPortada, imagenPortada, imagenPortada, imagenPortada, imagenPortada];
                console.log(`[${procesados}/${productos.length}] 📷 ${producto.nombre} - Placeholder ${producto.marca}\n`);
                conPlaceholders++;
            }
            
            // Actualizar producto
            await productosCollection.updateOne(
                { _id: producto._id },
                { 
                    $set: { 
                        imagenPortada: imagenPortada,
                        imagenes: galeriaImagenes
                    } 
                }
            );
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log('📊 RESUMEN FINAL:');
        console.log('═'.repeat(70));
        console.log(`✅ Total procesados: ${procesados}`);
        console.log(`🖼️  Con imágenes reales de Pexels: ${conImagenesReales}`);
        console.log(`📷 Con placeholders: ${conPlaceholders}`);
        console.log('═'.repeat(70));
        
        if (!usarAPI) {
            console.log('\n💡 SUGERENCIA:');
            console.log('   Obtén una API Key gratis de Pexels para imágenes reales:');
            console.log('   👉 https://www.pexels.com/api/');
            console.log('   Es gratis, sin límite mensual, solo 80 búsquedas/hora\n');
        } else {
            console.log('\n✨ ¡Listo! Todos los productos tienen:');
            console.log('   - 1 imagen de portada (para el catálogo)');
            console.log('   - 5 imágenes en galería (para la página del producto)\n');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔌 Desconectado de MongoDB');
    }
}

function generarPlaceholderMarca(producto) {
    const placeholders = {
        'Apple': 'https://via.placeholder.com/800x800/000000/FFFFFF?text=' + encodeURIComponent(producto.nombre),
        'Samsung': 'https://via.placeholder.com/800x800/1428A0/FFFFFF?text=' + encodeURIComponent(producto.nombre),
        'Xiaomi': 'https://via.placeholder.com/800x800/FF6900/FFFFFF?text=' + encodeURIComponent(producto.nombre),
        'Huawei': 'https://via.placeholder.com/800x800/FF0000/FFFFFF?text=' + encodeURIComponent(producto.nombre),
        'Honor': 'https://via.placeholder.com/800x800/0066FF/FFFFFF?text=' + encodeURIComponent(producto.nombre)
    };
    
    return placeholders[producto.marca] || placeholders['Samsung'];
}

// Ejecutar
agregarImagenesCompletas();
