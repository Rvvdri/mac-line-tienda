#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertirTodasLasImagenes() {
    const origen = path.join(__dirname, 'public/images/productos');
    const destino = path.join(__dirname, 'public/imagenes/productos');
    
    console.log('🎨 Conversión masiva a WebP');
    console.log('📂 Origen:', origen);
    console.log('📂 Destino:', destino);
    console.log('');
    
    // Crear carpeta destino si no existe
    if (!fs.existsSync(destino)) {
        fs.mkdirSync(destino, { recursive: true });
        console.log('✅ Carpeta destino creada\n');
    }
    
    // Leer todos los archivos
    const archivos = fs.readdirSync(origen);
    const imagenes = archivos.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    });
    
    console.log(`📊 Total de imágenes a convertir: ${imagenes.length}\n`);
    
    let convertidas = 0;
    let errores = 0;
    let ahorroTotal = 0;
    
    for (const imagen of imagenes) {
        const rutaOrigen = path.join(origen, imagen);
        const nombreWebP = imagen.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const rutaDestino = path.join(destino, nombreWebP);
        
        try {
            const statsOrigen = fs.statSync(rutaOrigen);
            const tamañoOriginal = statsOrigen.size;
            
            await sharp(rutaOrigen)
                .webp({ quality: 85 })
                .toFile(rutaDestino);
            
            const statsWebP = fs.statSync(rutaDestino);
            const tamañoWebP = statsWebP.size;
            const ahorro = tamañoOriginal - tamañoWebP;
            ahorroTotal += ahorro;
            
            convertidas++;
            
            // Mostrar progreso cada 50 imágenes
            if (convertidas % 50 === 0) {
                console.log(`⏳ Procesadas: ${convertidas}/${imagenes.length}`);
            }
        } catch (error) {
            errores++;
            console.error(`❌ Error con ${imagen}: ${error.message}`);
        }
    }
    
    const ahorroMB = (ahorroTotal / 1024 / 1024).toFixed(2);
    const porcentaje = ((ahorroTotal / (ahorroTotal + fs.readdirSync(destino).reduce((acc, f) => {
        try {
            return acc + fs.statSync(path.join(destino, f)).size;
        } catch {
            return acc;
        }
    }, 0))) * 100).toFixed(1);
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log(`║  ✅ Convertidas: ${convertidas}/${imagenes.length}           ║`);
    console.log(`║  ❌ Errores: ${errores}                        ║`);
    console.log(`║  💾 Ahorro: ${ahorroMB} MB (${porcentaje}%)        ║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('\n📁 Las imágenes WebP están en:');
    console.log(`   ${destino}\n`);
}

convertirTodasLasImagenes().catch(console.error);
