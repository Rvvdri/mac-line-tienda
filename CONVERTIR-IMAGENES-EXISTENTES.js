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
    
    if (!fs.existsSync(destino)) {
        fs.mkdirSync(destino, { recursive: true });
        console.log('✅ Carpeta destino creada\n');
    }
    
    const archivos = fs.readdirSync(origen);
    const imagenes = archivos.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    });
    
    console.log(`📊 Total de imágenes a convertir: ${imagenes.length}\n`);
    
    let convertidas = 0;
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
            const ahorro = tamañoOriginal - statsWebP.size;
            ahorroTotal += ahorro;
            
            convertidas++;
            
            if (convertidas % 50 === 0) {
                console.log(`⏳ Procesadas: ${convertidas}/${imagenes.length}`);
            }
        } catch (error) {
            console.error(`❌ Error con ${imagen}`);
        }
    }
    
    const ahorroMB = (ahorroTotal / 1024 / 1024).toFixed(2);
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log(`║  ✅ Convertidas: ${convertidas}         ║`);
    console.log(`║  💾 Ahorro: ${ahorroMB} MB              ║`);
    console.log('╚════════════════════════════════════════╝\n');
}

convertirTodasLasImagenes().catch(console.error);
