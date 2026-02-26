// producto-detalle.js - CORREGIDO
let productoActual = null;
let imagenActualIndex = 0;
let imagenesProducto = [];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get('id');
    if (productoId) {
        cargarProducto(productoId);
    } else {
        window.location.href = 'index.html';
    }
});

async function cargarProducto(id) {
    try {
        const response = await fetch(`${API_URL}/productos/${id}`);
        if (!response.ok) throw new Error('Producto no encontrado');
        productoActual = await response.json();
        mostrarProducto(productoActual);
    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'index.html';
    }
}

function mostrarProducto(producto) {
    document.title = `${producto.nombre} - MAC LINE`;
    document.getElementById('productoTitulo').textContent = producto.nombre;
    document.getElementById('productoDescripcion').textContent = producto.descripcion;
    document.getElementById('productoPrecio').textContent = producto.precio.toLocaleString('es-CL');

    // Manejo de imágenes (Asegura que se vean)
    const imgPrincipal = document.getElementById('imagenPrincipal');
    if (imgPrincipal && producto.imagenPortada) {
        imgPrincipal.src = producto.imagenPortada.startsWith('data:') 
            ? producto.imagenPortada 
            : `/images/productos/${producto.imagenPortada}`;
    }

    // Renderizar Colores
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

    // Renderizar Capacidades
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

function seleccionarColor(elemento) {
    document.querySelectorAll('.color-dot').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');
}

function seleccionarCapacidad(elemento) {
    document.querySelectorAll('.capacidad-btn').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');
}

// FUNCIÓN CLAVE: Captura datos para el correo
function agregarAlCarritoDetalle() {
    if (!productoActual) return;
    
    if (productoActual.stock === 0) {
        alert('❌ Producto agotado');
        return;
    }

    const colorSel = document.querySelector('.color-dot.active')?.dataset.color || 'Estándar';
    const capacidadSel = document.querySelector('.capacidad-btn.active')?.textContent.trim() || 'Estándar';

    const productoParaCarrito = {
        ...productoActual,
        id: productoActual._id || productoActual.id,
        color: colorSel,
        capacidad: capacidadSel,
        cantidad: 1
    };

    // Usamos la función global de script.js
    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(productoParaCarrito);
        if (typeof abrirCarrito === 'function') abrirCarrito();
    } else {
        // Fallback si no encuentra la función global
        let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        carrito.push(productoParaCarrito);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        alert('Agregado al carrito');
    }
}