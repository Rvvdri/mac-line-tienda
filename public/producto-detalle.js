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
    
    // SELECTORES DE VARIANTES (Color y Capacidad) - MEJORADOS
    const selectoresDiv = document.getElementById('selectoresVariantes');
    if (selectoresDiv) {
        let selectoresHTML = '';
        
        // Selector de COLOR - Estilo mejorado con círculos de colores
        if (producto.colores && producto.colores.length > 0) {
            selectoresHTML += `
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.75rem; color: #f8f9fa; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        🎨 Color: <span id="colorSeleccionadoTexto" style="color: #00d4ff; font-weight: 700;">${producto.colores[0]}</span>
                    </label>
                    <div id="colorProducto" style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        ${producto.colores.map((color, index) => {
                            const colorMap = {
                                'Negro': '#000000',
                                'Blanco': '#FFFFFF',
                                'Azul': '#0066CC',
                                'Rojo': '#FF0000',
                                'Verde': '#00CC66',
                                'Rosa': '#FF69B4',
                                'Gris': '#808080',
                                'Dorado': '#FFD700',
                                'Plata': '#C0C0C0',
                                'Morado': '#9B59B6',
                                'Amarillo': '#FFD700',
                                'Naranja': '#FF6B35',
                                'Titanio Natural': '#E8E8E8',
                                'Titanio Azul': '#5B7C99',
                                'Titanio Blanco': '#F5F5F5',
                                'Titanio Negro': '#2C2C2C',
                                'Gris Espacial': '#4A4A4A'
                            };
                            const colorHex = colorMap[color] || '#667eea';
                            const borderColor = color.includes('Blanco') || color.includes('Plata') ? '#555' : colorHex;
                            
                            return `
                                <div class="color-option ${index === 0 ? 'selected' : ''}" 
                                     data-color="${color}"
                                     onclick="seleccionarColor('${color}')"
                                     style="
                                         cursor: pointer;
                                         text-align: center;
                                         transition: all 0.3s;
                                     ">
                                    <div style="
                                        width: 40px;
                                        height: 40px;
                                        border-radius: 50%;
                                        background: ${colorHex};
                                        border: 2px solid ${borderColor};
                                        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                                        margin: 0 auto 0.35rem;
                                        transition: all 0.3s;
                                    " class="color-circle"></div>
                                    <span style="font-size: 0.7rem; color: #b0b0b0; display: block;">${color}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <style>
                    .color-option:hover .color-circle {
                        transform: scale(1.15);
                        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4) !important;
                    }
                    .color-option.selected .color-circle {
                        border-width: 3px !important;
                        box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.4), 0 4px 12px rgba(0, 212, 255, 0.3) !important;
                    }
                    .color-option.selected span {
                        color: #00d4ff !important;
                        font-weight: 600;
                    }
                </style>
            `;
        }
        
        // Selector de CAPACIDAD - Estilo mejorado con tarjetas más pequeñas
        if (producto.capacidades && producto.capacidades.length > 0) {
            selectoresHTML += `
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.75rem; color: #f8f9fa; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px;">💾 Capacidad:</label>
                    <div id="capacidadProducto" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 0.6rem;">
                        ${producto.capacidades.map((cap, index) => {
                            const nombreCap = cap.nombre || `${cap.capacidad || 'N/A'}`;
                            const incremento = cap.precioIncremental || 0;
                            
                            return `
                            <div class="capacidad-option ${index === 0 ? 'selected' : ''}"
                                 data-incremento="${incremento}"
                                 data-nombre="${nombreCap}"
                                 onclick="seleccionarCapacidad('${nombreCap}', ${incremento})"
                                 style="
                                     cursor: pointer;
                                     padding: 0.75rem 0.5rem;
                                     border: 2px solid #444;
                                     border-radius: 10px;
                                     text-align: center;
                                     transition: all 0.3s;
                                     background: rgba(30, 30, 30, 0.6);
                                     backdrop-filter: blur(10px);
                                 ">
                                <div style="font-weight: 700; font-size: 0.95rem; color: #f8f9fa; margin-bottom: 0.15rem;">
                                    ${nombreCap}
                                </div>
                                <div style="font-size: 0.75rem; color: #00d4ff; font-weight: 600;">
                                    ${incremento > 0 ? `+$${(incremento/1000).toFixed(0)}K` : 'Incluido'}
                                </div>
                            </div>
                        `;
                        }).join('')}
                    </div>
                    <div style="margin-top: 1.25rem; padding: 0.85rem; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); border-radius: 10px; text-align: center; box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);">
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.95); margin-bottom: 0.2rem; font-weight: 600;">Precio Total:</div>
                        <div id="precioTotalDetalle" style="font-size: 1.75rem; font-weight: 700; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            $${precioFinal.toLocaleString('es-CL')}
                        </div>
                    </div>
                </div>
                <style>
                    .capacidad-option:hover {
                        border-color: #00d4ff;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
                        background: rgba(0, 212, 255, 0.1);
                    }
                    .capacidad-option.selected {
                        border-color: #00d4ff;
                        background: rgba(0, 212, 255, 0.15);
                        box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.3), 0 4px 12px rgba(0, 212, 255, 0.4);
                    }
                    .capacidad-option.selected > div:first-child {
                        color: #00d4ff;
                    }
                </style>
            `;
        }
        
        selectoresDiv.innerHTML = selectoresHTML;
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
    
    // Obtener color y capacidad de los nuevos selectores visuales
    let colorSeleccionado = null;
    let capacidadSeleccionada = null;
    let incrementoPrecio = 0;
    
    // Obtener COLOR del selector visual
    const colorSeleccionadoDiv = document.querySelector('.color-option.selected');
    if (colorSeleccionadoDiv) {
        colorSeleccionado = colorSeleccionadoDiv.dataset.color;
    }
    
    // Obtener CAPACIDAD del selector visual
    const capacidadSeleccionadaDiv = document.querySelector('.capacidad-option.selected');
    if (capacidadSeleccionadaDiv) {
        capacidadSeleccionada = capacidadSeleccionadaDiv.dataset.nombre;
        incrementoPrecio = parseInt(capacidadSeleccionadaDiv.dataset.incremento) || 0;
    }
    
    const precioFinal = (productoActual.precio || 0) + incrementoPrecio;
    
    console.log('💰 Calculando precio:');
    console.log('  - Precio base:', productoActual.precio);
    console.log('  - Incremento:', incrementoPrecio);
    console.log('  - Precio final:', precioFinal);
    
    if (!precioFinal || precioFinal === 0) {
        alert('⚠️ Error: El producto no tiene precio configurado');
        console.error('❌ Producto sin precio:', productoActual);
        return;
    }
    
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
            imagenPortada: productoActual.imagenPortada || null,
            emoji: productoActual.emoji || '📦',
            color: colorSeleccionado,
            capacidad: capacidadSeleccionada,
            stock: productoActual.stock,
            categoria: productoActual.categoria
        };
        
        console.log('📦 Nuevo item para carrito:', itemCarrito);
        
        carrito.push(itemCarrito);
    }
    
    // Guardar
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    console.log('✅ Carrito guardado en localStorage');
    console.log('📦 Total items:', carrito.length);
    console.log('🛒 Carrito completo:', JSON.stringify(carrito, null, 2));
    
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

// Actualizar precio cuando cambia la capacidad
function actualizarPrecioDetalle() {
    if (!productoActual) return;
    
    const capacidadSelect = document.getElementById('capacidadProducto');
    const precioTotalEl = document.getElementById('precioTotalDetalle');
    
    if (capacidadSelect && precioTotalEl) {
        const incremento = parseInt(capacidadSelect.value) || 0;
        const precioTotal = productoActual.precio + incremento;
        precioTotalEl.textContent = `$${precioTotal.toLocaleString('es-CL')}`;
    }
}

// Seleccionar color
function seleccionarColor(color) {
    // Actualizar texto
    const textoEl = document.getElementById('colorSeleccionadoTexto');
    if (textoEl) textoEl.textContent = color;
    
    // Actualizar clases selected
    document.querySelectorAll('.color-option').forEach(el => {
        el.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
}

// Seleccionar capacidad
function seleccionarCapacidad(nombre, incremento) {
    // Actualizar clases selected
    document.querySelectorAll('.capacidad-option').forEach(el => {
        el.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Actualizar precio
    if (productoActual) {
        const precioTotal = productoActual.precio + incremento;
        const precioTotalEl = document.getElementById('precioTotalDetalle');
        if (precioTotalEl) {
            precioTotalEl.textContent = `$${precioTotal.toLocaleString('es-CL')}`;
        }
    }
}

// Cargar contador al iniciar
actualizarContadorCarrito();
