const { MongoClient } = require('mongodb');
const fs = require('fs');

// IMPORTANTE: Reemplaza esto con tu cadena de conexión real de MongoDB
const MONGODB_URI = 'mongodb+srv://rvvdri:9j8rdlLqR4ACotdY@cluster0.vptvpzv.mongodb.net/macline';

// Emojis por marca
const emojis = {
  'Samsung': '📺',
  'Xiaomi': '🖥️',
  'Huawei': '📟',
  'Honor': '🎬'
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
  if (precio > 4000000) return Math.floor(Math.random() * 4) + 2; // 2-5 unidades (ultra premium 85"+)
  if (precio > 2500000) return Math.floor(Math.random() * 5) + 3; // 3-7 unidades (premium 75"+)
  if (precio > 1500000) return Math.floor(Math.random() * 7) + 4; // 4-10 unidades (alto 65-75")
  if (precio > 800000) return Math.floor(Math.random() * 10) + 6; // 6-15 unidades (medio 55-65")
  return Math.floor(Math.random() * 12) + 8; // 8-19 unidades (económico)
}

async function importarTelevisores() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('macline');
    const productosCollection = db.collection('productos');
    
    // Leer archivo JSON
    const televisoresData = JSON.parse(fs.readFileSync('./televisores-mac-line.json', 'utf8'));
    
    // Eliminar televisores existentes
    console.log('🗑️  Eliminando televisores existentes...');
    const deleteResult = await productosCollection.deleteMany({ 
      categoria: 'televisores' 
    });
    console.log(`✅ ${deleteResult.deletedCount} televisores eliminados`);
    
    // Preparar productos para insertar
    const productosParaInsertar = [];
    let idCounter = 1;
    
    // Procesar cada marca
    for (const [marca, modelos] of Object.entries(televisoresData)) {
      console.log(`\n📺 Procesando ${marca}...`);
      
      for (const modelo of modelos) {
        const precioFinal = generarPrecioChileno(modelo.precio_referencia_usd);
        const descuento = generarDescuento();
        const precioOriginal = Math.round(precioFinal / (1 - descuento/100));
        const stock = generarStock(precioFinal);
        
        const producto = {
          id: `TV${String(idCounter).padStart(3, '0')}`,
          nombre: modelo.nombre,
          categoria: 'televisores',
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
    console.log(`\n💾 Insertando ${productosParaInsertar.length} televisores...`);
    const insertResult = await productosCollection.insertMany(productosParaInsertar);
    console.log(`✅ ${insertResult.insertedCount} televisores insertados exitosamente\n`);
    
    // Resumen por marca
    console.log('📊 RESUMEN POR MARCA:');
    console.log('══════════════════════════════════════════════════');
    
    const marcas = ['Samsung', 'Xiaomi', 'Huawei', 'Honor'];
    for (const marca of marcas) {
      const productos = productosParaInsertar.filter(p => p.marca === marca);
      const precioMin = Math.min(...productos.map(p => p.precio));
      const precioMax = Math.max(...productos.map(p => p.precio));
      
      console.log(`${emojis[marca]} ${marca}: ${productos.length} modelos`);
      console.log(`   Rango: $${precioMin.toLocaleString('es-CL')} - $${precioMax.toLocaleString('es-CL')}\n`);
    }
    
    console.log('══════════════════════════════════════════════════');
    console.log(`🎉 TOTAL: ${productosParaInsertar.length} televisores importados`);
    console.log('✨ Base de datos actualizada correctamente\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
importarTelevisores();
