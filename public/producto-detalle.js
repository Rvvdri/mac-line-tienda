// producto-detalle.js
const API_URL_BASE = `${window.location.origin}/api`;
let productoActual = null;

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
        const response = await fetch(`${API_URL_BASE}/productos/${productoId}`);
        
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        
        productoActual = await response.json();
        renderizarProductoDetalle(productoActual);
        
    } catch (error) {
        console.error('Error cargando producto:', error);
        alert('Error al cargar el producto');
        window.location.href = 'index.html';
    }
}

function renderizarProductoDetalle(producto) {
    // Título de la página
    document.getElementById('pageTitle').textContent = `${producto.nombre} - MAC LINE`;
    
    // Breadcrumb
    document.getElementById('breadcrumbProducto').textContent = producto.nombre;
    
    // Imagen principal
    document.getElementById('imagenPrincipal').textContent = producto.emoji || '📱';
    
    // Título y SKU
    document.getElementById('productoTitulo').textContent = producto.nombre;
    document.getElementById('productoSku').textContent = `SKU: ${producto.categoria.toUpperCase()}-${producto.id}`;
    
    // Precios
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
    
    // Stock
    const stockInfo = document.getElementById('stockInfo');
    if (producto.stock > 0) {
        stockInfo.innerHTML = `✓ <strong>${producto.stock}</strong> unidades disponibles`;
        stockInfo.style.background = '#f0f9ff';
        stockInfo.querySelector('strong').style.color = '#34c759';
    } else {
        stockInfo.innerHTML = '✗ Sin stock';
        stockInfo.style.background = '#fff5f5';
        stockInfo.querySelector('strong').style.color = '#ff3b30';
    }
    
    // Descripción
    document.getElementById('productoDescripcion').textContent = producto.descripcion;
    
    // Cuota mensual (36 cuotas)
    const cuotaMensual = Math.ceil(producto.precio / 36);
    document.getElementById('cuotaMensual').textContent = `36 cuotas de $${cuotaMensual.toLocaleString('es-CL')}`;
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
    
    // Obtener carrito actual
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === productoActual.id);
    
    if (productoExistente) {
        // Verificar stock
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
            cantidad: 1
        });
    }
    
    // Guardar carrito
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar contador
    actualizarContadorCarrito();
    
    // Mostrar mensaje
    alert(`✓ ${productoActual.nombre} agregado al carrito`);
    
    // Opcionalmente, abrir el carrito
    abrirCarrito();
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    document.querySelector('.cart-count').textContent = totalItems;
}
