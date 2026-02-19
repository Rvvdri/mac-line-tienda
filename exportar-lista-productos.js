const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

/**
 * EXPORTAR LISTA DE PRODUCTOS PARA DESCARGAR IMÁGENES
 * ====================================================
 * Genera un archivo CSV con todos los productos y los nombres
 * exactos que deben tener sus imágenes.
 */

async function exportarListaProductos() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        console.log('🔌 Conectando a MongoDB...');
        await client.connect();
        console.log('✅ Conectado\n');
        
        const db = client.db('macline');
        const productos = await db.collection('productos')
            .find({})
            .sort({ categoria: 1, nombre: 1 })
            .toArray();
        
        console.log(`📦 ${productos.length} productos encontrados\n`);
        
        // Crear CSV
        let csv = 'Nro,Categoria,Producto,ID,Portada,Imagen1,Imagen2,Imagen3,Imagen4,Imagen5,Imagen6\n';
        
        // Crear archivo de texto legible
        let texto = '═'.repeat(100) + '\n';
        texto += '📋 LISTA DE PRODUCTOS - NOMBRES DE ARCHIVOS DE IMÁGENES\n';
        texto += '═'.repeat(100) + '\n\n';
        texto += 'Guarda las imágenes con estos nombres EXACTOS en: public/images/productos/\n';
        texto += 'Formatos soportados: .jpg, .png, .jpeg\n\n';
        
        let categoriaActual = '';
        
        productos.forEach((p, idx) => {
            const id = p.id;
            const nro = idx + 1;
            
            // Para el CSV
            csv += `${nro},${p.categoria},${p.nombre},${id},`;
            csv += `producto-${id}-portada,`;
            csv += `producto-${id}-1,`;
            csv += `producto-${id}-2,`;
            csv += `producto-${id}-3,`;
            csv += `producto-${id}-4,`;
            csv += `producto-${id}-5,`;
            csv += `producto-${id}-6\n`;
            
            // Para el texto legible
            if (p.categoria !== categoriaActual) {
                categoriaActual = p.categoria;
                texto += '\n' + '─'.repeat(100) + '\n';
                texto += `📂 ${categoriaActual.toUpperCase()}\n`;
                texto += '─'.repeat(100) + '\n\n';
            }
            
            texto += `${nro}. ${p.nombre}\n`;
            texto += `   ID: ${id}\n`;
            texto += `   📸 IMÁGENES A DESCARGAR (6 en total):\n`;
            texto += `      ├─ producto-${id}-portada.jpg    (Imagen principal)\n`;
            texto += `      ├─ producto-${id}-1.jpg\n`;
            texto += `      ├─ producto-${id}-2.jpg\n`;
            texto += `      ├─ producto-${id}-3.jpg\n`;
            texto += `      ├─ producto-${id}-4.jpg\n`;
            texto += `      ├─ producto-${id}-5.jpg\n`;
            texto += `      └─ producto-${id}-6.jpg\n\n`;
        });
        
        // Guardar archivos
        fs.writeFileSync('lista-productos.csv', csv);
        fs.writeFileSync('lista-productos.txt', texto);
        
        console.log('═'.repeat(80));
        console.log('✅ ARCHIVOS GENERADOS:');
        console.log('═'.repeat(80));
        console.log('📄 lista-productos.csv  - Para abrir en Excel/Google Sheets');
        console.log('📄 lista-productos.txt  - Para leer fácilmente');
        console.log('═'.repeat(80));
        console.log(`\n📊 Total de productos: ${productos.length}`);
        console.log(`📸 Imágenes necesarias: ${productos.length * 6} (6 por producto)\n`);
        
        console.log('💡 SIGUIENTE PASO:');
        console.log('   1. Abre lista-productos.txt para ver todos los productos');
        console.log('   2. Descarga 6 imágenes para cada producto');
        console.log('   3. Nómbralas EXACTAMENTE como dice el archivo');
        console.log('   4. Guárdalas en: public/images/productos/');
        console.log('   5. Ejecuta: node configurar-todas-imagenes.js\n');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

exportarListaProductos();
