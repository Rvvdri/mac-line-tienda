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

function mostrarProducto(producto) {
    // 1. TÍTULO Y CATEGORÍA
    document.title = `${producto.nombre} - MAC LINE`;
    document.getElementById('pageTitle').textContent = `${producto.nombre} - MAC LINE`;
    document.getElementById('productoTitulo').textContent = producto.nombre;
    document.getElementById('productoCategoria').textContent = producto.categoria.toUpperCase();

    // 2. PRECIOS Y DESCRIPCIÓN
    document.getElementById('productoPrecio').textContent = producto.precio.toLocaleString('es-CL');
    document.getElementById('productoDescripcion').textContent = producto.descripcion;

    // 3. LÓGICA DE LAS 6 IMÁGENES (Portada + 5 adicionales)
    // Filtramos para ignorar campos vacíos o nulos
    imagenesProducto = [
        producto.imagenPortada,
        producto.imagen2,
        producto.imagen3,
        producto.imagen4,
        producto.imagen5,
        producto.imagen6
    ].filter(img => img && img !== "" && img !== "null");

    // Imagen Principal
    const imgPrincipal = document.getElementById('imagenPrincipal');
    if (imgPrincipal && imagenesProducto.length > 0) {
        imgPrincipal.src = imagenesProducto[0].startsWith('data:') 
            ? imagenesProducto[0] 
            : `/images/productos/${imagenesProducto[0]}`;
    }

    // Miniaturas (Genera las bolitas o cuadritos para las otras fotos)
    const galeriaContainer = document.getElementById('galeriaMiniaturas');
    if (galeriaContainer) {
        galeriaContainer.innerHTML = imagenesProducto.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="cambiarImagenPrincipal(${index})">
                <img src="${img.startsWith('data:') ? img : '/images/productos/' + img}" alt="Vista ${index + 1}">
            </div>
        `).join('');
    }

    // 4. COLORES
    const coloresContainer = document.getElementById('coloresContainer');
    if (coloresContainer && producto.colores) {
        coloresContainer.innerHTML = producto.colores.map((c, i) => `
            <div class="color-dot ${i === 0 ? 'active' : ''}" 
                 style="background-color: ${c.codigo}" 
                 data-color="${c.nombre}"
                 onclick="seleccionarColor(this)">
            </div>
        `).join('');
    }

    // 5. CAPACIDADES (GB)
    const capsContainer = document.getElementById('capacidadesContainer');
    if (capsContainer && producto.capacidades) {
        capsContainer.innerHTML = producto.capacidades.map((cap, i) => `
            <button class="capacidad-btn ${i === 0 ? 'active' : ''}" 
                    onclick="seleccionarCapacidad(this)">
                ${cap}
            </button>
        `).join('');
    }
}

// NO OLVIDES AGREGAR ESTA FUNCIÓN ABAJO PARA QUE FUNCIONE EL CLIC EN LAS FOTOS
function cambiarImagenPrincipal(index) {
    const imgPrincipal = document.getElementById('imagenPrincipal');
    if (!imgPrincipal || !imagenesProducto[index]) return;

    const nuevaSrc = imagenesProducto[index];
    imgPrincipal.src = nuevaSrc.startsWith('data:') ? nuevaSrc : `/images/productos/${nuevaSrc}`;
    
    document.querySelectorAll('.thumbnail').forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
}
    
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

// ========== VARIABLES PARA VARIANTES ==========
let colorSeleccionado = null;
let capacidadSeleccionada = null;
let precioActual = 0;

// ========== RENDERIZAR SELECTORES ==========
function renderizarSelectoresVariantes() {
    if (!productoActual) return;
    
    const container = document.getElementById('selectoresVariantes');
    if (!container) return;
    
    let html = '';
    
    // Inicializar valores por defecto
    if (productoActual.colores && productoActual.colores.length > 0) {
        colorSeleccionado = productoActual.colores[0];
        
        html += `
            <div class="selector-seccion" style="margin-bottom: 1.5rem;">
                <h4 style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 0.75rem;">
                    Color: <span id="colorNombre" style="color: #00d4ff;">${colorSeleccionado}</span>
                </h4>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${productoActual.colores.map((color, idx) => {
                        const colorHex = {
                            'Negro': '#000000', 'Blanco': '#FFFFFF', 'Azul': '#0066CC',
                            'Rojo': '#CC0000', 'Verde': '#00CC00', 'Gris': '#808080',
                            'Plateado': '#C0C0C0', 'Dorado': '#FFD700', 'Rosa': '#FFC0CB',
                            'Titanio Natural': '#E5DCC5', 'Titanio Azul': '#3A5F7D',
                            'Titanio Blanco': '#F5F5F5', 'Titanio Negro': '#2B2B2B'
                        }[color] || '#CCCCCC';
                        
                        return `
                            <button 
                                class="color-btn ${idx === 0 ? 'active' : ''}"
                                style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid ${idx === 0 ? '#00d4ff' : 'transparent'}; background: ${colorHex}; cursor: pointer; position: relative; transition: all 0.3s;"
                                onclick="seleccionarColor(${idx})"
                                title="${color}">
                                ${idx === 0 ? '<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold;">✓</span>' : ''}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    if (productoActual.capacidades && productoActual.capacidades.length > 0) {
        capacidadSeleccionada = productoActual.capacidades[0];
        precioActual = productoActual.precio + (capacidadSeleccionada.precioIncremental || 0);
        
        html += `
            <div class="selector-seccion" style="margin-bottom: 1.5rem;">
                <h4 style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 0.75rem;">Almacenamiento</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.5rem;">
                    ${productoActual.capacidades.map((cap, idx) => `
                        <button 
                            class="capacidad-btn ${idx === 0 ? 'active' : ''}"
                            style="padding: 0.75rem; border: 2px solid ${idx === 0 ? '#00d4ff' : 'rgba(255,255,255,0.2)'}; background: ${idx === 0 ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.05)'}; border-radius: 8px; cursor: pointer; transition: all 0.3s; text-align: center;"
                            onclick="seleccionarCapacidad(${idx})">
                            <div style="font-weight: 600; color: #f8f9fa;">${cap.nombre}</div>
                            ${cap.precioIncremental > 0 ? `<div style="font-size: 0.75rem; color: #00d4ff; margin-top: 0.25rem;">+$${cap.precioIncremental.toLocaleString('es-CL')}</div>` : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Actualizar precio inicial con capacidad base
        const precioEl = document.getElementById('productoPrecio');
        if (precioEl) {
            precioEl.textContent = `$${precioActual.toLocaleString('es-CL')}`;
        }
    } else {
        precioActual = productoActual.precio;
    }
    
    container.innerHTML = html;
}

window.seleccionarColor = function(idx) {
    if (!productoActual.colores) return;
    
    colorSeleccionado = productoActual.colores[idx];
    
    // Actualizar UI
    document.querySelectorAll('.color-btn').forEach((btn, i) => {
        if (i === idx) {
            btn.classList.add('active');
            btn.style.border = '2px solid #00d4ff';
            btn.innerHTML = '<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold;">✓</span>';
        } else {
            btn.classList.remove('active');
            btn.style.border = '2px solid transparent';
            btn.innerHTML = '';
        }
    });
    
    const nombreEl = document.getElementById('colorNombre');
    if (nombreEl) nombreEl.textContent = colorSeleccionado;
};

window.seleccionarCapacidad = function(idx) {
    if (!productoActual.capacidades) return;
    
    capacidadSeleccionada = productoActual.capacidades[idx];
    precioActual = productoActual.precio + (capacidadSeleccionada.precioIncremental || 0);
    
    // Actualizar UI
    document.querySelectorAll('.capacidad-btn').forEach((btn, i) => {
        if (i === idx) {
            btn.classList.add('active');
            btn.style.border = '2px solid #00d4ff';
            btn.style.background = 'rgba(0,212,255,0.1)';
        } else {
            btn.classList.remove('active');
            btn.style.border = '2px solid rgba(255,255,255,0.2)';
            btn.style.background = 'rgba(255,255,255,0.05)';
        }
    });
    
    // Actualizar precio
    const precioEl = document.getElementById('productoPrecio');
    if (precioEl) {
        precioEl.textContent = `$${precioActual.toLocaleString('es-CL')}`;
    }
};

// Hook para renderizar selectores después de mostrar producto
const originalMostrarProducto = window.mostrarProducto || mostrarProducto;
window.mostrarProducto = function(producto) {
    if (originalMostrarProducto) {
        originalMostrarProducto(producto);
    }
    setTimeout(() => {
        renderizarSelectoresVariantes();
    }, 100);
};

// ========== FUNCIONES DE PAGO ==========

function procederPago() {
    const carritoGuardado = localStorage.getItem('carrito');
    const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const carritoModal = document.getElementById('carritoModal');
    const pagoModal = document.getElementById('pagoModal');
    
    if (carritoModal) carritoModal.style.display = 'none';
    if (pagoModal) pagoModal.style.display = 'flex';
    
    const subtotal = carrito.reduce((sum, item) => {
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 1;
        return sum + (precio * cantidad);
    }, 0);
    
    const seccionMetodoEntrega = document.getElementById('seccionMetodoEntrega');
    const mensajeEnvioGratis = document.getElementById('mensajeEnvioGratis');
    const envioPagoWrapper = document.getElementById('envioPagoWrapper');
    
    let envio = 0;
    
    if (subtotal >= 100000) {
        if (seccionMetodoEntrega) seccionMetodoEntrega.style.display = 'none';
        if (mensajeEnvioGratis) mensajeEnvioGratis.style.display = 'block';
        envio = 0;
        if (envioPagoWrapper) {
            envioPagoWrapper.innerHTML = '<span style="color: #00d4ff; font-weight: 700;">GRATIS ✅</span>';
        }
    } else {
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
        envio = 0;
        if (envioPagoWrapper) {
            envioPagoWrapper.innerHTML = '<span style="color: #00d4ff; font-weight: 700;">GRATIS ✅</span>';
        }
    } else {
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
    alert('Función de pago en desarrollo');
}

