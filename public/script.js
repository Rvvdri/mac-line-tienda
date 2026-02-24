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
    actualizarContadorCarrito(); // Actualizar contador al cargar
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
        // Agregar timestamp para evitar caché
        const response = await fetch(`${API_URL}/productos?t=${Date.now()}`);
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
    const secciones = document.getElementById('seccionesCatalogo');
    
    if (!grid) return;
    
    // Si filtro es 'todos', mostrar secciones
    if (filtro === 'todos') {
        grid.style.display = 'none';
        if (secciones) {
            secciones.style.display = 'block';
            renderizarPorSecciones();
        }
        return;
    }
    
    // Si hay filtro específico, mostrar grid normal
    if (secciones) secciones.style.display = 'none';
    grid.style.display = 'grid';
    
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
                
                <!-- BOTÓN DESACTIVADO: Solo se agrega desde producto.html
                ${producto.stock > 0 ? `
                    <button class="btn-agregar-carrito" onclick="event.stopPropagation(); agregarAlCarrito('${producto.id}')">
                        🛒 Agregar al Carrito
                    </button>
                ` : `
                    <button class="btn-agregar-carrito" disabled style="opacity: 0.5; cursor: not-allowed;">
                        Agotado
                    </button>
                `}
                -->
            </div>
        </div>
    `}).join('');
}

// ========== FILTRAR PRODUCTOS ==========

function renderizarPorSecciones() {
    const secciones = document.getElementById('seccionesCatalogo');
    if (!secciones) return;
    
    // Agrupar productos por categoría
    const categorias = {
        'celulares': { nombre: 'Celulares', emoji: '📱', productos: [] },
        'audifonos': { nombre: 'Audífonos', emoji: '🎧', productos: [] },
        'relojes': { nombre: 'Relojes', emoji: '⌚', productos: [] },
        'televisores': { nombre: 'Televisores', emoji: '📺', productos: [] },
        'notebooks': { nombre: 'Computadores', emoji: '💻', productos: [] },
        'consolas': { nombre: 'Consolas', emoji: '🎮', productos: [] }
    };
    
    // Agrupar productos
    productosActuales.forEach(producto => {
        const cat = producto.categoria?.toLowerCase();
        if (categorias[cat]) {
            categorias[cat].productos.push(producto);
        }
    });
    
    // Renderizar secciones
    let html = '';
    
    Object.keys(categorias).forEach(key => {
        const cat = categorias[key];
        if (cat.productos.length === 0) return; // Skip categorías vacías
        
        html += `
            <div class="categoria-section">
                <div class="categoria-header">
                    <h3 class="categoria-titulo">
                        <span class="categoria-emoji">${cat.emoji}</span>
                        <span>${cat.nombre}</span>
                    </h3>
                    <span class="categoria-count">${cat.productos.length} productos</span>
                </div>
                <div class="categoria-grid">
                    ${cat.productos.map(producto => crearCardProducto(producto)).join('')}
                </div>
            </div>
        `;
    });
    
    secciones.innerHTML = html || '<p style="text-align:center;color:#999;">No hay productos disponibles</p>';
}

function crearCardProducto(producto) {
    const descuento = producto.descuento || 0;
    const precioOriginal = descuento > 0 ? producto.precioOriginal || producto.precio : null;
    const precioFinal = producto.precio;
    const tieneVariantes = (producto.colores && producto.colores.length > 0) || 
                          (producto.capacidades && producto.capacidades.length > 0);
    
    // Stock class
    let stockClass = 'disponible';
    let stockTexto = `✅ ${producto.stock || 0} disponibles`;
    
    if (producto.stock === 0) {
        stockClass = 'agotado';
        stockTexto = '❌ Agotado';
    } else if (producto.stock < 5) {
        stockClass = 'bajo';
        stockTexto = `⚠️ Últimas ${producto.stock} unidades`;
    }
    
    return `
        <div class="producto-card" data-producto-id="${producto.id || producto._id}" onclick="window.location.href='producto.html?id=${producto.id || producto._id}'">
            ${descuento > 0 ? `<div class="descuento-badge">-${descuento}%</div>` : ''}
            
            <div class="producto-header">
                <span class="producto-categoria">${(producto.categoria || 'producto').toUpperCase()}</span>
                <h3 class="producto-titulo">${producto.nombre}</h3>
            </div>
            
            <div class="producto-imagen-container">
                ${producto.imagenPortada 
                    ? `<img src="${producto.imagenPortada}" alt="${producto.nombre}" style="max-width: 100%; height: auto;" onerror="this.parentElement.innerHTML='${producto.emoji || '📦'}'; this.parentElement.style.fontSize='5rem';">` 
                    : `<span class="producto-emoji" style="font-size: 5rem;">${producto.emoji || '📦'}</span>`}
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
            </div>
        </div>
    `;
}

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
    actualizarContadorCarrito(); // Actualizar contador inmediatamente
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
    const carritoGuardado = localStorage.getItem('carrito');
    const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    
    // Actualizar todos los contadores (.cart-count y .cart-badge)
    document.querySelectorAll('.cart-count, .cart-badge').forEach(el => {
        el.textContent = total;
        // Mostrar/ocultar según si hay productos
        if (total > 0) {
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    });
    
    console.log('🔄 Contador actualizado:', total);
}

function renderizarCarrito() {
    // SIEMPRE recargar desde localStorage primero
    const carritoGuardado = localStorage.getItem('carrito');
    
    console.log('═'.repeat(60));
    console.log('🔄 RENDERIZANDO CARRITO');
    console.log('═'.repeat(60));
    console.log('📦 localStorage raw:', carritoGuardado);
    
    if (carritoGuardado) {
        try {
            carrito = JSON.parse(carritoGuardado);
            console.log('✅ Carrito parseado correctamente:', carrito);
        } catch (e) {
            console.error('❌ Error parseando carrito:', e);
            carrito = [];
        }
    } else {
        console.log('⚠️ No hay carrito en localStorage');
        carrito = [];
    }
    
    console.log(`📊 Total items en carrito: ${carrito.length}`);
    
    const carritoItems = document.getElementById('carritoItems');
    const totalPrecio = document.getElementById('totalPrecio');
    
    if (!carritoItems) {
        console.error('❌ No se encontró carritoItems');
        return;
    }
    
    if (!totalPrecio) {
        console.error('❌ No se encontró totalPrecio');
        return;
    }
    
    if (carrito.length === 0) {
        console.log('⚠️ Carrito vacío - mostrando mensaje');
        carritoItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        totalPrecio.textContent = '0';
        const btnPagar = document.getElementById('btnPagar');
        if (btnPagar) btnPagar.disabled = true;
        return;
    }
    
    console.log('✅ Carrito tiene items - generando HTML');
    
    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) btnPagar.disabled = false;
    
    console.log('🔨 Construyendo HTML para cada item...');
    
    const itemsHTML = carrito.map((item, index) => {
        console.log(`\n📝 Item ${index}:`, item);
        
        const variantesTexto = [item.color, item.capacidad].filter(Boolean).join(' | ');
        
        // Proteger contra valores null/undefined
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 1;
        
        // Intentar buscar producto si productosActuales existe
        let stockDisponible = item.stock || 0;
        if (typeof productosActuales !== 'undefined' && productosActuales && productosActuales.length > 0) {
            const producto = productosActuales.find(p => String(p.id) === String(item.id));
            if (producto) {
                stockDisponible = producto.stock;
            }
        }
        
        const html = `
            <div class="carrito-item">
                <div class="item-imagen">
                    ${item.imagenPortada 
                        ? `<img src="${item.imagenPortada}" alt="${item.nombre || 'Producto'}" onerror="console.error('Error cargando imagen'); this.parentElement.innerHTML='<span class=\\'item-emoji\\'>${item.emoji || '📦'}</span>'">` 
                        : `<span class="item-emoji">${item.emoji || '📦'}</span>`
                    }
                </div>
                <div class="item-info">
                    <h4 class="item-nombre">${item.nombre || 'Producto sin nombre'}</h4>
                    ${variantesTexto ? `<p class="item-variantes">${variantesTexto}</p>` : ''}
                    <p class="item-precio">$${precio.toLocaleString('es-CL')}</p>
                    ${stockDisponible ? `<p class="item-stock">Stock: ${stockDisponible} disponibles</p>` : ''}
                </div>
                <div class="item-controles">
                    <div class="item-cantidad">
                        <button class="cantidad-btn" onclick="disminuirCantidad(${index})">-</button>
                        <span class="cantidad-numero">${cantidad}</span>
                        <button class="cantidad-btn" onclick="aumentarCantidad(${index})">+</button>
                    </div>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar</button>
                </div>
            </div>
        `;
        
        console.log(`✅ HTML generado para item ${index}`);
        return html;
    }).join('');
    
    console.log('📄 Insertando HTML en carritoItems...');
    carritoItems.innerHTML = itemsHTML;
    console.log('✅ HTML insertado');
    
    const total = carrito.reduce((sum, item) => {
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 1;
        return sum + (precio * cantidad);
    }, 0);
    totalPrecio.textContent = total.toLocaleString('es-CL');
    
    console.log(`💰 Total: $${total.toLocaleString('es-CL')}`);
    console.log('═'.repeat(60));
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
    
    // Calcular subtotal
    const subtotal = carrito.reduce((sum, item) => {
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 1;
        return sum + (precio * cantidad);
    }, 0);
    
    // Obtener método de entrega seleccionado (por defecto normal = 3990)
    const metodoEntregaSeleccionado = document.querySelector('input[name="metodoEntrega"]:checked');
    const envio = metodoEntregaSeleccionado ? parseInt(metodoEntregaSeleccionado.dataset.precio) : 3990;
    const total = subtotal + envio;
    
    const subtotalEl = document.getElementById('subtotalPago');
    const envioEl = document.getElementById('envioPago');
    const totalEl = document.getElementById('totalPago');
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString('es-CL');
    if (envioEl) envioEl.textContent = envio.toLocaleString('es-CL');
    if (totalEl) totalEl.textContent = total.toLocaleString('es-CL');
}

// Función para actualizar el total cuando cambia el método de entrega
function actualizarTotalPago() {
    const subtotalEl = document.getElementById('subtotalPago');
    const envioEl = document.getElementById('envioPago');
    const totalEl = document.getElementById('totalPago');
    
    if (!subtotalEl || !envioEl || !totalEl) return;
    
    const subtotal = parseInt(subtotalEl.textContent.replace(/\./g, '')) || 0;
    
    // Obtener método de entrega seleccionado
    const metodoEntregaSeleccionado = document.querySelector('input[name="metodoEntrega"]:checked');
    const envio = metodoEntregaSeleccionado ? parseInt(metodoEntregaSeleccionado.dataset.precio) : 3990;
    
    const total = subtotal + envio;
    
    envioEl.textContent = envio.toLocaleString('es-CL');
    totalEl.textContent = total.toLocaleString('es-CL');
    
    console.log('📦 Total actualizado:');
    console.log('  Subtotal:', subtotal);
    console.log('  Envío:', envio);
    console.log('  Total:', total);
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
    const ciudadEl = document.getElementById('ciudad');
    const comunaEl = document.getElementById('comuna');
    const calleEl = document.getElementById('calle');
    const numeroEl = document.getElementById('numero');
    const direccionEl = document.getElementById('direccion');
    
    if (!nombreEl || !emailEl || !telefonoEl || !ciudadEl || !comunaEl || !calleEl || !numeroEl) {
        alert('Error: Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Obtener método de entrega
    const metodoEntregaSeleccionado = document.querySelector('input[name="metodoEntrega"]:checked');
    if (!metodoEntregaSeleccionado) {
        alert('Por favor selecciona un método de entrega');
        return;
    }
    
    const metodoEntrega = {
        tipo: metodoEntregaSeleccionado.value,
        nombre: metodoEntregaSeleccionado.value === 'normal' ? 'Envío Normal (3-5 días)' : 'Envío Flash (24-48h)',
        precio: parseInt(metodoEntregaSeleccionado.dataset.precio)
    };
    
    // Construir dirección completa
    const direccionCompleta = `${calleEl.value} ${numeroEl.value}${direccionEl.value ? ', ' + direccionEl.value : ''}`;
    
    const datosCliente = {
        nombre: nombreEl.value,
        email: emailEl.value,
        telefono: telefonoEl.value,
        ciudad: ciudadEl.value,
        comuna: comunaEl.value,
        calle: calleEl.value,
        numero: numeroEl.value,
        complemento: direccionEl.value || '',
        direccion: direccionCompleta
    };
    
    const subtotal = carrito.reduce((sum, item) => {
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 1;
        return sum + (precio * cantidad);
    }, 0);
    
    const total = subtotal + metodoEntrega.precio;
    
    const datosCompra = {
        cliente: datosCliente,
        items: carrito,
        metodoEntrega: metodoEntrega,
        subtotal: subtotal,
        costoEnvio: metodoEntrega.precio,
        total: total
    };
    
    console.log('📦 Datos de compra:', datosCompra);
    
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
