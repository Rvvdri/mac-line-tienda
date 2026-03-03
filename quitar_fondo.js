/**
 * MAC LINE - Quitar fondo a imágenes
 * Uso: node quitar_fondo.js
 * Requisitos: npm install @imgly/background-removal-node mongodb sharp
 */

const { removeBackground } = require('@imgly/background-removal-node');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const CARPETA_IMAGENES = './public/imagenes/productos';
const CARPETA_SALIDA   = './img-sin-fondo';
const MONGODB_URI      = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';
const ACTUALIZAR_MONGO = true;

async function quitarFondo(buffer) {
    const pngBuffer = await sharp(buffer).png().toBuffer();
    const blob = new Blob([pngBuffer], { type: 'image/png' });
    const resultado = await removeBackground(blob);
    const sinFondo = Buffer.from(await resultado.arrayBuffer());
    return await sharp(sinFondo).webp({ lossless: true }).toBuffer();
}

async function procesarCarpeta() {
    if (!fs.existsSync(CARPETA_IMAGENES)) {
        console.log(`Carpeta '${CARPETA_IMAGENES}' no encontrada, saltando...`);
        return;
    }

    if (!fs.existsSync(CARPETA_SALIDA)) fs.mkdirSync(CARPETA_SALIDA, { recursive: true });

    const extensiones = ['.webp', '.jpg', '.jpeg', '.png'];
    const archivos = [];

    function buscarArchivos(dir) {
        fs.readdirSync(dir).forEach(f => {
            const ruta = path.join(dir, f);
            if (fs.statSync(ruta).isDirectory()) buscarArchivos(ruta);
            else if (extensiones.includes(path.extname(f).toLowerCase())) archivos.push(ruta);
        });
    }
    buscarArchivos(CARPETA_IMAGENES);

    if (archivos.length === 0) {
        console.log(`No se encontraron imágenes en '${CARPETA_IMAGENES}'`);
        return;
    }

    console.log(`\nEncontradas ${archivos.length} imágenes locales...`);

    let saltadas = 0, procesadas = 0, errores = 0;

    for (let i = 0; i < archivos.length; i++) {
        const ruta = archivos[i];
        const nombre = path.basename(ruta);
        const rutaRelativa = path.relative(CARPETA_IMAGENES, ruta);
        const rutaSalida = path.join(CARPETA_SALIDA, rutaRelativa);

        // SALTAR si ya existe
        if (fs.existsSync(rutaSalida)) {
            saltadas++;
            continue;
        }

        process.stdout.write(`  [${i+1}/${archivos.length}] ${nombre}... `);
        try {
            const buffer = fs.readFileSync(ruta);
            const resultado = await quitarFondo(buffer);
            fs.mkdirSync(path.dirname(rutaSalida), { recursive: true });
            fs.writeFileSync(rutaSalida, resultado);
            procesadas++;
            console.log('OK');
        } catch (e) {
            errores++;
            console.log(`ERROR: ${e.message}`);
        }
    }

    console.log(`\nLocales: ${procesadas} nuevas, ${saltadas} ya existían, ${errores} errores`);
    if (procesadas > 0) console.log(`Guardadas en '${CARPETA_SALIDA}/'`);
}

async function procesarMongoDB() {
    console.log('\nConectando a MongoDB...');
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('macline');
        const col = db.collection('productos');
        const productos = await col.find({}).toArray();
        console.log(`Conectado. ${productos.length} productos encontrados.`);

        const salida = path.join(CARPETA_SALIDA, 'mongodb');
        fs.mkdirSync(salida, { recursive: true });

        let total = 0, procesados = 0, saltados = 0;

        for (const producto of productos) {
            const nombre = (producto.nombre || 'Sin nombre').substring(0, 30);
            const prodId = String(producto.id || producto._id);
            const cambios = {};

            // Portada
            const portada = producto.imagenPortada || '';
            if (portada.startsWith('data:')) {
                total++;
                const archivoSalida = path.join(salida, `${prodId}_portada.webp`);

                // SALTAR si ya existe
                if (fs.existsSync(archivoSalida)) {
                    saltados++;
                } else {
                    process.stdout.write(`  Portada de '${nombre}'... `);
                    try {
                        const buffer = Buffer.from(portada.split(',')[1], 'base64');
                        const resultado = await quitarFondo(buffer);
                        fs.writeFileSync(archivoSalida, resultado);
                        if (ACTUALIZAR_MONGO) {
                            cambios.imagenPortada = `data:image/webp;base64,${resultado.toString('base64')}`;
                        }
                        procesados++;
                        console.log('OK');
                    } catch(e) {
                        console.log(`ERROR: ${e.message}`);
                    }
                }
            }

            // Imágenes adicionales
            const imagenes = producto.imagenes || [];
            const nuevasImagenes = [...imagenes];
            for (let idx = 0; idx < imagenes.length; idx++) {
                const img = imagenes[idx];
                if (img && img.startsWith('data:')) {
                    total++;
                    const archivoSalida = path.join(salida, `${prodId}_img${idx+1}.webp`);

                    // SALTAR si ya existe
                    if (fs.existsSync(archivoSalida)) {
                        saltados++;
                    } else {
                        process.stdout.write(`  Imagen ${idx+1} de '${nombre}'... `);
                        try {
                            const buffer = Buffer.from(img.split(',')[1], 'base64');
                            const resultado = await quitarFondo(buffer);
                            fs.writeFileSync(archivoSalida, resultado);
                            if (ACTUALIZAR_MONGO) {
                                nuevasImagenes[idx] = `data:image/webp;base64,${resultado.toString('base64')}`;
                            }
                            procesados++;
                            console.log('OK');
                        } catch(e) {
                            console.log(`ERROR: ${e.message}`);
                        }
                    }
                }
            }

            if (ACTUALIZAR_MONGO && Object.keys(cambios).length > 0) {
                if (JSON.stringify(nuevasImagenes) !== JSON.stringify(imagenes)) {
                    cambios.imagenes = nuevasImagenes;
                }
                await col.updateOne({ _id: producto._id }, { $set: cambios });
            }
        }

        console.log(`\nMongoDB: ${procesados} nuevas, ${saltados} ya existían`);
        if (procesados > 0 && ACTUALIZAR_MONGO) console.log('Imágenes actualizadas en MongoDB OK');

    } catch(e) {
        console.log(`Error MongoDB: ${e.message}`);
    } finally {
        await client.close();
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('  MAC LINE - Quitar fondo a imágenes');
    console.log('='.repeat(50));
    await procesarCarpeta();
    await procesarMongoDB();
    console.log('\n' + '='.repeat(50));
    console.log("  Listo! Revisa 'img-sin-fondo/'");
    console.log('='.repeat(50));
}

main().catch(console.error);
