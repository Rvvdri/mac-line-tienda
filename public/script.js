const API_URL =  `${window.location.origin}/api`;
let carrito = [];
let productosActuales = [];
let filtroActivo = 'todos';
let terminoBusqueda = '';

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarCarritoLocal();
    actualizarCarrito();
});

function buscarProductos() {
    terminoBusqueda = document.getElementById('searchInput').value.toLowerCase();
    aplicarFiltros();
}

function aplicarFiltros() {
    const grid = document.getElementById('productosGrid');
    let productosFiltrados = productosActuales;

    // Filtrar por categoría
    if (filtroActivo !== 'todos') {
        productosFiltrados = productosFiltrados.filter(p => p.categoria === filtroActivo);
    }

    // Filtrar por búsqueda
    if (terminoBusqueda) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(terminoBusqueda) ||
            p.descripcion.toLowerCase().includes(terminoBusqueda) ||
            p.categoria.toLowerCase().includes(terminoBusqueda)
        );
    }

    if (productosFiltrados.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No se encontraron productos</p>';
        return;
    }

    grid.innerHTML = productosFiltrados.map(producto => `
        <div class="producto-card" onclick="window.location.href='producto.html?id=${producto.id}'" style="cursor: pointer;">
            <div class="producto-imagen">
                ${producto.emoji}
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
                <div class="producto-stock">
                    ${producto.stock > 0 
                        ? `<span class="stock-disponible">✓ ${producto.stock} unidades disponibles</span>`
                        : `<span class="stock-agotado">✗ Agotado</span>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        const data = await response.json();
        productosActuales = data;
        aplicarFiltros();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        document.getElementById('productosGrid').innerHTML = 
            '<p style="color: red; grid-column: 1/-1; text-align: center; padding: 2rem;">Error al cargar los productos. Asegúrate de que el servidor esté corriendo en puerto 3000</p>';
    }
}

function renderizarProductos(filtro) {
    // Esta función ahora solo cambia el filtro y llama a aplicarFiltros
    filtroActivo = filtro;
    aplicarFiltros();
}

function filtrarProductos(filtro) {
    filtroActivo = filtro;
    
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    aplicarFiltros();
}

function agregarAlCarrito(productoId) {
    const producto = productosActuales.find(p => p.id === productoId);
    const itemEnCarrito = carrito.find(item => item.id === productoId);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarrito();
    mostrarNotificacion('✓ Producto agregado al carrito');
}

function actualizarCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.querySelector('.cart-count').textContent = totalItems;
    guardarCarritoLocal();
}

function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00d450;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 212, 50, 0.3);
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 2000);
}

function abrirCarrito() {
    const modal = document.getElementById('carritoModal');
    const itemsDiv = document.getElementById('carritoItems');
    
    if (carrito.length === 0) {
        itemsDiv.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        document.getElementById('btnPagar').disabled = true;
    } else {
        itemsDiv.innerHTML = carrito.map((item, index) => `
            <div class="carrito-item">
                <div class="item-info">
                    <div class="item-nombre">${item.nombre}</div>
                    <div class="item-precio">$${item.precio.toLocaleString('es-CL')} c/u</div>
                </div>
                <div class="item-cantidad">
                    <button onclick="cambiarCantidad(${index}, -1)">−</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar</button>
            </div>
        `).join('');
        document.getElementById('btnPagar').disabled = false;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    document.getElementById('totalPrecio').textContent = total.toLocaleString('es-CL');
    
    modal.style.display = 'flex';
}

function cerrarCarrito() {
    document.getElementById('carritoModal').style.display = 'none';
}

function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    abrirCarrito();
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    abrirCarrito();
    actualizarCarrito();
}

function procederPago() {
    cerrarCarrito();
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalConEnvio = total + 0;
    
    document.getElementById('subtotalPago').textContent = total.toLocaleString('es-CL');
    document.getElementById('totalPago').textContent = totalConEnvio.toLocaleString('es-CL');
    
    document.getElementById('pagoModal').style.display = 'flex';
}

function cerrarPago() {
    document.getElementById('pagoModal').style.display = 'none';
}

async function procesarPago(event) {
    event.preventDefault();

    // Mostrar estado de carga
    const btnSubmit = event.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Procesando...';

    const datosCliente = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        items: carrito.map(item => ({
            id: item.id,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio
        })),
        total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) + 5000
    };

    try {
        const response = await fetch(`${API_URL}/crear-preferencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosCliente)
        });

        const data = await response.json();

        if (data.success) {
            if (data.enlacePago) {
                // Redirigir a Mercado Pago
                mostrarNotificacion('✓ Redirigiendo a Mercado Pago...');
                setTimeout(() => {
                    window.location.href = data.enlacePago;
                }, 1000);
            } else {
                // Modo demo
                mostrarNotificacion('✓ Pago procesado (Demo)');
                carrito = [];
                actualizarCarrito();
                cerrarPago();
                cargarProductos();
            }
        } else {
            alert('Error al procesar el pago: ' + (data.error || 'Error desconocido'));
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor. Verifica que esté corriendo en puerto 3000');
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginal;
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

// ============== CARRUSEL DE PROMOCIONES ==============
let promoActual = 0;
let autoPlayInterval;

function mostrarPromo(index) {
    const slides = document.querySelectorAll('.promo-slide');
    const dots = document.querySelectorAll('.dot');
    
    // Remover active de todos
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Circular: si index es negativo o mayor que el total
    if (index >= slides.length) promoActual = 0;
    else if (index < 0) promoActual = slides.length - 1;
    else promoActual = index;
    
    // Activar el actual
    slides[promoActual].classList.add('active');
    dots[promoActual].classList.add('active');
}

function cambiarPromo(direccion) {
    mostrarPromo(promoActual + direccion);
    reiniciarAutoPlay();
}

function irAPromo(index) {
    mostrarPromo(index);
    reiniciarAutoPlay();
}

function reiniciarAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => {
        mostrarPromo(promoActual + 1);
    }, 15000);
}

// Iniciar autoplay
reiniciarAutoPlay();
