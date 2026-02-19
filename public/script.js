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
    // Auto-rotación cada 15 segundos
    autoSlideInterval = setInterval(() => {
        cambiarSlide(1);
    }, 15000);
}

function cambiarSlide(direccion) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Remover active del slide actual
    slides[slideActual].classList.remove('active');
    dots[slideActual].classList.remove('active');
    
    // Calcular nuevo slide
    slideActual = (slideActual + direccion + slides.length) % slides.length;
    
    // Agregar active al nuevo slide
    slides[slideActual].classList.add('active');
    dots[slideActual].classList.add('active');
    
    // Reiniciar auto-rotación
    clearInterval(autoSlideInterval);
    iniciarCarrusel();
}

function irASlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Remover active del slide actual
    slides[slideActual].classList.remove('active');
    dots[slideActual].classList.remove('active');
    
    // Ir al slide seleccionado
    slideActual = index;
    
    // Agregar active al nuevo slide
    slides[slideActual].classList.add('active');
    dots[slideActual].classList.add('active');
    
    // Reiniciar auto-rotación
    clearInterval(autoSlideInterval);
    iniciarCarrusel();
}

// ========== FUNCIONES DE BÚSQUEDA ==========

function buscarProductos() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('productosGrid');
    
    if (!grid) return;
    
    let productosFiltrados = productosActuales;
    
    // Aplicar filtro de categoría si hay uno activo
    if (filtroActivo !== 'todos') {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === filtroActivo);
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm) ||
            p.descripcion.toLowerCase().includes(searchTerm) ||
            p.categoria.toLowerCase().includes(searchTerm)
        );
    }
    
    if (productosFiltrados.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 2rem;">No se encontraron productos</p>';
        return;
    }
    
    grid.innerHTML = productosFiltrados.map(producto => `
        <div class="producto-card" onclick="window.location.href='producto.html?id=${producto.id}'">
            <div class="producto-imagen">
                ${producto.imagenPortada 
                    ? `<img src="${producto.imagenPortada}" alt="${producto.nombre}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='${producto.emoji}'; this.parentElement.style.fontSize='5rem';">` 
                    : producto.emoji}
                ${producto.descuento ? `<div class="producto-badge">-${producto.descuento}%</div>` : ''}
            </div>
            <div class="producto-info">
                <div class="producto-categoria">${producto.categoria}</div>
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <div class="producto-precios">
                    ${producto.precioOriginal ? `<span class="precio-original">$${producto.precioOriginal.toLocaleString('es-CL')}</span>` : ''}
                    <span class="precio-actual">$${producto.precio.toLocaleString('es-CL')}</span>
                </div>
                <div class="producto-stock">📦 Stock: ${producto.stock} unidades</div>
            </div>
        </div>
    `).join('');
}

// ========== FUNCIONES DE PRODUCTOS ==========

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();
        productosActuales = data;
        renderizarProductos('todos');
    } catch (error) {
        console.error('Error al cargar productos:', error);
        const grid = document.getElementById('productosGrid');
        if (grid) {
            grid.innerHTML = '<p style="color: red; grid-column: 1/-1; text-align: center; padding: 2rem;">Error al cargar los productos. Asegúrate de que el servidor esté corriendo en puerto 3000</p>';
        }
    }
}

function renderizarProductos(filtro) {
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

    grid.innerHTML = productosFiltrados.map(producto => `
        <div class="producto-card" onclick="window.location.href='producto.html?id=${producto.id}'">
            <div class="producto-imagen">
                ${producto.imagenPortada 
                    ? `<img src="${producto.imagenPortada}" alt="${producto.nombre}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='${producto.emoji}'; this.parentElement.style.fontSize='5rem';">` 
                    : producto.emoji}
                ${producto.descuento ? `<div class="producto-badge">-${producto.descuento}%</div>` : ''}
            </div>
            <div class="producto-info">
                <div class="producto-categoria">${producto.categoria}</div>
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-descripcion">${producto.descripcion}</p>
                <div class="producto-precios">
                    ${producto.precioOriginal ? `<span class="precio-original">$${producto.precioOriginal.toLocaleString('es-CL')}</span>` : ''}
                    <span class="precio-actual">$${producto.precio.toLocaleString('es-CL')}</span>
                </div>
                <div class="producto-stock">📦 Stock: ${producto.stock} unidades</div>
            </div>
        </div>
    `).join('');
}

function filtrarProductos(categoria) {
    filtroActivo = categoria;
    
    // Actualizar botones activos
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Limpiar búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    renderizarProductos(categoria);
}

// ========== FUNCIONES DEL CARRITO ==========

function agregarAlCarrito(producto) {
    const itemExistente = carrito.find(item => String(item.id) === String(producto.id));
    
    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
        } else {
            alert('No hay más stock disponible');
            return;
        }
    } else {
        carrito.push({ 
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            emoji: producto.emoji,
            cantidad: 1,
            stock: producto.stock
        });
    }
    
    guardarCarritoLocal();
    actualizarCarrito();
    mostrarNotificacion('Producto agregado al carrito');
}

function actualizarCarrito() {
    const carritoItems = document.getElementById('carritoItems');
    const totalPrecio = document.getElementById('totalPrecio');
    const cartCount = document.querySelector('.cart-count');
    const btnPagar = document.getElementById('btnPagar');
    
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    if (!carritoItems) return;
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        if (totalPrecio) totalPrecio.textContent = '0';
        if (btnPagar) btnPagar.disabled = true;
        return;
    }
    
    if (btnPagar) btnPagar.disabled = false;
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    if (totalPrecio) totalPrecio.textContent = total.toLocaleString('es-CL');
    
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
    const item = carrito.find(i => String(i.id) === String(id));
    if (!item) return;
    
    item.cantidad += cambio;
    
    if (item.cantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }
    
    if (item.cantidad > item.stock) {
        item.cantidad = item.stock;
        alert('No hay más stock disponible');
    }
    
    guardarCarritoLocal();
    actualizarCarrito();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => String(item.id) !== String(id));
    guardarCarritoLocal();
    actualizarCarrito();
}

function abrirCarrito() {
    actualizarCarrito();
    const modal = document.getElementById('carritoModal');
    if (modal) modal.style.display = 'flex';
}

function cerrarCarrito() {
    const modal = document.getElementById('carritoModal');
    if (modal) modal.style.display = 'none';
}

function procederPago() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const subtotalPago = document.getElementById('subtotalPago');
    const totalPago = document.getElementById('totalPago');
    
    if (subtotalPago) subtotalPago.textContent = total.toLocaleString('es-CL');
    if (totalPago) totalPago.textContent = total.toLocaleString('es-CL');
    
    cerrarCarrito();
    const pagoModal = document.getElementById('pagoModal');
    if (pagoModal) pagoModal.style.display = 'flex';
}

function cerrarPago() {
    const modal = document.getElementById('pagoModal');
    if (modal) modal.style.display = 'none';
}

async function procesarPago(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const telefono = document.getElementById('telefono');
    const direccion = document.getElementById('direccion');
    
    if (!nombre || !email || !telefono || !direccion) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    const datosCompra = {
        nombre: nombre.value,
        email: email.value,
        telefono: telefono.value,
        direccion: direccion.value,
        items: carrito,
        total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    try {
        const response = await fetch(`${API_URL}/crear-preferencia`, {
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

function guardarCarritoLocal() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarCarritoLocal() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}

function mostrarNotificacion(mensaje) {
    console.log(mensaje);
}

// Cerrar modales al hacer clic fuera
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
