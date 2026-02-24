// Script Node.js para convertir imágenes a WebP
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dirImagenes = path.join(__dirname, 'public', 'images', 'productos');
const dirBackup = path.join(__dirname, 'public', 'images', 'productos-backup');

async function convertirAWebP() {
    console.log('🎨 Iniciando conversión a WebP...\n');
    
    // Crear backup
    if (!fs.existsSync(dirBackup)) {
        fs.mkdirSync(dirBackup, { recursive: true });
    }
    
    // Obtener todos los archivos
    const archivos = fs.readdirSync(dirImagenes);
    const extensiones = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
    
    let total = 0;
    let convertidas = 0;
    let ahorroTotal = 0;
    
    for (const archivo of archivos) {
        const ext = path.extname(archivo);
        
        if (extensiones.includes(ext)) {
            total++;
            const rutaOriginal = path.join(dirImagenes, archivo);
            const nombreSinExt = path.basename(archivo, ext);
            const rutaWebP = path.join(dirImagenes, `${nombreSinExt}.webp`);
            const rutaBackup = path.join(dirBackup, archivo);
            
            try {
                // Copiar a backup
                fs.copyFileSync(rutaOriginal, rutaBackup);
                
                // Obtener tamaño original
                const stats = fs.statSync(rutaOriginal);
                const tamañoOriginal = stats.size;
                
                // Convertir a WebP
                await sharp(rutaOriginal)
                    .webp({ quality: 85 })
                    .toFile(rutaWebP);
                
                // Obtener tamaño nuevo
                const statsWebP = fs.statSync(rutaWebP);
                const tamañoWebP = statsWebP.size;
                
                // Calcular ahorro
                const ahorro = tamañoOriginal - tamañoWebP;
                const porcentaje = ((ahorro / tamañoOriginal) * 100).toFixed(1);
                ahorroTotal += ahorro;
                
                // Eliminar original
                fs.unlinkSync(rutaOriginal);
                
                console.log(`✅ ${archivo} → ${nombreSinExt}.webp`);
                console.log(`   ${(tamañoOriginal/1024/1024).toFixed(2)}MB → ${(tamañoWebP/1024/1024).toFixed(2)}MB (${porcentaje}% menos)\n`);
                
                convertidas++;
            } catch (error) {
                console.error(`❌ Error con ${archivo}:`, error.message);
            }
        }
    }
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log(`║  ✅ Conversión completada               ║`);
    console.log(`║  📊 Total: ${total} imágenes                   ║`);
    console.log(`║  ✨ Convertidas: ${convertidas}                ║`);
    console.log(`║  💾 Ahorro: ${(ahorroTotal/1024/1024).toFixed(2)} MB            ║`);
    console.log('╚════════════════════════════════════════╝\n');
    console.log('📁 Backup en: public/imagenes-backup/\n');
}

// Ejecutar
convertirAWebP().catch(console.error);
