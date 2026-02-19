// producto-detalle.js COMPATIBLE (funciona con o sin variantes)
const API_URL_BASE = `${window.location.origin}/api`;
let productoActual = null;
let imagenesProducto = [];
let imagenActualIndex = 0;

// Variantes seleccionadas (si existen)
let colorSeleccionado = null;
let capacidadSeleccionada = null;
let precioActual = 0;

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
        
        productoActual = productos.find(p => String(p.id) === String(productoId));
        
        if (!productoActual) {
            throw new Error('Producto no encontrado');
        }
        
        // Inicializar variantes SI EXISTEN
        if (productoActual.colores && productoActual.colores.length > 0) {
            colorSeleccionado = productoActual.colores[0];
        }
        
        if (productoActual.capacidades && productoActual.capacidades.length > 0) {
            capacidadSeleccionada = productoActual.capacidades[0];
        }
        
        // Calcular precio inicial
        const precioBase = productoActual.precioBase || productoActual.precio;
        const incremento = capacidadSeleccionada ? capacidadSeleccionada.incremento : 0;
        precioActual = precioBase + incremento;
        
        imagenesProducto = generarImagenesProducto(productoActual);
        
        renderizarProductoDetalle(productoActual);
        renderizarGaleria();
        
    } catch (error) {
        console.error('Error cargando producto:', error);
        alert('Error al cargar el producto: ' + error.message);
        window.location.href = 'index.html';
    }
}

function generarImagenesProducto(producto) {
    if (producto.imagenes && producto.imagenes.length > 0) {
        return producto.imagenes.map((url, index) => ({
            type: 'url',
            content: url,
            alt: `${producto.nombre} - Vista ${index + 1}`
        }));
    }
    
    const emoji = producto.emoji || '📱';
    return [
        { type: 'emoji', content: emoji, alt: `${producto.nombre} - Vista frontal` },
        { type: 'emoji', content: emoji, alt: `${producto.nombre} - Vista lateral` },
        { type: 'emoji', content: emoji, alt: `${producto.nombre} - Vista trasera` }
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
        imagenPrincipal.innerHTML = `<img src="${imagen.content}" alt="${imagen.alt}" onerror="this.parentElement.innerHTML='${productoActual.emoji || '📦'}'; this.parentElement.style.fontSize='8rem';">`;
    }
    
    if (currentImageIndex) currentImageIndex.textContent = index + 1;
    if (totalImages) totalImages.textContent = imagenesProducto.length;
    
    imagenActualIndex = index;
}

function cambiarImagen(direccion) {
    imagenActualIndex = (imagenActualIndex + direccion + imagenesProducto.length) % imagenesProducto.length;
    mostrarImagen(imagenActualIndex);
}

function seleccionarImagen(index) {
    mostrarImagen(index);
}

function renderizarThumbnails() {
    const thumbnailsContainer = document.querySelector('.thumbnails');
    if (!thumbnailsContainer) return;
    
    thumbnailsContainer.innerHTML = imagenesProducto.map((imagen, index) => {
        if (imagen.type === 'emoji') {
            return `
                <div class="thumbnail ${index === imagenActualIndex ? 'active' : ''}" onclick="seleccionarImagen(${index})">
                    <span class="thumbnail-emoji">${imagen.content}</span>
                </div>
            `;
        } else {
            return `
                <div class="thumbnail ${index === imagenActualIndex ? 'active' : ''}" onclick="seleccionarImagen(${index})">
                    <img src="${imagen.content}" alt="${imagen.alt}" onerror="this.parentElement.innerHTML='<span class=thumbnail-emoji>${productoActual.emoji || '📦'}</span>'">
                </div>
            `;
        }
    }).join('');
}

function renderizarProductoDetalle(producto) {
    // Título y precio
    document.getElementById('productoTitulo').textContent = producto.nombre;
    document.getElementById('productoCategoria').textContent = producto.categoria.toUpperCase();
    
    const precioBase = producto.precioBase || producto.precio;
    actualizarPrecioDisplay(precioBase + (capacidadSeleccionada ? capacidadSeleccionada.incremento : 0));
    
    // Descripción
    document.getElementById('productoDescripcion').textContent = producto.descripcion;
    
    // Stock
    const stockElement = document.getElementById('productoStock');
    if (producto.stock > 0) {
        stockElement.innerHTML = `<span style="color: #34c759;">✓ ${producto.stock} disponibles</span>`;
    } else {
        stockElement.innerHTML = `<span style="color: #ff3b30;">✗ Agotado</span>`;
    }
    
    // RENDERIZAR SELECTORES SOLO SI EXISTEN
    const selectoresContainer = document.getElementById('selectoresVariantes');
    if (selectoresContainer) {
        if (producto.colores || producto.capacidades) {
            renderizarSelectores(producto);
        } else {
            selectoresContainer.innerHTML = ''; // Vacío si no hay variantes
        }
    }
}

function renderizarSelectores(producto) {
    const selectoresContainer = document.getElementById('selectoresVariantes');
    if (!selectoresContainer) return;
    
    let html = '';
    
    // SELECTOR DE COLORES (solo si existen)
    if (producto.colores && producto.colores.length > 0) {
        html += `
            <div class="selector-seccion">
                <h4 class="selector-titulo">Color: <span id="colorSeleccionadoNombre">${colorSeleccionado.nombre}</span></h4>
                <div class="colores-opciones-detalle">
                    ${producto.colores.map((color, idx) => `
                        <button 
                            class="color-btn-detalle ${idx === 0 ? 'active' : ''}" 
                            style="background-color: ${color.hex};"
                            onclick="cambiarColorDetalle(${idx})"
                            title="${color.nombre}">
                            ${idx === 0 ? '<span class="check-mark">✓</span>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // SELECTOR DE CAPACIDAD (solo si existen)
    if (producto.capacidades && producto.capacidades.length > 0) {
        html += `
            <div class="selector-seccion">
                <h4 class="selector-titulo">Almacenamiento</h4>
                <div class="capacidades-opciones-detalle">
                    ${producto.capacidades.map((cap, idx) => `
                        <button 
                            class="capacidad-btn-detalle ${idx === 0 ? 'active' : ''}" 
                            onclick="cambiarCapacidadDetalle(${idx})">
                            <span class="capacidad-texto">${cap.capacidad}</span>
                            <span class="capacidad-precio">+$${cap.incremento.toLocaleString('es-CL')}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    selectoresContainer.innerHTML = html;
}

function cambiarColorDetalle(colorIdx) {
    if (!productoActual.colores) return;
    
    colorSeleccionado = productoActual.colores[colorIdx];
    
    const botones = document.querySelectorAll('.color-btn-detalle');
    botones.forEach((btn, idx) => {
        if (idx === colorIdx) {
            btn.classList.add('active');
            btn.innerHTML = '<span class="check-mark">✓</span>';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '';
        }
    });
    
    const nombreElement = document.getElementById('colorSeleccionadoNombre');
    if (nombreElement) {
        nombreElement.textContent = colorSeleccionado.nombre;
    }
}

function cambiarCapacidadDetalle(capacidadIdx) {
    if (!productoActual.capacidades) return;
    
    capacidadSeleccionada = productoActual.capacidades[capacidadIdx];
    
    const botones = document.querySelectorAll('.capacidad-btn-detalle');
    botones.forEach((btn, idx) => {
        if (idx === capacidadIdx) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const precioBase = productoActual.precioBase || productoActual.precio;
    precioActual = precioBase + capacidadSeleccionada.incremento;
    actualizarPrecioDisplay(precioActual);
}

function actualizarPrecioDisplay(precio) {
    const precioElement = document.getElementById('productoPrecio');
    if (precioElement) {
        precioElement.textContent = `$${precio.toLocaleString('es-CL')}`;
    }
}

function agregarAlCarritoDetalle() {
    if (!productoActual) return;
    
    if (productoActual.stock === 0) {
        alert('⚠️ Este producto está agotado');
        return;
    }
    
    // Crear producto con variantes seleccionadas (si existen)
    const productoParaCarrito = {
        ...productoActual,
        color: colorSeleccionado ? colorSeleccionado.nombre : null,
        capacidad: capacidadSeleccionada ? capacidadSeleccionada.capacidad : null,
        precio: precioActual || productoActual.precio,
        idCarrito: `${productoActual.id}-${colorSeleccionado?.nombre || 'default'}-${capacidadSeleccionada?.capacidad || 'default'}`
    };
    
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const existe = carrito.find(item => item.idCarrito === productoParaCarrito.idCarrito);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            ...productoParaCarrito,
            cantidad: 1
        });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    
    const variantesTexto = [
        colorSeleccionado ? colorSeleccionado.nombre : null,
        capacidadSeleccionada ? capacidadSeleccionada.capacidad : null
    ].filter(Boolean).join(' - ');
    
    alert(`✅ ${productoActual.nombre}${variantesTexto ? `\n(${variantesTexto})` : ''}\nagregado al carrito`);
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contador = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = contador;
    });
}

function volverATienda() {
    window.location.href = 'index.html';
}
