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
        // Normalizar ID
        const productoId = producto.id || producto._id || String(producto._id);
        
        // FIX: Usar producto.precio (precio final con descuento)
        const precioFinal = producto.precio;  // ← Precio con descuento (verde)
        const precioOriginal = producto.precioOriginal;  // ← Precio antes del descuento (tachado)
        const descuento = producto.descuento || 0;
        const tieneVariantes = producto.colores && producto.colores.length > 0 && producto.capacidades && producto.capacidades.length > 0;
        
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
        <div class="producto-card" data-producto-id="${productoId}">
            ${descuento > 0 ? `<div class="descuento-badge">-${descuento}%</div>` : ''}
            
            <div class="producto-header">
                <span class="producto-categoria">${producto.categoria.toUpperCase()}</span>
                <h3 class="producto-titulo">${producto.nombre}</h3>
            </div>
            
            <div class="producto-imagen-container" onclick="window.location.href='producto.html?id=${productoId}'">
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
                    <button class="btn-agregar-carrito" onclick="event.stopPropagation(); ${tieneVariantes ? `abrirModalVariantes('${productoId}')` : `agregarAlCarritoDirecto('${productoId}')`}">
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
    console.log('💾 Carrito guardado en localStorage:', carrito.length, 'items');
}

// Agregar sin variantes (directo desde card)
function agregarAlCarritoDirecto(productoId) {
    const producto = productosActuales.find(p => {
        const pId = p.id || p._id || String(p._id);
        return String(pId) === String(productoId);
    });
    
    if (!producto) {
        console.error('❌ Producto no encontrado:', productoId);
        return;
    }
    
    // Normalizar ID
    const idNormalizado = producto.id || producto._id || String(producto._id);
    
    // Buscar si ya existe en el carrito
    const existe = carrito.find(item => {
        const itemId = item.id || item._id || String(item._id);
        return String(itemId) === String(idNormalizado);
    });
    
    if (existe) {
        // Verificar stock
        if (existe.cantidad >= producto.stock) {
            alert(`⚠️ Solo hay ${producto.stock} unidades disponibles`);
            return;
        }
        existe.cantidad++;
    } else {
        // Crear item con formato consistente
        const nuevoItem = {
            id: idNormalizado,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            imagenPortada: producto.imagenPortada || null,
            emoji: producto.emoji || '📦',
            stock: producto.stock,
            categoria: producto.categoria
        };
        
        carrito.push(nuevoItem);
    }
    
    console.log('✅ Producto agregado al carrito:', producto.nombre);
    console.log('📦 Carrito actualizado:', carrito);
    
    guardarCarritoLocal();
    actualizarCarrito();
    
    // Abrir carrito automáticamente
    setTimeout(() => abrirCarrito(), 300);
    
    mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
}

// Abrir modal de variantes
function abrirModalVariantes(productoId) {
    const producto = productosActuales.find(p => {
        const pId = p.id || p._id || String(p._id);
        return String(pId) === String(productoId);
    });
    
    if (!producto) return;
    
    let modal = document.getElementById('modalVariantes');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalVariantes';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        `;
        modal.onclick = (e) => {
            if (e.target === modal) cerrarModalVariantes();
        };
        document.body.appendChild(modal);
    }
    
    // Construir contenido del modal
    const idNormalizado = producto.id || producto._id || String(producto._id);
    
    modal.innerHTML = `
        <div class="modal-content-variantes" style="max-width: 500px; background: white; border-radius: 16px; padding: 2rem; position: relative;">
            <button onclick="cerrarModalVariantes()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">✕</button>
            
            <h2 style="margin: 0 0 1.5rem 0; color: #1a1a1a;">${producto.nombre}</h2>
            
            <div style="text-align: center; margin-bottom: 1.5rem;">
                ${producto.imagenPortada 
                    ? `<img src="${producto.imagenPortada}" alt="${producto.nombre}" style="max-width: 200px; max-height: 200px; object-fit: contain;">` 
                    : `<span style="font-size: 4rem;">${producto.emoji}</span>`}
            </div>
            
            <p style="font-size: 1.5rem; font-weight: 700; color: #00d4ff; margin-bottom: 1.5rem;">$${producto.precio.toLocaleString('es-CL')}</p>
            
            ${producto.colores && producto.colores.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #333;">Color:</label>
                    <select id="colorModalSelect" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
                        ${producto.colores.map(color => `<option value="${color}">${color}</option>`).join('')}
                    </select>
                </div>
            ` : ''}
            
            ${producto.capacidades && producto.capacidades.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: #333;">Capacidad:</label>
                    <select id="capacidadModalSelect" onchange="actualizarPrecioModal('${idNormalizado}')" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem;">
                        ${producto.capacidades.map(cap => `
                            <option value="${cap.precioIncremental}" data-nombre="${cap.nombre}">
                                ${cap.nombre} ${cap.precioIncremental > 0 ? `(+$${cap.precioIncremental.toLocaleString('es-CL')})` : ''}
                            </option>
                        `).join('')}
                    </select>
                    <p id="precioModalTotal" style="font-size: 1.25rem; font-weight: 700; color: #00d4ff; margin-top: 1rem;">
                        $${producto.precio.toLocaleString('es-CL')}
                    </p>
                </div>
            ` : ''}
            
            <button onclick="agregarAlCarritoConVariantes('${idNormalizado}')" style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border: none; border-radius: 10px; font-size: 1.125rem; font-weight: 600; cursor: pointer;">
                🛒 Agregar al Carrito
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function cerrarModalVariantes() {
    const modal = document.getElementById('modalVariantes');
    if (modal) modal.style.display = 'none';
}

function actualizarPrecioModal(productoId) {
    const producto = productosActuales.find(p => {
        const pId = p.id || p._id || String(p._id);
        return String(pId) === String(productoId);
    });
    
    if (!producto) return;
    
    const select = document.getElementById('capacidadModalSelect');
    const precioElement = document.getElementById('precioModalTotal');
    
    if (select && precioElement) {
        const incremento = parseInt(select.value) || 0;
        const precioTotal = producto.precio + incremento;
        precioElement.textContent = `$${precioTotal.toLocaleString('es-CL')}`;
    }
}

function agregarAlCarritoConVariantes(productoId) {
    const producto = productosActuales.find(p => {
        const pId = p.id || p._id || String(p._id);
        return String(pId) === String(productoId);
    });
    
    if (!producto) return;
    
    // Obtener variantes seleccionadas
    const colorSelect = document.getElementById('colorModalSelect');
    const capacidadSelect = document.getElementById('capacidadModalSelect');
    
    const color = colorSelect ? colorSelect.value : null;
    const capacidadIncremento = capacidadSelect ? parseInt(capacidadSelect.value) : 0;
    const capacidadNombre = capacidadSelect ? capacidadSelect.options[capacidadSelect.selectedIndex].dataset.nombre : null;
    
    const precioFinal = producto.precio + capacidadIncremento;
    const idNormalizado = producto.id || producto._id || String(producto._id);
    
    // Buscar si ya existe (mismo producto, color y capacidad)
    const existe = carrito.find(item => {
        const itemId = item.id || item._id || String(item._id);
        return String(itemId) === String(idNormalizado) && 
               item.color === color && 
               item.capacidad === capacidadNombre;
    });
    
    if (existe) {
        if (existe.cantidad >= producto.stock) {
            alert(`⚠️ Solo hay ${producto.stock} unidades disponibles`);
            return;
        }
        existe.cantidad++;
    } else {
        const nuevoItem = {
            id: idNormalizado,
            nombre: producto.nombre,
            precio: precioFinal,
            cantidad: 1,
            imagenPortada: producto.imagenPortada || null,
            emoji: producto.emoji || '📦',
            stock: producto.stock,
            categoria: producto.categoria,
            color: color,
            capacidad: capacidadNombre
        };
        
        carrito.push(nuevoItem);
    }
    
    console.log('✅ Producto con variantes agregado:', producto.nombre);
    console.log('📦 Carrito actualizado:', carrito);
    
    guardarCarritoLocal();
    actualizarCarrito();
    cerrarModalVariantes();
    
    const variantesTexto = [color, capacidadNombre].filter(Boolean).join(' | ');
    mostrarNotificacion(`✅ ${producto.nombre}${variantesTexto ? `\n${variantesTexto}` : ''}`);
    
    // Abrir carrito automáticamente
    setTimeout(() => abrirCarrito(), 300);
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
    
    // Buscar producto con ID flexible
    const producto = productosActuales.find(p => {
        const pId = p.id || p._id || String(p._id);
        const itemId = item.id || item._id || String(item._id);
        return String(pId) === String(itemId);
    });
    
    const stockDisponible = producto ? producto.stock : (item.stock || 999);
    
    if (item.cantidad >= stockDisponible) {
        alert(`⚠️ Solo hay ${stockDisponible} unidades disponibles`);
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
    // Recargar carrito desde localStorage para asegurar sincronización
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    
    console.log('🔄 Renderizando carrito...');
    console.log('📦 Items en carrito:', carrito.length);
    console.log('🗂️ Productos disponibles:', productosActuales.length);
    
    const carritoItems = document.getElementById('carritoItems');
    const totalPrecio = document.getElementById('totalPrecio');
    
    if (!carritoItems || !totalPrecio) {
        console.error('❌ No se encontró carritoItems o totalPrecio');
        return;
    }
    
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
        
        // Buscar producto en la lista actual con ID flexible
        const producto = productosActuales.find(p => {
            const pId = p.id || p._id || String(p._id);
            const itemId = item.id || item._id || String(item._id);
            return String(pId) === String(itemId);
        });
        
        const stockDisponible = producto ? producto.stock : (item.stock || 0);
        
        // Usar imagen del item o del producto, con fallback a emoji
        const imagen = item.imagenPortada || (producto ? producto.imagenPortada : null);
        const emoji = item.emoji || (producto ? producto.emoji : '📦');
        
        return `
            <div class="carrito-item">
                <div class="item-imagen">
                    ${imagen 
                        ? `<img src="${imagen}" alt="${item.nombre}" onerror="this.parentElement.innerHTML='<span class=\\'item-emoji\\'>${emoji}</span>'">` 
                        : `<span class="item-emoji">${emoji}</span>`
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
