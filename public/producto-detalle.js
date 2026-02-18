// producto-detalle.js con GALERÍA DE IMÁGENES
const API_URL_BASE = `${window.location.origin}/api`;
let productoActual = null;
let imagenesProducto = [];
let imagenActualIndex = 0;

// Cargar producto al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productoId = urlParams.get('id');
    
    if (!productoId) {
        alert('Producto no encontrado');
        window.location.href = 'index.html';
        return;
    }
    
    await cargarProductoDetalle(productoId);
    actualizarContadorCarrito();
});

async function cargarProductoDetalle(productoId) {
    try {
        const response = await fetch(`${API_URL_BASE}/productos`);
        
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        
        const productos = await response.json();
        
        productoActual = productos.find(p => {
            return String(p.id) === String(productoId);
        });
        
        if (!productoActual) {
            throw new Error('Producto no encontrado');
        }
        
        // Generar imágenes para el producto
        imagenesProducto = generarImagenesProducto(productoActual);
        
        renderizarProductoDetalle(productoActual);
        renderizarGaleria();
        
    } catch (error) {
        console.error('Error cargando producto:', error);
        alert('Error al cargar el producto');
        window.location.href = 'index.html';
    }
}

// Función para generar URLs de imágenes
function generarImagenesProducto(producto) {
    // Si el producto tiene imágenes en la base de datos, usarlas
    if (producto.imagenes && producto.imagenes.length > 0) {
        return producto.imagenes.map((url, index) => ({
            type: 'url',
            content: url,
            alt: `${producto.nombre} - Vista ${index + 1}`
        }));
    }
    
    // Fallback: Usar emoji si no hay imágenes
    const emoji = producto.emoji || '📱';
    return [
        { type: 'emoji', content: emoji, alt: `${producto.nombre} - Vista frontal` },
        { type: 'emoji', content: emoji, alt: `${producto.nombre} - Vista lateral derecha` },
        { type: 'emoji', content: emoji, alt: `${producto.nombre} - Vista lateral izquierda` },
        { type: 'emoji', content: emoji, alt: `${producto.nombre} - Vista trasera` },
        { type: 'emoji', content: emoji, alt: `${producto.nombre} - Con caja` }
    ];
}

function renderizarGaleria() {
    imagenActualIndex = 0;
    mostrarImagen(imagenActualIndex);
    renderizarThumbnails();
}

function mostrarImagen(index) {
    const imagenPrincipal = document.getElementById('imagenPrincipal');
    const currentImageIndex = document.getElementById('currentImageIndex');
    const totalImages = document.getElementById('totalImages');
    
    if (!imagenPrincipal) return;
    
    const imagen = imagenesProducto[index];
    
    if (imagen.type === 'emoji') {
        imagenPrincipal.innerHTML = imagen.content;
        imagenPrincipal.style.fontSize = '8rem';
    } else if (imagen.type === 'url') {
        imagenPrincipal.innerHTML = `<img src="${imagen.content}" alt="${imagen.alt}" onerror="this.parentElement.innerHTML='${productoActual.emoji || '📦'}'">`;
    }
    
    if (currentImageIndex) currentImageIndex.textContent = index + 1;
    if (totalImages) totalImages.textContent = imagenesProducto.length;
    
    imagenActualIndex = index;
}

function renderizarThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnailsContainer');
    if (!thumbnailsContainer) return;
    
    thumbnailsContainer.innerHTML = imagenesProducto.map((imagen, index) => {
        if (imagen.type === 'emoji') {
            return `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="seleccionarImagen(${index})">
                    <span class="thumbnail-emoji">${imagen.content}</span>
                </div>
            `;
        } else {
            return `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="seleccionarImagen(${index})">
                    <img src="${imagen.content}" alt="${imagen.alt}" onerror="this.parentElement.innerHTML='<span class=\\'thumbnail-emoji\\'>${productoActual.emoji || '📦'}</span>'">
                </div>
            `;
        }
    }).join('');
}

function cambiarImagenProducto(direccion) {
    imagenActualIndex = (imagenActualIndex + direccion + imagenesProducto.length) % imagenesProducto.length;
    mostrarImagen(imagenActualIndex);
    actualizarThumbnailActivo();
}

function seleccionarImagen(index) {
    mostrarImagen(index);
    actualizarThumbnailActivo();
}

function actualizarThumbnailActivo() {
    document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
        if (index === imagenActualIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function renderizarProductoDetalle(producto) {
    document.getElementById('pageTitle').textContent = `${producto.nombre} - MAC LINE`;
    document.getElementById('breadcrumbProducto').textContent = producto.nombre;
    document.getElementById('productoTitulo').textContent = producto.nombre;
    document.getElementById('productoSku').textContent = `SKU: ${producto.categoria.toUpperCase()}-${producto.id}`;
    
    const precioActual = document.getElementById('precioActualDetalle');
    const precioOriginal = document.getElementById('precioOriginalDetalle');
    const descuentoBadge = document.getElementById('descuentoBadge');
    
    precioActual.textContent = `$${producto.precio.toLocaleString('es-CL')}`;
    
    if (producto.precioOriginal && producto.descuento) {
        precioOriginal.textContent = `$${producto.precioOriginal.toLocaleString('es-CL')}`;
        precioOriginal.style.display = 'inline';
        descuentoBadge.textContent = `-${producto.descuento}%`;
        descuentoBadge.style.display = 'inline-block';
    } else {
        precioOriginal.style.display = 'none';
        descuentoBadge.style.display = 'none';
    }
    
    const stockInfo = document.getElementById('stockInfo');
    if (producto.stock > 0) {
        stockInfo.innerHTML = `✓ <strong>${producto.stock}</strong> unidades disponibles`;
        stockInfo.style.background = '#f0f9ff';
        const strong = stockInfo.querySelector('strong');
        if (strong) strong.style.color = '#34c759';
    } else {
        stockInfo.innerHTML = '✗ <strong>Sin stock</strong>';
        stockInfo.style.background = '#fff5f5';
        const strong = stockInfo.querySelector('strong');
        if (strong) strong.style.color = '#ff3b30';
    }
    
    document.getElementById('productoDescripcion').innerHTML = formatearDescripcion(producto.descripcion);
}

function formatearDescripcion(descripcion) {
    if (descripcion.includes(' - ')) {
        const partes = descripcion.split(' - ');
        const titulo = partes[0];
        const caracteristicas = partes[1];
        
        if (caracteristicas) {
            const specs = caracteristicas.split(', ');
            
            let html = '<div style="background: #f9f9f9; padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">';
            html += '<h3 style="font-size: 1rem; font-weight: 600; color: #1d1d1f; margin: 0 0 1.25rem 0; text-transform: uppercase; letter-spacing: 0.5px;">Especificaciones Técnicas</h3>';
            html += '<div style="display: grid; gap: 0.75rem;">';
            
            specs.forEach(spec => {
                const specTrim = spec.trim();
                html += `
                    <div style="display: flex; align-items: flex-start; gap: 0.75rem; background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <span style="color: #34c759; font-size: 1.2rem; font-weight: bold; flex-shrink: 0;">✓</span>
                        <span style="color: #1d1d1f; font-size: 0.95rem; line-height: 1.5; flex: 1;">${specTrim}</span>
                    </div>
                `;
            });
            
            html += '</div></div>';
            return html;
        }
    }
    
    return `<p style="color: #1d1d1f; line-height: 1.8;">${descripcion}</p>`;
}

function agregarAlCarritoDesdeDetalle() {
    if (!productoActual) {
        alert('Error: producto no cargado');
        return;
    }
    
    if (productoActual.stock <= 0) {
        alert('Este producto está agotado');
        return;
    }
    
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const productoExistente = carrito.find(item => String(item.id) === String(productoActual.id));
    
    if (productoExistente) {
        if (productoExistente.cantidad >= productoActual.stock) {
            alert('No hay más stock disponible de este producto');
            return;
        }
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: productoActual.id,
            nombre: productoActual.nombre,
            precio: productoActual.precio,
            emoji: productoActual.emoji,
            cantidad: 1,
            stock: productoActual.stock
        });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    alert(`✓ ${productoActual.nombre} agregado al carrito`);
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

// Funciones del carrito
function abrirCarrito() {
    actualizarVistaCarrito();
    document.getElementById('carritoModal').style.display = 'flex';
}

function cerrarCarrito() {
    document.getElementById('carritoModal').style.display = 'none';
}

function actualizarVistaCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoItems = document.getElementById('carritoItems');
    const totalPrecio = document.getElementById('totalPrecio');
    const btnPagar = document.getElementById('btnPagar');
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        totalPrecio.textContent = '0';
        if (btnPagar) btnPagar.disabled = true;
        return;
    }
    
    if (btnPagar) btnPagar.disabled = false;
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalPrecio.textContent = total.toLocaleString('es-CL');
    
    carritoItems.innerHTML = carrito.map(item => `
        <div class="carrito-item">
            <div class="item-emoji">${item.emoji || '📦'}</div>
            <div class="item-info">
                <div class="item-nombre">${item.nombre}</div>
                <div class="item-precio">$${item.precio.toLocaleString('es-CL')}</div>
                <div class="item-cantidad">
                    <button class="cantidad-btn" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button class="cantidad-btn" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                </div>
                <button class="btn-eliminar" onclick="eliminarDelCarrito('${item.id}')">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

function cambiarCantidad(id, cambio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const item = carrito.find(i => String(i.id) === String(id));
    
    if (!item) return;
    
    item.cantidad += cambio;
    
    if (item.cantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }
    
    if (item.stock && item.cantidad > item.stock) {
        item.cantidad = item.stock;
        alert('No hay más stock disponible');
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarVistaCarrito();
    actualizarContadorCarrito();
}

function eliminarDelCarrito(id) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(item => String(item.id) !== String(id));
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarVistaCarrito();
    actualizarContadorCarrito();
}

function procederPago() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    document.getElementById('subtotalPago').textContent = total.toLocaleString('es-CL');
    document.getElementById('totalPago').textContent = total.toLocaleString('es-CL');
    
    cerrarCarrito();
    document.getElementById('pagoModal').style.display = 'flex';
}

function cerrarPago() {
    document.getElementById('pagoModal').style.display = 'none';
}

async function procesarPago(event) {
    event.preventDefault();
    
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const datosCompra = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        items: carrito,
        total: total
    };
    
    try {
        const response = await fetch(`${API_URL_BASE}/crear-preferencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCompra)
        });
        
        const data = await response.json();
        
        if (data.init_point) {
            window.location.href = data.init_point;
        } else {
            alert('Error al procesar el pago');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar el pago');
    }
}

window.onclick = function(event) {
    const carritoModal = document.getElementById('carritoModal');
    const pagoModal = document.getElementById('pagoModal');
    
    if (event.target === carritoModal) {
        cerrarCarrito();
    }
    if (event.target === pagoModal) {
        cerrarPago();
    }
}
