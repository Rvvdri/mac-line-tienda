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
    if (!productoActual) return;
    
    if (productoActual.stock === 0) {
        alert('❌ Producto agotado');
        return;
    }
    
    // Obtener carrito actual
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    // Buscar si ya existe
    const existe = carrito.find(item => item.id === productoActual.id);
    
    if (existe) {
        if (existe.cantidad >= productoActual.stock) {
            alert(`⚠️ Solo hay ${productoActual.stock} unidades disponibles`);
            return;
        }
        existe.cantidad++;
    } else {
        carrito.push({
            ...productoActual,
            cantidad: 1
        });
    }
    
    // Guardar
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar contador
    actualizarContadorCarrito();
    
    // Notificación
    alert(`✅ ${productoActual.nombre} agregado al carrito`);
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

// ========== FUNCIONES DE PAGO ==========

function procederPago() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const carritoModal = document.getElementById('carritoModal');
    const pagoModal = document.getElementById('pagoModal');
    
    if (carritoModal) carritoModal.style.display = 'none';
    if (pagoModal) pagoModal.style.display = 'flex';
    
    // Calcular subtotal
    const subtotal = carrito.reduce((sum, item) => {
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 1;
        return sum + (precio * cantidad);
    }, 0);
    
    // Mostrar/ocultar secciones según subtotal
    const seccionMetodoEntrega = document.getElementById('seccionMetodoEntrega');
    const mensajeEnvioGratis = document.getElementById('mensajeEnvioGratis');
    const envioPagoWrapper = document.getElementById('envioPagoWrapper');
    
    let envio = 0;
    
    if (subtotal >= 100000) {
        // ENVÍO GRATIS
        if (seccionMetodoEntrega) seccionMetodoEntrega.style.display = 'none';
        if (mensajeEnvioGratis) mensajeEnvioGratis.style.display = 'block';
        envio = 0;
        if (envioPagoWrapper) {
            envioPagoWrapper.innerHTML = '<span style="color: #00d4ff; font-weight: 700;">GRATIS ✅</span>';
        }
    } else {
        // MOSTRAR OPCIONES DE ENVÍO
        if (seccionMetodoEntrega) seccionMetodoEntrega.style.display = 'block';
        if (mensajeEnvioGratis) mensajeEnvioGratis.style.display = 'none';
        const metodoEntregaSeleccionado = document.querySelector('input[name="metodoEntrega"]:checked');
        envio = metodoEntregaSeleccionado ? parseInt(metodoEntregaSeleccionado.dataset.precio) : 3990;
        if (envioPagoWrapper) {
            envioPagoWrapper.innerHTML = '$<span id="envioPago">' + envio.toLocaleString('es-CL') + '</span>';
        }
    }
    
    const total = subtotal + envio;
    
    const subtotalEl = document.getElementById('subtotalPago');
    const totalEl = document.getElementById('totalPago');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('es-CL');
    if (totalEl) totalEl.textContent = total.toLocaleString('es-CL');
}

function actualizarTotalPago() {
    const subtotalEl = document.getElementById('subtotalPago');
    const totalEl = document.getElementById('totalPago');
    const envioPagoWrapper = document.getElementById('envioPagoWrapper');
    
    if (!subtotalEl || !totalEl) return;
    
    const subtotal = parseInt(subtotalEl.textContent.replace(/\./g, '')) || 0;
    let envio = 0;
    
    if (subtotal >= 100000) {
        // ENVÍO GRATIS
        envio = 0;
        if (envioPagoWrapper) {
            envioPagoWrapper.innerHTML = '<span style="color: #00d4ff; font-weight: 700;">GRATIS ✅</span>';
        }
    } else {
        // Obtener método de entrega seleccionado
        const metodoEntregaSeleccionado = document.querySelector('input[name="metodoEntrega"]:checked');
        envio = metodoEntregaSeleccionado ? parseInt(metodoEntregaSeleccionado.dataset.precio) : 3990;
        if (envioPagoWrapper) {
            envioPagoWrapper.innerHTML = '$<span id="envioPago">' + envio.toLocaleString('es-CL') + '</span>';
        }
    }
    
    const total = subtotal + envio;
    totalEl.textContent = total.toLocaleString('es-CL');
}

function cerrarPago() {
    const modal = document.getElementById('pagoModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

async function procesarPago(event) {
    event.preventDefault();
    
    const nombreEl = document.getElementById('nombre');
    const emailEl = document.getElementById('email');
    const telefonoEl = document.getElementById('telefono');
    const regionEl = document.getElementById('region');
    const comunaEl = document.getElementById('comuna');
    const direccionEl = document.getElementById('direccion');
    const numeroEl = document.getElementById('numero');
    const complementoEl = document.getElementById('complemento');
    
    if (!nombreEl || !emailEl || !telefonoEl || !regionEl || !comunaEl || !direccionEl || !numeroEl) {
        alert('Error: Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Calcular subtotal
    const subtotal = carrito.reduce((sum, item) => {
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 1;
        return sum + (precio * cantidad);
    }, 0);
    
    // Determinar método de entrega y costo
    let metodoEntrega;
    let costoEnvio;
    
    if (subtotal >= 100000) {
        // ENVÍO GRATIS
        metodoEntrega = {
            tipo: 'gratis',
            nombre: 'Envío Gratis (Compra sobre $100.000)',
            precio: 0
        };
        costoEnvio = 0;
    } else {
        // Obtener método seleccionado
        const metodoEntregaSeleccionado = document.querySelector('input[name="metodoEntrega"]:checked');
        if (!metodoEntregaSeleccionado) {
            alert('Por favor selecciona un método de entrega');
            return;
        }
        
        metodoEntrega = {
            tipo: metodoEntregaSeleccionado.value,
            nombre: metodoEntregaSeleccionado.value === 'normal' ? 'Envío Normal (3-5 días)' : 'Envío Flash (24-48h)',
            precio: parseInt(metodoEntregaSeleccionado.dataset.precio)
        };
        costoEnvio = metodoEntrega.precio;
    }
    
    // Construir dirección completa
    const complemento = complementoEl ? complementoEl.value : '';
    const direccionCompleta = `${direccionEl.value} ${numeroEl.value}${complemento ? ', ' + complemento : ''}, ${comunaEl.value}, ${regionEl.options[regionEl.selectedIndex].text}`;
    
    const datosCliente = {
        nombre: nombreEl.value,
        email: emailEl.value,
        telefono: telefonoEl.value,
        region: regionEl.options[regionEl.selectedIndex].text,
        comuna: comunaEl.value,
        direccion: direccionEl.value,
        numero: numeroEl.value,
        complemento: complemento,
        direccionCompleta: direccionCompleta
    };
    
    const total = subtotal + costoEnvio;
    
    const datosCompra = {
        cliente: datosCliente,
        items: carrito,
        metodoEntrega: metodoEntrega,
        subtotal: subtotal,
        costoEnvio: costoEnvio,
        total: total
    };
    
    console.log('📦 Datos de compra:', datosCompra);
    alert('Función de pago en desarrollo. Ver consola para datos.');
}
