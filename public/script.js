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

// ========== RENDERIZAR PRODUCTOS - SIN SELECTORES ==========

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
        const precioBase = producto.precioBase || producto.precio;
        const precioOriginal = producto.precioOriginal;
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
                    $${precioBase.toLocaleString('es-CL')}
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
    alert(`✅ ${producto.nombre} agregado al carrito`);
}

function aumentarCantidad(index) {
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
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Tu carrito está vacío</p>';
        totalPrecio.textContent = '0';
        document.getElementById('btnPagar').disabled = true;
        return;
    }
    
    document.getElementById('btnPagar').disabled = false;
    
    carritoItems.innerHTML = carrito.map((item, index) => {
        const variantesTexto = [item.color, item.capacidad].filter(Boolean).join(' | ');
        
        return `
            <div class="carrito-item">
                <div class="item-imagen">${item.imagenPortada ? `<img src="${item.imagenPortada}" alt="${item.nombre}">` : item.emoji || '📦'}</div>
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    ${variantesTexto ? `<p style="font-size: 0.813rem; color: #86868b; margin: 0.25rem 0;">${variantesTexto}</p>` : ''}
                    <p class="item-precio">$${item.precio.toLocaleString('es-CL')}</p>
                </div>
                <div class="item-controles">
                    <button onclick="disminuirCantidad(${index})">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="aumentarCantidad(${index})">+</button>
                </div>
                <button class="item-eliminar" onclick="eliminarDelCarrito(${index})">🗑️</button>
            </div>
        `;
    }).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalPrecio.textContent = total.toLocaleString('es-CL');
}

function abrirCarrito() {
    document.getElementById('carritoModal').style.display = 'flex';
    renderizarCarrito();
}

function cerrarCarrito() {
    document.getElementById('carritoModal').style.display = 'none';
}

function procederPago() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    cerrarCarrito();
    document.getElementById('pagoModal').style.display = 'flex';
    
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('subtotalPago').textContent = subtotal.toLocaleString('es-CL');
    document.getElementById('totalPago').textContent = subtotal.toLocaleString('es-CL');
}

function cerrarPago() {
    document.getElementById('pagoModal').style.display = 'none';
}

function procesarPago(event) {
    event.preventDefault();
    
    const datosCliente = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value
    };
    
    const datosCompra = {
        ...datosCliente,
        items: carrito,
        total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    console.log('Procesando pago:', datosCompra);
    
    alert('¡Gracias por tu compra! Recibirás un email de confirmación.');
    
    carrito = [];
    guardarCarritoLocal();
    actualizarCarrito();
    cerrarPago();
    document.getElementById('formularioPago').reset();
}

// Cerrar modales al hacer click fuera
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
