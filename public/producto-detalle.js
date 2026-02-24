// producto-detalle.js - FIX PRECIOS Y 6 IMÁGENES
// API_URL ya está declarado en script.js

let productoActual = null;
let imagenActualIndex = 0;
let imagenesProducto = [];

// Cargar producto al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get('id');
    
    if (productoId) {
        cargarProducto(productoId);
    } else {
        window.location.href = 'index.html';
    }
});

// Cargar datos del producto
async function cargarProducto(id) {
    try {
        const response = await fetch(`${API_URL}/productos/${id}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        
        productoActual = await response.json();
        mostrarProducto(productoActual);
    } catch (error) {
        console.error('Error:', error);
        alert('Producto no encontrado');
        window.location.href = 'index.html';
    }
}

// Mostrar producto en la página
function mostrarProducto(producto) {
    // TÍTULO Y CATEGORÍA
    document.title = `${producto.nombre} - MAC LINE`;
    document.getElementById('pageTitle').textContent = `${producto.nombre} - MAC LINE`;
    document.getElementById('productoTitulo').textContent = producto.nombre;
    document.getElementById('productoCategoria').textContent = producto.categoria.toUpperCase();
    
    // SKU (opcional)
    const skuEl = document.getElementById('productoSku');
    if (skuEl && producto.id) {
        skuEl.textContent = `SKU: ${String(producto.id).substring(0, 8)}`;
    }
    
    // PRECIOS - FIX AQUÍ
    const precioFinal = producto.precio;  // ← Precio con descuento (verde)
    const precioOriginal = producto.precioOriginal;  // ← Precio antes del descuento (tachado)
    const descuento = producto.descuento || 0;
    
    console.log('💰 Precios del producto:');
    console.log('  Precio Original:', precioOriginal);
    console.log('  Descuento:', descuento + '%');
    console.log('  Precio Final:', precioFinal);
    
    // Mostrar precio final
    document.getElementById('productoPrecio').textContent = `$${precioFinal.toLocaleString('es-CL')}`;
    
    // Mostrar precio original tachado si existe
    const precioOriginalEl = document.getElementById('precioOriginalDetalle');
    if (precioOriginalEl) {
        if (precioOriginal && descuento > 0) {
            precioOriginalEl.textContent = `Antes: $${precioOriginal.toLocaleString('es-CL')}`;
            precioOriginalEl.style.display = 'block';
        } else {
            precioOriginalEl.style.display = 'none';
        }
    }
    
    // Mostrar badge de descuento
    const descuentoBadgeEl = document.getElementById('descuentoBadge');
    if (descuentoBadgeEl) {
        if (descuento > 0) {
            descuentoBadgeEl.textContent = `-${descuento}%`;
            descuentoBadgeEl.style.display = 'inline-block';
        } else {
            descuentoBadgeEl.style.display = 'none';
        }
    }
    
    // STOCK
    const stockEl = document.getElementById('productoStock');
    if (stockEl) {
        if (producto.stock === 0) {
            stockEl.innerHTML = '<span class="stock-agotado">✗ Agotado</span>';
        } else if (producto.stock < 5) {
            stockEl.innerHTML = `<span class="stock-bajo">⚠ Solo ${producto.stock} disponibles</span>`;
        } else {
            stockEl.innerHTML = `<span class="stock-disponible">✓ ${producto.stock} disponibles</span>`;
        }
    }
    
    // DESCRIPCIÓN
    const descripcionEl = document.getElementById('productoDescripcion');
    if (descripcionEl) {
        descripcionEl.textContent = producto.descripcion || 'Sin descripción disponible.';
    }
    
    // IMÁGENES - CARGAR 6 IMÁGENES (1 PORTADA + 5 ADICIONALES)
    imagenesProducto = [];
    
    // Agregar portada
    if (producto.imagenPortada) {
        imagenesProducto.push(producto.imagenPortada);
    }
    
    // Agregar imágenes adicionales
    if (producto.imagenes && Array.isArray(producto.imagenes)) {
        imagenesProducto = imagenesProducto.concat(producto.imagenes);
    }
    
    console.log('📸 Total imágenes cargadas:', imagenesProducto.length);
    
    // Si no hay imágenes, usar emoji
    if (imagenesProducto.length === 0 && producto.emoji) {
        document.getElementById('imagenPrincipal').innerHTML = `<span style="font-size: 8rem;">${producto.emoji}</span>`;
    } else {
        mostrarImagen(0);
        crearThumbnails();
    }
}

// Mostrar imagen en el carrusel
function mostrarImagen(index) {
    if (imagenesProducto.length === 0) return;
    
    imagenActualIndex = index;
    const imagenEl = document.getElementById('imagenPrincipal');
    
    if (imagenEl) {
        imagenEl.innerHTML = `<img src="${imagenesProducto[index]}" alt="${productoActual?.nombre || 'Producto'}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 6rem;\\'>📦</span>';">`;
    }
    
    // Actualizar thumbnails activos
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// Crear thumbnails de las imágenes
function crearThumbnails() {
    const container = document.getElementById('thumbnailsContainer');
    if (!container || imagenesProducto.length === 0) return;
    
    container.innerHTML = imagenesProducto.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="mostrarImagen(${index})">
            <img src="${img}" alt="Vista ${index + 1}">
        </div>
    `).join('');
}

// Cambiar imagen (botones anterior/siguiente)
function cambiarImagen(direccion) {
    if (imagenesProducto.length === 0) return;
    
    imagenActualIndex = (imagenActualIndex + direccion + imagenesProducto.length) % imagenesProducto.length;
    mostrarImagen(imagenActualIndex);
}

// Agregar al carrito desde detalle
function agregarAlCarritoDetalle() {
    if (!productoActual) {
        alert('❌ Error: Producto no cargado');
        return;
    }
    
    if (productoActual.stock === 0) {
        alert('❌ Producto agotado');
        return;
    }
    
    // Obtener ID correcto
    const productoId = productoActual.id || productoActual._id || String(productoActual._id);
    
    // Obtener color y capacidad si existen
    const colorSelect = document.getElementById('colorProducto');
    const capacidadSelect = document.getElementById('capacidadProducto');
    
    const colorSeleccionado = colorSelect ? colorSelect.value : null;
    const capacidadSeleccionada = capacidadSelect ? capacidadSelect.value : null;
    const incrementoPrecio = capacidadSelect ? parseInt(capacidadSelect.options[capacidadSelect.selectedIndex]?.dataset.incremento || 0) : 0;
    
    const precioFinal = productoActual.precio + incrementoPrecio;
    
    // Obtener carrito actual
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    // Buscar si ya existe (mismo producto, color y capacidad)
    const existe = carrito.find(item => {
        const itemId = item.id || item._id || String(item._id);
        return String(itemId) === String(productoId) && 
               item.color === colorSeleccionado && 
               item.capacidad === capacidadSeleccionada;
    });
    
    if (existe) {
        if (existe.cantidad >= productoActual.stock) {
            alert(`⚠️ Solo hay ${productoActual.stock} unidades disponibles`);
            return;
        }
        existe.cantidad++;
    } else {
        const itemCarrito = {
            id: productoId,
            nombre: productoActual.nombre,
            precio: precioFinal,
            cantidad: 1,
            imagenPortada: productoActual.imagenPortada || productoActual.emoji,
            emoji: productoActual.emoji || '📦',
            color: colorSeleccionado,
            capacidad: capacidadSeleccionada,
            stock: productoActual.stock
        };
        
        carrito.push(itemCarrito);
    }
    
    // Guardar
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    console.log('✅ Carrito actualizado:', carrito);
    
    // Actualizar contador
    actualizarContadorCarrito();
    
    // Notificación mejorada
    const mensaje = colorSeleccionado || capacidadSeleccionada 
        ? `✅ ${productoActual.nombre}\n${colorSeleccionado ? `Color: ${colorSeleccionado}` : ''}\n${capacidadSeleccionada ? `Capacidad: ${capacidadSeleccionada}` : ''}\n¡Agregado al carrito!`
        : `✅ ${productoActual.nombre} agregado al carrito`;
    
    alert(mensaje);
    
    // Opcional: Animar el botón
    const btn = document.querySelector('.btn-agregar-carrito-detalle');
    if (btn) {
        btn.textContent = '✓ Agregado';
        btn.style.background = '#22c55e';
        setTimeout(() => {
            btn.textContent = '🛒 Agregar al Carrito';
            btn.style.background = '';
        }, 2000);
    }
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = total;
        if (total > 0) {
            el.style.display = 'flex';
        }
    });
}

// Cargar contador al iniciar
actualizarContadorCarrito();
