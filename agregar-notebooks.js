const { MongoClient } = require('mongodb');
const fs = require('fs');

// IMPORTANTE: Reemplaza esto con tu cadena de conexión real de MongoDB
const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

// Emojis por marca
const emojis = {
  'Apple': '💻',
  'Samsung': '⚡',
  'Xiaomi': '🖥️',
  'Huawei': '💼',
  'Honor': '🎯'
};

// Función para generar precio chileno realista basado en precio USD
function generarPrecioChileno(precioUSD) {
  const tasaCambio = 950; // 1 USD = 950 CLP aproximadamente
  const precioCLP = precioUSD * tasaCambio;
  
  // Redondear a miles y agregar margen comercial (15-25%)
  const margen = 1 + (Math.random() * 0.10 + 0.15); // 15-25%
  const precioFinal = Math.round((precioCLP * margen) / 1000) * 1000;
  
  // Asegurar que termine en 990
  return Math.floor(precioFinal / 1000) * 1000 + 990;
}

// Función para generar descuento realista
function generarDescuento() {
  const descuentos = [15, 17, 20, 22, 25, 27, 30];
  return descuentos[Math.floor(Math.random() * descuentos.length)];
}

// Función para generar stock realista
function generarStock(precio) {
  if (precio > 2000000) return Math.floor(Math.random() * 5) + 2; // 2-6 unidades (ultra premium)
  if (precio > 1500000) return Math.floor(Math.random() * 7) + 3; // 3-9 unidades (premium alto)
  if (precio > 1000000) return Math.floor(Math.random() * 8) + 5; // 5-12 unidades (premium)
  if (precio > 600000) return Math.floor(Math.random() * 10) + 8; // 8-17 unidades (medio-alto)
  return Math.floor(Math.random() * 12) + 10; // 10-21 unidades (económico)
}

async function importarNotebooks() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('macline');
    const productosCollection = db.collection('productos');
    
    // Leer archivo JSON
    const notebooksData = JSON.parse(fs.readFileSync('./notebooks-mac-line.json', 'utf8'));
    
    // Eliminar notebooks existentes
    console.log('🗑️  Eliminando notebooks existentes...');
    const deleteResult = await productosCollection.deleteMany({ 
      categoria: 'notebooks' 
    });
    console.log(`✅ ${deleteResult.deletedCount} notebooks eliminados`);
    
    // Preparar productos para insertar
    const productosParaInsertar = [];
    let idCounter = 1;
    
    // Procesar cada marca
    for (const [marca, modelos] of Object.entries(notebooksData)) {
      console.log(`\n💻 Procesando ${marca}...`);
      
      for (const modelo of modelos) {
        const precioFinal = generarPrecioChileno(modelo.precio_referencia_usd);
        const descuento = generarDescuento();
        const precioOriginal = Math.round(precioFinal / (1 - descuento/100));
        const stock = generarStock(precioFinal);
        
        const producto = {
          id: `NB${String(idCounter).padStart(3, '0')}`,
          nombre: modelo.nombre,
          categoria: 'notebooks',
          descripcion: `${modelo.marca} ${modelo.nombre} (${modelo.año}) - ${modelo.caracteristicas}`,
          precio: precioFinal,
          precioOriginal: precioOriginal,
          descuento: descuento,
          stock: stock,
          emoji: emojis[modelo.marca],
          marca: modelo.marca,
          año: modelo.año,
          fechaCreacion: new Date()
        };
        
        productosParaInsertar.push(producto);
        console.log(`  ✓ ${modelo.nombre} - $${precioFinal.toLocaleString('es-CL')} (${stock} unidades)`);
        idCounter++;
      }
    }
    
    // Insertar todos los productos
    console.log(`\n💾 Insertando ${productosParaInsertar.length} notebooks...`);
    const insertResult = await productosCollection.insertMany(productosParaInsertar);
    console.log(`✅ ${insertResult.insertedCount} notebooks insertados exitosamente\n`);
    
    // Resumen por marca
    console.log('📊 RESUMEN POR MARCA:');
    console.log('══════════════════════════════════════════════════');
    
    const marcas = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Honor'];
    for (const marca of marcas) {
      const productos = productosParaInsertar.filter(p => p.marca === marca);
      const precioMin = Math.min(...productos.map(p => p.precio));
      const precioMax = Math.max(...productos.map(p => p.precio));
      
      console.log(`${emojis[marca]} ${marca}: ${productos.length} modelos`);
      console.log(`   Rango: $${precioMin.toLocaleString('es-CL')} - $${precioMax.toLocaleString('es-CL')}\n`);
    }
    
    console.log('══════════════════════════════════════════════════');
    console.log(`🎉 TOTAL: ${productosParaInsertar.length} notebooks importados`);
    console.log('✨ Base de datos actualizada correctamente\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
importarNotebooks();
