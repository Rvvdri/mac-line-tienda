const API_URL = `${window.location.origin}/api`;
let carrito = [];
let productosActuales = [];
let filtroActivo = 'todos';

// CARRUSEL
let slideActual = 0;
let autoSlideInterval;

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarCarritoLocal();
    actualizarCarrito();
    iniciarCarrusel();
});

// ========== FUNCIONES DEL CARRUSEL ==========

function iniciarCarrusel() {
    autoSlideInterval = setInterval(() => {
        cambiarSlide(1);
    }, 15000);
}

function cambiarSlide(direccion) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    slides[slideActual].classList.remove('active');
    dots[slideActual].classList.remove('active');
    
    slideActual = (slideActual + direccion + slides.length) % slides.length;
    
    slides[slideActual].classList.add('active');
    dots[slideActual].classList.add('active');
    
    clearInterval(autoSlideInterval);
    iniciarCarrusel();
}

function irASlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    slides[slideActual].classList.remove('active');
    dots[slideActual].classList.remove('active');
    
    slideActual = index;
    
    slides[slideActual].classList.add('active');
    dots[slideActual].classList.add('active');
    
    clearInterval(autoSlideInterval);
    iniciarCarrusel();
}

// ========== CARGAR PRODUCTOS ==========

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productosActuales = await response.json();
        renderizarProductos(filtroActivo);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productosGrid').innerHTML = '<p>Error al cargar productos</p>';
    }
}

// ========== RENDERIZAR PRODUCTOS - FIX PRECIOS ==========

function renderizarProductos(filtro = 'todos') {
    const grid = document.getElementById('productosGrid');
    if (!grid) return;
    
    let productosFiltrados = productosActuales;

    if (filtro !== 'todos') {
        productosFiltrados = productosActuales.filter(p => p.categoria === filtro);
    }

    if (productosFiltrados.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay productos en esta categoría</p>';
        return;
    }

    grid.innerHTML = productosFiltrados.map(producto => {
        // FIX: Usar producto.precio (precio final con descuento)
        const precioFinal = producto.precio;  // ← Precio con descuento (verde)
        const precioOriginal = producto.precioOriginal;  // ← Precio antes del descuento (tachado)
        const descuento = producto.descuento || 0;
        const tieneVariantes = producto.colores && producto.capacidades;
        
        let stockClass = 'disponible';
        let stockTexto = `✓ ${producto.stock} disponibles`;
        
        if (producto.stock === 0) {
            stockClass = 'agotado';
            stockTexto = '✗ Agotado';
        } else if (producto.stock < 5) {
            stockClass = 'bajo';
            stockTexto = `⚠ Solo ${producto.stock} disponibles`;
        }
        
        return `
        <div class="producto-card" data-producto-id="${producto.id}">
            ${descuento > 0 ? `<div class="descuento-badge">-${descuento}%</div>` : ''}
            
            <div class="producto-header">
                <span class="producto-categoria">${producto.categoria.toUpperCase()}</span>
                <h3 class="producto-titulo">${producto.nombre}</h3>
            </div>
            
            <div class="producto-imagen-container" onclick="window.location.href='producto.html?id=${producto.id}'">
                ${producto.imagenPortada 
                    ? `<img src="${producto.imagenPortada}" alt="${producto.nombre}" style="max-width: 100%; height: auto;" onerror="this.parentElement.innerHTML='${producto.emoji}'; this.parentElement.style.fontSize='5rem';">` 
                    : `<span class="producto-emoji" style="font-size: 5rem;">${producto.emoji}</span>`}
            </div>
            
            <div class="producto-info">
                ${precioOriginal ? `
                    <p class="precio-original">
                        Antes: $${precioOriginal.toLocaleString('es-CL')}
                    </p>
                ` : ''}
                
                <p class="producto-precio">
                    ${tieneVariantes ? '<span style="font-size: 0.875rem; color: #94a3b8; font-weight: 500;">Desde </span>' : ''}
                    $${precioFinal.toLocaleString('es-CL')}
                </p>
                
                <p class="stock-${stockClass}">
                    ${stockTexto}
                </p>
                
                ${producto.stock > 0 ? `
                    <button class="btn-agregar-carrito" onclick="event.stopPropagation(); agregarAlCarrito('${producto.id}')">
                        🛒 Agregar al Carrito
                    </button>
                ` : `
                    <button class="btn-agregar-carrito" disabled style="opacity: 0.5; cursor: not-allowed;">
                        Agotado
                    </button>
                `}
            </div>
        </div>
    `}).join('');
}

// ========== FILTRAR PRODUCTOS ==========

function filtrarProductos(categoria) {
    filtroActivo = categoria;
    renderizarProductos(categoria);
    
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function buscarProductos() {
    const busqueda = document.getElementById('searchInput').value.toLowerCase();
    
    const productosFiltrados = productosActuales.filter(p => 
        p.nombre.toLowerCase().includes(busqueda) ||
        p.descripcion.toLowerCase().includes(busqueda) ||
        p.categoria.toLowerCase().includes(busqueda)
    );
    
    const grid = document.getElementById('productosGrid');
    if (productosFiltrados.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No se encontraron productos</p>';
        return;
    }
    
    filtroActivo = 'todos';
    productosActuales = productosFiltrados;
    renderizarProductos('todos');
}

// ========== CARRITO FUNCIONES ==========

function cargarCarritoLocal() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}

function guardarCarritoLocal() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(productoId) {
    const producto = productosActuales.find(p => String(p.id) === String(productoId));
    if (!producto) return;
    
    const existe = carrito.find(item => item.id === productoId);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }
    
    guardarCarritoLocal();
    actualizarCarrito();
    
    mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
}

function mostrarNotificacion(mensaje) {
    const notif = document.getElementById('notificacion');
    if (notif) {
        notif.textContent = mensaje;
        notif.classList.add('mostrar');
        setTimeout(() => notif.classList.remove('mostrar'), 2000);
    } else {
        alert(mensaje);
    }
}

function aumentarCantidad(index) {
    const item = carrito[index];
    const producto = productosActuales.find(p => String(p.id) === String(item.id));
    
    if (producto && item.cantidad >= producto.stock) {
        alert(`⚠️ Solo hay ${producto.stock} unidades disponibles`);
        return;
    }
    
    carrito[index].cantidad++;
    guardarCarritoLocal();
    actualizarCarrito();
}

function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
    } else {
        carrito.splice(index, 1);
    }
    guardarCarritoLocal();
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarritoLocal();
    actualizarCarrito();
}

function actualizarCarrito() {
    renderizarCarrito();
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const contador = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = contador;
    });
}

function renderizarCarrito() {
    const carritoItems = document.getElementById('carritoItems');
    const totalPrecio = document.getElementById('totalPrecio');
    
    if (!carritoItems || !totalPrecio) return;
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        totalPrecio.textContent = '0';
        const btnPagar = document.getElementById('btnPagar');
        if (btnPagar) btnPagar.disabled = true;
        return;
    }
    
    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) btnPagar.disabled = false;
    
    carritoItems.innerHTML = carrito.map((item, index) => {
        const variantesTexto = [item.color, item.capacidad].filter(Boolean).join(' | ');
        const producto = productosActuales.find(p => String(p.id) === String(item.id));
        const stockDisponible = producto ? producto.stock : item.stock;
        
        return `
            <div class="carrito-item">
                <div class="item-imagen">
                    ${item.imagenPortada 
                        ? `<img src="${item.imagenPortada}" alt="${item.nombre}">` 
                        : `<span class="item-emoji">${item.emoji || '📦'}</span>`
                    }
                </div>
                <div class="item-info">
                    <h4 class="item-nombre">${item.nombre}</h4>
                    ${variantesTexto ? `<p class="item-variantes">${variantesTexto}</p>` : ''}
                    <p class="item-precio">$${item.precio.toLocaleString('es-CL')}</p>
                    ${stockDisponible ? `<p class="item-stock">Stock: ${stockDisponible} disponibles</p>` : ''}
                </div>
                <div class="item-controles">
                    <div class="item-cantidad">
                        <button class="cantidad-btn" onclick="disminuirCantidad(${index})">-</button>
                        <span class="cantidad-numero">${item.cantidad}</span>
                        <button class="cantidad-btn" onclick="aumentarCantidad(${index})">+</button>
                    </div>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalPrecio.textContent = total.toLocaleString('es-CL');
}

function abrirCarrito() {
    const modal = document.getElementById('carritoModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    renderizarCarrito();
}

function cerrarCarrito() {
    const modal = document.getElementById('carritoModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function procederPago() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const carritoModal = document.getElementById('carritoModal');
    const pagoModal = document.getElementById('pagoModal');
    
    if (carritoModal) carritoModal.style.display = 'none';
    if (pagoModal) pagoModal.style.display = 'flex';
    
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const envio = 5000;
    const total = subtotal + envio;
    
    const subtotalEl = document.getElementById('subtotalPago');
    const envioEl = document.getElementById('envioPago');
    const totalEl = document.getElementById('totalPago');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('es-CL');
    if (envioEl) envioEl.textContent = envio.toLocaleString('es-CL');
    if (totalEl) totalEl.textContent = total.toLocaleString('es-CL');
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
    const direccionEl = document.getElementById('direccion');
    
    if (!nombreEl || !emailEl || !telefonoEl || !direccionEl) {
        alert('Error: Formulario incompleto');
        return;
    }
    
    const datosCliente = {
        nombre: nombreEl.value,
        email: emailEl.value,
        telefono: telefonoEl.value,
        direccion: direccionEl.value
    };
    
    const datosCompra = {
        cliente: datosCliente,
        items: carrito,
        total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    console.log('💳 Procesando pago con Mercado Pago...');
    
    try {
        // CREAR PREFERENCIA EN MERCADO PAGO
        const response = await fetch(`${API_URL}/crear-preferencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCompra)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear preferencia de pago');
        }
        
        const { init_point } = await response.json();
        
        console.log('✅ Preferencia creada');
        console.log('🔗 Redirigiendo a Mercado Pago...');
        
        // GUARDAR VENTA EN BD
        await fetch(`${API_URL}/ventas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCompra)
        });
        
        // REDIRIGIR A MERCADO PAGO
        window.location.href = init_point;
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al procesar el pago. Por favor intenta nuevamente.');
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

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarCarrito();
        cerrarPago();
    }
});
