// admin.js - VERSIÓN COMPLETA ARREGLADA
const API_URL = window.location.origin + '/api';

let productosActuales = [];
let productoEditandoId = null;

// Para agregar
let imagenPortadaBase64 = null;
let imagenesAdicionales = [null, null, null, null, null];

// Para editar
let imagenPortadaEditBase64 = null;
let imagenesAdicionalesEdit = [null, null, null, null, null];
let imagenesOriginales = [];

function obtenerIdProducto(producto) {
    return producto.id || producto._id || String(producto._id);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin Panel Cargando...');
    cargarProductos();
    cargarVentas();
    cargarReporteStock();
});

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    const seccionEl = document.getElementById(`${seccion}-seccion`);
    if (seccionEl) seccionEl.classList.add('activa');
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
}

// Funciones para calcular precio final
function calcularPrecioFinalNuevo() {
    const precioOriginal = parseFloat(document.getElementById('nuevoPrecioOriginal').value) || 0;
    const descuento = parseFloat(document.getElementById('nuevoDescuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    document.getElementById('nuevoPrecio').value = precioFinal;
}

function calcularPrecioFinalEditar() {
    const precioOriginal = parseFloat(document.getElementById('editarPrecioOriginal').value) || 0;
    const descuento = parseFloat(document.getElementById('editarDescuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    document.getElementById('editarPrecio').value = precioFinal;
}

// Función de previsualización para el diseño minimalista
function previsualizarImagen(input, previewId) {
    const file = input.files[0];
    const preview = document.getElementById(previewId);
    
    if (!file) {
        preview.classList.remove('tiene-imagen');
        preview.innerHTML = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.classList.add('tiene-imagen');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productosActuales = await response.json();
        console.log(`✅ ${productosActuales.length} productos cargados`);
        renderizarTablaProductos(productosActuales);
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        alert('Error al cargar productos');
    }
}

function renderizarTablaProductos(productos) {
    const tbody = document.getElementById('listaProductosAdmin');
    if (!tbody) return;
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #94a3b8;">No hay productos</td></tr>';
        return;
    }
    
    tbody.innerHTML = productos.map(p => {
        const id = obtenerIdProducto(p);
        const precio = p.precio || 0;
        const precioOriginal = p.precioOriginal || precio;
        const descuento = p.descuento || 0;
        
        return `
            <tr>
                <td>#${String(id).substring(0, 8)}</td>
                <td>
                    ${p.imagenPortada ? 
                        `<img src="${p.imagenPortada}" style="width: 50px; height: 50px; object-fit: contain; background: #f5f5f5; border-radius: 4px;">` : 
                        `<div style="width: 50px; height: 50px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center;">${p.emoji || '📦'}</div>`
                    }
                </td>
                <td><strong>${p.nombre}</strong></td>
                <td><span style="text-transform: capitalize;">${p.categoria}</span></td>
                <td>$${precioOriginal.toLocaleString('es-CL')}</td>
                <td>${descuento}%</td>
                <td><strong style="color: #00d4ff;">$${precio.toLocaleString('es-CL')}</strong></td>
                <td>
                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; font-weight: 600; ${
                        p.stock === 0 ? 'background: #fee; color: #c00;' :
                        p.stock < 5 ? 'background: #fef3cd; color: #856404;' :
                        'background: #d4edda; color: #155724;'
                    }">
                        ${p.stock}
                    </span>
                </td>
                <td>
                    <button onclick="editarProducto('${id}')" class="btn-accion btn-editar">✏️ Editar</button>
                    <button onclick="eliminarProducto('${id}')" class="btn-accion btn-eliminar">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filtrarProductosAdmin() {
    const termino = document.getElementById('buscarProducto').value.toLowerCase();
    const filtrados = productosActuales.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.categoria.toLowerCase().includes(termino)
    );
    renderizarTablaProductos(filtrados);
}

async function agregarProducto(event) {
    event.preventDefault();
    
    const precioOriginal = parseFloat(document.getElementById('nuevoPrecioOriginal').value);
    const descuento = parseFloat(document.getElementById('nuevoDescuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    
    // Recoger imágenes de los inputs
    const imagenes = [];
    for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`nuevaImagen${i}`);
        if (input && input.files[0]) {
            const base64 = await fileToBase64(input.files[0]);
            imagenes.push(base64);
        }
    }
    
    let portada = null;
    const portadaInput = document.getElementById('nuevaImagenPortada');
    if (portadaInput && portadaInput.files[0]) {
        portada = await fileToBase64(portadaInput.files[0]);
    }
    
    const nuevoProducto = {
        nombre: document.getElementById('nuevoNombre').value,
        categoria: document.getElementById('nuevaCategoria').value,
        descripcion: document.getElementById('nuevaDescripcion').value,
        precioOriginal: precioOriginal,
        descuento: descuento,
        precio: precioFinal,
        stock: parseInt(document.getElementById('nuevoStock').value),
        imagenPortada: portada,
        imagenes: imagenes,
        emoji: '📦'
    };
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });
        
        if (!response.ok) throw new Error('Error al agregar');
        
        alert('✅ Producto agregado exitosamente');
        document.querySelector('.form-producto').reset();
        document.querySelectorAll('.imagen-preview').forEach(p => {
            p.classList.remove('tiene-imagen');
            p.innerHTML = '';
        });
        await cargarProductos();
        mostrarSeccion('productos');
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al agregar producto');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function editarProducto(id) {
    alert('⚠️ Función de editar deshabilitada temporalmente. Usa "Eliminar" y "Agregar Producto" nuevamente.');
}

function cerrarModalEditar() {
    // Modal eliminado
}

async function eliminarProducto(id) {
    const producto = productosActuales.find(p => String(obtenerIdProducto(p)) === String(id));
    if (!producto || !confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        alert('✅ Producto eliminado');
        await cargarProductos();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar producto');
    }
}

async function cargarVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        if (!response.ok) return;
        const ventas = await response.json();
        renderizarTablaVentas(ventas);
    } catch (error) {
        console.error('Error cargando ventas:', error);
    }
}

function renderizarTablaVentas(ventas) {
    const container = document.getElementById('listaVentas');
    if (!container) return;
    
    if (ventas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 3rem;">No hay ventas registradas</p>';
        return;
    }
    
    container.innerHTML = ventas.map(venta => {
        const productos = venta.productos || venta.items || [];
        const cliente = venta.cliente || {};
        
        return `
            <div class="venta-card">
                <div class="venta-header">
                    <div class="venta-id">Pedido #${String(venta.id || venta._id).substring(0, 8)}</div>
                    <div class="venta-fecha">${new Date(venta.fecha).toLocaleString('es-CL', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
                
                <div class="venta-cliente">
                    <h4>👤 Información del Cliente</h4>
                    <div class="cliente-info">
                        <div class="info-item">
                            <span class="info-label">Nombre</span>
                            <span class="info-value">${cliente.nombre || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email</span>
                            <span class="info-value">${cliente.email || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Teléfono</span>
                            <span class="info-value">${cliente.telefono || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Dirección de Envío</span>
                            <span class="info-value">${cliente.direccion || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="venta-productos">
                    <h4>🛒 Productos (${productos.length})</h4>
                    ${productos.map(prod => {
                        const detalles = [];
                        if (prod.color) detalles.push(prod.color);
                        if (prod.capacidad) detalles.push(prod.capacidad);
                        
                        return `
                            <div class="producto-venta-item">
                                <div>
                                    <div class="producto-venta-nombre">${prod.nombre}</div>
                                    ${detalles.length > 0 ? `<div class="producto-venta-detalles">${detalles.join(' • ')}</div>` : ''}
                                    <div class="producto-venta-detalles">Cantidad: ${prod.cantidad}</div>
                                </div>
                                <div class="producto-venta-precio">
                                    $${(prod.precio * prod.cantidad).toLocaleString('es-CL')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="venta-total">
                    <span class="venta-total-label">Total de la Venta</span>
                    <span class="venta-total-valor">$${Number(venta.total).toLocaleString('es-CL')}</span>
                </div>
            </div>
        `;
    }).join('');
}

async function cargarReporteStock() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) return;
        
        const productos = await response.json();
        const container = document.getElementById('reporteStock');
        if (!container) return;
        
        const stockBajo = productos.filter(p => p.stock < 5 && p.stock > 0);
        const agotados = productos.filter(p => p.stock === 0);
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                <div style="padding: 2rem; background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.2)); border-radius: 16px; border: 2px solid rgba(220, 38, 38, 0.5);">
                    <h3 style="color: #fca5a5; margin-bottom: 1rem; font-size: 1.125rem; font-weight: 600;">⚠️ Stock Agotado</h3>
                    <p style="font-size: 3rem; font-weight: 700; color: #ef4444; margin: 0;">${agotados.length}</p>
                </div>
                <div style="padding: 2rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2)); border-radius: 16px; border: 2px solid rgba(245, 158, 11, 0.5);">
                    <h3 style="color: #fcd34d; margin-bottom: 1rem; font-size: 1.125rem; font-weight: 600;">📉 Stock Bajo (&lt;5)</h3>
                    <p style="font-size: 3rem; font-weight: 700; color: #f59e0b; margin: 0;">${stockBajo.length}</p>
                </div>
            </div>
            
            ${agotados.length > 0 ? `
                <h3 style="color: #fca5a5; margin: 2rem 0 1rem; font-size: 1.25rem; font-weight: 600;">Productos Agotados:</h3>
                <div style="display: grid; gap: 1rem;">
                    ${agotados.map(p => `
                        <div style="padding: 1.25rem; background: rgba(220, 38, 38, 0.1); border-left: 4px solid #ef4444; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #fca5a5; font-size: 1.0625rem;">${p.nombre}</strong>
                                <span style="color: #94a3b8; margin-left: 1rem; text-transform: capitalize;">${p.categoria}</span>
                            </div>
                            <span style="background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 700;">AGOTADO</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${stockBajo.length > 0 ? `
                <h3 style="color: #fcd34d; margin: 2rem 0 1rem; font-size: 1.25rem; font-weight: 600;">Productos con Stock Bajo:</h3>
                <div style="display: grid; gap: 1rem;">
                    ${stockBajo.map(p => `
                        <div style="padding: 1.25rem; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #fcd34d; font-size: 1.0625rem;">${p.nombre}</strong>
                                <span style="color: #94a3b8; margin-left: 1rem; text-transform: capitalize;">${p.categoria}</span>
                            </div>
                            <span style="background: #f59e0b; color: #1f2937; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 700;">STOCK: ${p.stock}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Error:', error);
    }
}
