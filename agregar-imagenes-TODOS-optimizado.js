const { MongoClient } = require('mongodb');
const https = require('https');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
const PEXELS_API_KEY = 'DDi88crYkdL8e57TeElEeRoBImwzdxei7QoIwRueZrmQuSLE3LVgUYLY';

/**
 * SISTEMA INTELIGENTE DE BÚSQUEDA DE IMÁGENES
 * ============================================
 * Este script busca imágenes específicas para CADA producto
 * usando términos de búsqueda optimizados en inglés
 */

// Mapeo inteligente de productos a términos de búsqueda
function generarTerminoBusquedaInteligente(producto) {
    const { nombre, marca, categoria } = producto;
    const nombreLower = nombre.toLowerCase();
    
    // ========== CELULARES ==========
    if (categoria === 'celulares') {
        // APPLE
        if (marca === 'Apple') {
            if (nombreLower.includes('17 pro max')) return 'iphone 16 pro max titanium official';
            if (nombreLower.includes('17 pro')) return 'iphone 16 pro desert titanium official';
            if (nombreLower.includes('17 plus')) return 'iphone 16 plus colors official';
            if (nombreLower.includes('17')) return 'iphone 16 ultramarine official';
            if (nombreLower.includes('16 pro max')) return 'iphone 16 pro max black titanium';
            if (nombreLower.includes('16 pro')) return 'iphone 16 pro natural titanium';
            if (nombreLower.includes('16 plus')) return 'iphone 16 plus pink';
            if (nombreLower.includes('16')) return 'iphone 16 teal official';
            if (nombreLower.includes('15 pro max')) return 'iphone 15 pro max blue titanium';
            if (nombreLower.includes('15 pro')) return 'iphone 15 pro white titanium';
            if (nombreLower.includes('15 plus')) return 'iphone 15 plus yellow';
            if (nombreLower.includes('15')) return 'iphone 15 pink official';
            return 'iphone official product photo';
        }
        
        // SAMSUNG
        if (marca === 'Samsung') {
            if (nombreLower.includes('s25 ultra')) return 'samsung galaxy s25 ultra titanium official';
            if (nombreLower.includes('s25+') || nombreLower.includes('s25 plus')) return 'samsung galaxy s25 plus official';
            if (nombreLower.includes('s25')) return 'samsung galaxy s25 official product';
            if (nombreLower.includes('s24 ultra')) return 'samsung galaxy s24 ultra titanium gray';
            if (nombreLower.includes('s24+') || nombreLower.includes('s24 plus')) return 'samsung galaxy s24 plus cobalt violet';
            if (nombreLower.includes('s24')) return 'samsung galaxy s24 marble gray';
            if (nombreLower.includes('s23 ultra')) return 'samsung galaxy s23 ultra phantom black';
            if (nombreLower.includes('s23+') || nombreLower.includes('s23 plus')) return 'samsung galaxy s23 plus cream';
            if (nombreLower.includes('s23')) return 'samsung galaxy s23 lavender';
            if (nombreLower.includes('z fold 6')) return 'samsung galaxy z fold 6 official product';
            if (nombreLower.includes('z fold 5')) return 'samsung galaxy z fold 5 phantom black';
            if (nombreLower.includes('z flip 6')) return 'samsung galaxy z flip 6 colors';
            if (nombreLower.includes('z flip 5')) return 'samsung galaxy z flip 5 graphite';
            if (nombreLower.includes('a55')) return 'samsung galaxy a55 awesome iceblue';
            if (nombreLower.includes('a54')) return 'samsung galaxy a54 awesome violet';
            if (nombreLower.includes('a35')) return 'samsung galaxy a35 awesome lilac';
            if (nombreLower.includes('a25')) return 'samsung galaxy a25 blue black';
            if (nombreLower.includes('a15')) return 'samsung galaxy a15 blue black';
            return 'samsung galaxy official product photo';
        }
        
        // XIAOMI
        if (marca === 'Xiaomi') {
            if (nombreLower.includes('15 ultra')) return 'xiaomi 15 ultra official product white';
            if (nombreLower.includes('15 pro')) return 'xiaomi 15 pro titanium official';
            if (nombreLower.includes('15')) return 'xiaomi 15 black official';
            if (nombreLower.includes('14 ultra')) return 'xiaomi 14 ultra titanium official';
            if (nombreLower.includes('14 pro')) return 'xiaomi 14 pro black official';
            if (nombreLower.includes('14')) return 'xiaomi 14 official product photo';
            if (nombreLower.includes('13 ultra')) return 'xiaomi 13 ultra official product';
            if (nombreLower.includes('13 pro')) return 'xiaomi 13 pro black official';
            if (nombreLower.includes('13')) return 'xiaomi 13 official product';
            if (nombreLower.includes('note 14 pro+')) return 'redmi note 14 pro plus official';
            if (nombreLower.includes('note 14 pro')) return 'redmi note 14 pro official product';
            if (nombreLower.includes('note 14')) return 'redmi note 14 official';
            if (nombreLower.includes('note 13 pro+')) return 'redmi note 13 pro plus official';
            if (nombreLower.includes('note 13 pro')) return 'redmi note 13 pro official';
            if (nombreLower.includes('note 13')) return 'redmi note 13 official product';
            return 'xiaomi smartphone official product photo';
        }
        
        // HUAWEI
        if (marca === 'Huawei') {
            if (nombreLower.includes('pura 80')) return 'huawei pura 80 ultra official';
            if (nombreLower.includes('pura 70')) return 'huawei pura 70 ultra official product';
            if (nombreLower.includes('mate 70')) return 'huawei mate 70 pro official';
            if (nombreLower.includes('mate 60')) return 'huawei mate 60 pro official product';
            if (nombreLower.includes('p70')) return 'huawei p70 pro official';
            if (nombreLower.includes('p60')) return 'huawei p60 pro official product';
            if (nombreLower.includes('nova')) return 'huawei nova official product photo';
            return 'huawei smartphone official product';
        }
        
        // HONOR
        if (marca === 'Honor') {
            if (nombreLower.includes('magic 7')) return 'honor magic 7 pro official product';
            if (nombreLower.includes('magic 6')) return 'honor magic 6 pro official';
            if (nombreLower.includes('magic 5')) return 'honor magic 5 pro official product';
            if (nombreLower.includes('x50')) return 'honor x50 official product';
            if (nombreLower.includes('x40')) return 'honor x40 official';
            if (nombreLower.includes('x30')) return 'honor x30 official product';
            if (nombreLower.includes('90')) return 'honor 90 official product photo';
            if (nombreLower.includes('80')) return 'honor 80 official product';
            return 'honor smartphone official product';
        }
    }
    
    // ========== AUDÍFONOS ==========
    if (categoria === 'audifonos') {
        if (marca === 'Apple') return 'airpods pro official product white background';
        if (marca === 'Samsung') return 'samsung galaxy buds official product white';
        if (marca === 'Xiaomi') return 'xiaomi earbuds official product white background';
        if (marca === 'Huawei') return 'huawei freebuds official product white';
        if (marca === 'Honor') return 'honor earbuds official product white background';
    }
    
    // ========== RELOJES ==========
    if (categoria === 'relojes') {
        if (marca === 'Apple') return 'apple watch ultra official product photo';
        if (marca === 'Samsung') return 'samsung galaxy watch official product';
        if (marca === 'Xiaomi') return 'xiaomi watch official product photo';
        if (marca === 'Huawei') return 'huawei watch official product';
        if (marca === 'Honor') return 'honor watch official product photo';
    }
    
    // ========== NOTEBOOKS ==========
    if (categoria === 'notebooks') {
        if (marca === 'Apple') return 'macbook pro official product silver';
        if (marca === 'Samsung') return 'samsung galaxy book official product';
        if (marca === 'Xiaomi') return 'xiaomi laptop official product photo';
        if (marca === 'Huawei') return 'huawei matebook official product';
        if (marca === 'Honor') return 'honor magicbook official product';
    }
    
    // ========== TELEVISORES ==========
    if (categoria === 'televisores') {
        if (marca === 'Samsung') return 'samsung qled tv official product front';
        if (marca === 'Xiaomi') return 'xiaomi smart tv official product';
        if (marca === 'Huawei') return 'huawei smart screen official product';
        if (marca === 'Honor') return 'honor smart screen official product';
    }
    
    return `${marca} ${categoria} official product photography`;
}

// Buscar imágenes en Pexels con query mejorado
function buscarEnPexels(query, count = 5) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.pexels.com',
            path: `/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`,
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function procesarTodosLosProductos() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Conectando a MongoDB...');
        await client.connect();
        console.log('✅ Conectado\n');
        
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        const productos = await productosCollection.find({}).toArray();
        console.log(`📦 ${productos.length} productos encontrados\n`);
        console.log('⏳ Esto tomará aproximadamente 3 horas (80 búsquedas/hora)\n');
        console.log('💡 Puedes detenerlo con Ctrl+C y continuar después\n');
        
        let procesados = 0;
        let exitosos = 0;
        let fallidos = 0;
        
        for (const producto of productos) {
            procesados++;
            
            const query = generarTerminoBusquedaInteligente(producto);
            console.log(`[${procesados}/${productos.length}] 🔍 ${producto.nombre}`);
            console.log(`   Query: "${query}"`);
            
            const fotos = await buscarEnPexels(query, 5);
            
            if (fotos && fotos.length > 0) {
                const imagenPortada = fotos[0].src.large;
                const galeriaImagenes = fotos.map(f => f.src.large);
                
                await productosCollection.updateOne(
                    { _id: producto._id },
                    { 
                        $set: { 
                            imagenPortada: imagenPortada,
                            imagenes: galeriaImagenes
                        } 
                    }
                );
                
                console.log(`   ✅ ${fotos.length} imágenes\n`);
                exitosos++;
            } else {
                console.log(`   ⚠️  Sin resultados\n`);
                fallidos++;
            }
            
            // Esperar 50 segundos entre búsquedas (80 por hora = 45 seg + margen)
            if (procesados < productos.length) {
                await delay(50000);
            }
        }
        
        console.log('\n' + '═'.repeat(70));
        console.log('🎉 PROCESO COMPLETADO');
        console.log('═'.repeat(70));
        console.log(`✅ Exitosos: ${exitosos}`);
        console.log(`⚠️  Fallidos: ${fallidos}`);
        console.log(`📊 Total procesados: ${procesados}`);
        console.log('═'.repeat(70));
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Desconectado');
    }
}

// Ejecutar
procesarTodosLosProductos();
