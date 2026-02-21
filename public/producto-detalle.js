// producto-detalle.js - CON VARIANTES (COLORES Y CAPACIDADES)
// API_URL ya está declarado en script.js

let productoActual = null;
let imagenActualIndex = 0;
let imagenesProducto = [];

// Variables de variantes
let colorSeleccionado = null;
let capacidadSeleccionada = null;

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
    
    // SELECTORES DE VARIANTES (Color y Capacidad)
    mostrarSelectoresVariantes(producto);
    
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

// ========== FUNCIONES DE VARIANTES ==========

function mostrarSelectoresVariantes(producto) {
    const container = document.getElementById('selectoresVariantes');
    
    // Si no existe el contenedor, no hacer nada
    if (!container) {
        console.log('⚠️ Contenedor selectoresVariantes no encontrado');
        return;
    }
    
    // Si no tiene variantes, limpiar contenedor
    if (!producto.colores && !producto.capacidades) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // SELECTOR DE COLOR
    if (producto.colores && producto.colores.length > 0) {
        colorSeleccionado = producto.colores[0]; // Seleccionar primer color por defecto
        
        html += `
            <div class="selector-variante">
                <label class="variante-label">Color:</label>
                <div class="opciones-variante">
                    ${producto.colores.map((color, index) => `
                        <button 
                            class="opcion-color ${index === 0 ? 'active' : ''}" 
                            onclick="seleccionarColor('${color}')"
                            title="${color}">
                            ${color}
                        </button>
                    `).join('')}
                </div>
                <p class="variante-seleccionada" id="colorSeleccionado">${colorSeleccionado}</p>
            </div>
        `;
    }
    
    // SELECTOR DE CAPACIDAD
    if (producto.capacidades && producto.capacidades.length > 0) {
        capacidadSeleccionada = producto.capacidades[0]; // Seleccionar primera capacidad por defecto
        
        html += `
            <div class="selector-variante">
                <label class="variante-label">Almacenamiento:</label>
                <div class="opciones-variante">
                    ${producto.capacidades.map((cap, index) => `
                        <button 
                            class="opcion-capacidad ${index === 0 ? 'active' : ''}" 
                            onclick='seleccionarCapacidad(${JSON.stringify(cap)})'>
                            ${cap.almacenamiento}
                            <span class="precio-capacidad">$${cap.precio.toLocaleString('es-CL')}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Actualizar precio si tiene capacidades
    if (producto.capacidades && producto.capacidades.length > 0) {
        actualizarPrecioCapacidad(producto.capacidades[0].precio);
    }
}

function seleccionarColor(color) {
    colorSeleccionado = color;
    
    // Actualizar UI
    document.querySelectorAll('.opcion-color').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.trim() === color) {
            btn.classList.add('active');
        }
    });
    
    const colorEl = document.getElementById('colorSeleccionado');
    if (colorEl) {
        colorEl.textContent = color;
    }
    
    console.log('Color seleccionado:', color);
}

function seleccionarCapacidad(capacidad) {
    capacidadSeleccionada = capacidad;
    
    // Actualizar UI
    document.querySelectorAll('.opcion-capacidad').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(capacidad.almacenamiento)) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar precio
    actualizarPrecioCapacidad(capacidad.precio);
    
    console.log('Capacidad seleccionada:', capacidad);
}

function actualizarPrecioCapacidad(nuevoPrecio) {
    const precioEl = document.getElementById('productoPrecio');
    if (precioEl) {
        precioEl.textContent = `$${nuevoPrecio.toLocaleString('es-CL')}`;
    }
}

// ========== FIN FUNCIONES DE VARIANTES ==========

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
    if (!productoActual) return;
    
    if (productoActual.stock === 0) {
        alert('❌ Producto agotado');
        return;
    }
    
    // Obtener carrito actual
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    // Crear objeto del producto con variantes
    const productoConVariantes = {
        ...productoActual,
        cantidad: 1
    };
    
    // Agregar variantes seleccionadas si existen
    if (colorSeleccionado) {
        productoConVariantes.color = colorSeleccionado;
    }
    
    if (capacidadSeleccionada) {
        productoConVariantes.capacidad = capacidadSeleccionada.almacenamiento;
        productoConVariantes.precio = capacidadSeleccionada.precio; // Usar precio de la capacidad seleccionada
    }
    
    // Buscar si ya existe con las mismas variantes
    const existe = carrito.find(item => 
        item.id === productoActual.id &&
        item.color === productoConVariantes.color &&
        item.capacidad === productoConVariantes.capacidad
    );
    
    if (existe) {
        if (existe.cantidad >= productoActual.stock) {
            alert(`⚠️ Solo hay ${productoActual.stock} unidades disponibles`);
            return;
        }
        existe.cantidad++;
    } else {
        carrito.push(productoConVariantes);
    }
    
    // Guardar
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar contador
    actualizarContadorCarrito();
    
    // Notificación con variantes
    let mensaje = `✅ ${productoActual.nombre} agregado al carrito`;
    if (colorSeleccionado && capacidadSeleccionada) {
        mensaje += `\n${colorSeleccionado} - ${capacidadSeleccionada.almacenamiento}`;
    } else if (colorSeleccionado) {
        mensaje += `\n${colorSeleccionado}`;
    } else if (capacidadSeleccionada) {
        mensaje += `\n${capacidadSeleccionada.almacenamiento}`;
    }
    alert(mensaje);
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = total;
    });
}

// Cargar contador al iniciar
actualizarContadorCarrito();
