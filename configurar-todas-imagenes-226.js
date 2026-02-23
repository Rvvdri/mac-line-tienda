const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
const CARPETA_IMAGENES = path.join(__dirname, 'public', 'images', 'productos');

/**
 * CONFIGURADOR AUTOMÁTICO DE IMÁGENES - 226 PRODUCTOS
 * ====================================================
 * Busca automáticamente las imágenes en la carpeta y las configura.
 * Mínimo 6 imágenes por producto (1 portada + 5 galería).
 */

async function configurarTodasLasImagenes() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Conectando a MongoDB...');
        await client.connect();
        console.log('✅ Conectado\n');
        
        const db = client.db('macline');
        const productosCollection = db.collection('productos');
        
        const productos = await productosCollection.find({}).toArray();
        console.log(`📦 ${productos.length} productos en la base de datos\n`);
        
        if (!fs.existsSync(CARPETA_IMAGENES)) {
            console.log('❌ Carpeta de imágenes no existe. Créala con:');
            console.log(`   mkdir -p ${CARPETA_IMAGENES}\n`);
            return;
        }
        
        const archivos = fs.readdirSync(CARPETA_IMAGENES);
        console.log(`📂 ${archivos.length} archivos en la carpeta\n`);
        console.log('🔍 Procesando productos...\n');
        
        let completos = 0;      // 6+ imágenes
        let parciales = 0;      // 1-5 imágenes
        let sinImagenes = 0;    // 0 imágenes
        
        const productosDetalle = [];
        
        for (const producto of productos) {
            const productoId = producto.id;
            const extensiones = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'];
            
            let portada = null;
            let galeria = [];
            
            // Buscar portada
            for (const ext of extensiones) {
                const archivo = `producto-${productoId}-portada.${ext}`;
                if (archivos.includes(archivo)) {
                    portada = `/images/productos/${archivo}`;
                    break;
                }
            }
            
            // Buscar galería (1-6)
            for (let i = 1; i <= 6; i++) {
                let encontrada = false;
                for (const ext of extensiones) {
                    const archivo = `producto-${productoId}-${i}.${ext}`;
                    if (archivos.includes(archivo)) {
                        galeria.push(`/images/productos/${archivo}`);
                        encontrada = true;
                        break;
                    }
                }
                if (!encontrada) {
                    break; // Si falta una, no seguir buscando
                }
            }
            
            const totalImagenes = (portada ? 1 : 0) + galeria.length;
            
            if (portada && galeria.length >= 5) {
                // COMPLETO: tiene portada + 5 o más imágenes de galería
                
                // Asegurar que tenga exactamente 5 en la galería
                const galeriaFinal = galeria.slice(0, 5);
                
                await productosCollection.updateOne(
                    { _id: producto._id },
                    { 
                        $set: { 
                            imagenPortada: portada,
                            imagenes: galeriaFinal
                        } 
                    }
                );
                
                console.log(`✅ ${producto.nombre} (${totalImagenes} imágenes)`);
                completos++;
                
                productosDetalle.push({
                    nombre: producto.nombre,
                    estado: 'COMPLETO',
                    imagenes: totalImagenes
                });
                
            } else if (portada || galeria.length > 0) {
                // PARCIAL: tiene algunas imágenes pero no las 6
                
                // Configurar con lo que tiene (rellenando si es necesario)
                const galeriaFinal = [...galeria];
                
                // Si tiene menos de 5, rellenar con la portada o última imagen
                while (galeriaFinal.length < 5) {
                    galeriaFinal.push(galeria[galeria.length - 1] || portada);
                }
                
                await productosCollection.updateOne(
                    { _id: producto._id },
                    { 
                        $set: { 
                            imagenPortada: portada || galeria[0],
                            imagenes: galeriaFinal.slice(0, 5)
                        } 
                    }
                );
                
                console.log(`⚠️  ${producto.nombre} (${totalImagenes} imágenes - PARCIAL)`);
                parciales++;
                
                productosDetalle.push({
                    nombre: producto.nombre,
                    estado: 'PARCIAL',
                    imagenes: totalImagenes,
                    faltantes: 6 - totalImagenes
                });
                
            } else {
                // SIN IMÁGENES
                console.log(`❌ ${producto.nombre} - SIN IMÁGENES`);
                sinImagenes++;
                
                productosDetalle.push({
                    nombre: producto.nombre,
                    estado: 'FALTA',
                    imagenes: 0,
                    faltantes: 6,
                    id: productoId
                });
            }
        }
        
        // RESUMEN
        console.log('\n' + '═'.repeat(90));
        console.log('📊 RESUMEN FINAL');
        console.log('═'.repeat(90));
        console.log(`✅ Completos (6+ imágenes):        ${completos} productos`);
        console.log(`⚠️  Parciales (1-5 imágenes):      ${parciales} productos`);
        console.log(`❌ Sin imágenes (0 imágenes):      ${sinImagenes} productos`);
        console.log('─'.repeat(90));
        console.log(`📦 Total procesados:               ${productos.length} productos`);
        console.log(`✅ Configurados exitosamente:      ${completos + parciales} productos`);
        console.log(`📸 Imágenes totales en carpeta:    ${archivos.length} archivos`);
        console.log('═'.repeat(90));
        
        // Guardar reporte de productos faltantes
        if (sinImagenes > 0 || parciales > 0) {
            const faltantes = productosDetalle.filter(p => p.estado === 'FALTA');
            const incomp = productosDetalle.filter(p => p.estado === 'PARCIAL');
            
            let reporte = '═'.repeat(90) + '\n';
            reporte += '📋 REPORTE DE PRODUCTOS SIN IMÁGENES O INCOMPLETOS\n';
            reporte += '═'.repeat(90) + '\n\n';
            
            if (faltantes.length > 0) {
                reporte += '❌ PRODUCTOS SIN IMÁGENES (' + faltantes.length + '):\n\n';
                faltantes.forEach((p, idx) => {
                    reporte += `${idx + 1}. ${p.nombre}\n`;
                    reporte += `   ID: ${p.id}\n`;
                    reporte += `   Archivos necesarios:\n`;
                    reporte += `   - producto-${p.id}-portada.jpg\n`;
                    reporte += `   - producto-${p.id}-1.jpg\n`;
                    reporte += `   - producto-${p.id}-2.jpg\n`;
                    reporte += `   - producto-${p.id}-3.jpg\n`;
                    reporte += `   - producto-${p.id}-4.jpg\n`;
                    reporte += `   - producto-${p.id}-5.jpg\n`;
                    reporte += `   - producto-${p.id}-6.jpg\n\n`;
                });
            }
            
            if (incomp.length > 0) {
                reporte += '\n⚠️  PRODUCTOS CON IMÁGENES PARCIALES (' + incomp.length + '):\n\n';
                incomp.forEach((p, idx) => {
                    reporte += `${idx + 1}. ${p.nombre} - Tiene ${p.imagenes}, faltan ${p.faltantes}\n`;
                });
            }
            
            fs.writeFileSync('reporte-imagenes-faltantes.txt', reporte);
            console.log('\n📄 Reporte guardado en: reporte-imagenes-faltantes.txt\n');
        } else {
            console.log('\n🎉 ¡TODOS LOS PRODUCTOS TIENEN SUS IMÁGENES CONFIGURADAS!\n');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔌 Desconectado de MongoDB\n');
    }
}

configurarTodasLasImagenes();
