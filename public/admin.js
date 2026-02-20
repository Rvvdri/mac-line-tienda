// admin.js - Panel de Administración MAC LINE - FIX PARA IDS VIEJOS
const API_URL = window.location.origin + '/api';

let productosActuales = [];
let productoEditandoId = null;

// ========== FUNCIÓN HELPER PARA OBTENER ID ==========
function obtenerIdProducto(producto) {
    // Retorna el ID correcto, ya sea 'id' o '_id'
    return producto.id || producto._id || String(producto._id);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin Panel iniciado');
    console.log('📡 API URL:', API_URL);
    cargarProductos();
    cargarVentas();
    cargarReporteStock();
});

// ========== NAVEGACIÓN ==========
function mostrarSeccion(seccion) {
    console.log('📍 Navegando a:', seccion);
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    const seccionEl = document.getElementById(`${seccion}-seccion`);
    if (seccionEl) seccionEl.classList.add('activa');
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
}

// ========== CARGAR PRODUCTOS ==========
async function cargarProductos() {
    console.log('📦 Cargando productos...');
    try {
        const response = await fetch(`${API_URL}/productos`);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
        productosActuales = await response.json();
        console.log('✅ Productos cargados:', productosActuales.length);
        
        // Log para debug - ver formato de IDs
        if (productosActuales.length > 0) {
            const primer = productosActuales[0];
            console.log('📝 Ejemplo de producto:', {
                id: primer.id,
                _id: primer._id,
                tipoId: typeof primer.id,
                tipo_id: typeof primer._id,
                nombre: primer.nombre
            });
        }
        
        renderizarTablaProductos(productosActuales);
        
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        const tbody = document.getElementById('productosTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="7" style="text-align: center; padding: 2rem; color: #e74c3c;">
                    ❌ Error: ${error.message}<br>
                    <button onclick="cargarProductos()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
                        🔄 Reintentar
                    </button>
                </td></tr>
            `;
        }
    }
}

// ========== RENDERIZAR TABLA ==========
function renderizarTablaProductos(productos) {
    const tbody = document.getElementById('productosTableBody');
    if (!tbody) {
        console.error('❌ No se encontró productosTableBody');
        return;
    }
    
    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">
                No hay productos registrados
            </td></tr>
        `;
        return;
    }
    
    tbody.innerHTML = productos.map(p => {
        const productoId = obtenerIdProducto(p);
        
        return `
        <tr>
            <td><code title="${productoId}">${String(productoId).substring(0, 12)}...</code></td>
            <td>${p.nombre}</td>
            <td><span class="badge badge-${p.categoria}">${p.categoria}</span></td>
            <td>$${Number(p.precio).toLocaleString('es-CL')}</td>
            <td>
                <span class="stock-badge ${p.stock === 0 ? 'agotado' : p.stock < 5 ? 'bajo' : 'disponible'}">
                    ${p.stock} unidades
                </span>
            </td>
            <td>${p.descuento ? `<span class="descuento-badge">-${p.descuento}%</span>` : '-'}</td>
            <td class="acciones">
                <button class="btn-accion btn-editar" onclick='abrirModalEditar(${JSON.stringify(productoId)})' title="Editar">
                    ✏️
                </button>
                <button class="btn-accion btn-eliminar" onclick='eliminarProducto(${JSON.stringify(productoId)})' title="Eliminar">
                    🗑️
                </button>
            </td>
        </tr>
    `}).join('');
    
    console.log('✅ Tabla renderizada con', productos.length, 'productos');
}

// ========== FILTRAR PRODUCTOS ==========
function filtrarProductosAdmin() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const productosFiltrados = productosActuales.filter(p => {
        const idProducto = obtenerIdProducto(p);
        return p.nombre.toLowerCase().includes(busqueda) ||
               p.categoria.toLowerCase().includes(busqueda) ||
               String(idProducto).toLowerCase().includes(busqueda);
    });
    renderizarTablaProductos(productosFiltrados);
}

// ========== AGREGAR PRODUCTO ==========
async function agregarProducto(event) {
    event.preventDefault();
    console.log('➕ Agregando producto...');
    
    const precioOriginalInput = document.getElementById('precioOriginal').value;
    const descuentoInput = document.getElementById('descuento').value;
    
    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseFloat(document.getElementById('precio').value),
        precioOriginal: precioOriginalInput ? parseFloat(precioOriginalInput) : null,
        stock: parseInt(document.getElementById('stock').value),
        descuento: descuentoInput ? parseFloat(descuentoInput) : 0,
        emoji: document.getElementById('emoji').value || '📦'
    };
    
    console.log('📝 Datos del producto:', nuevoProducto);
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al agregar producto');
        }
        
        const resultado = await response.json();
        console.log('✅ Producto agregado:', resultado);
        
        alert('✅ Producto agregado exitosamente');
        document.getElementById('formularioProducto').reset();
        await cargarProductos();
        mostrarSeccion('productos');
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al agregar producto: ' + error.message);
    }
}

// ========== ABRIR MODAL EDITAR ==========
function abrirModalEditar(productoId) {
    console.log('✏️ Abriendo modal editar para producto:', productoId);
    console.log('Tipo de productoId recibido:', typeof productoId);
    
    // Buscar el producto con cualquier tipo de ID
    const producto = productosActuales.find(p => {
        const idActual = obtenerIdProducto(p);
        return String(idActual) === String(productoId);
    });
    
    if (!producto) {
        alert('❌ Producto no encontrado');
        console.error('Producto no encontrado:', productoId);
        console.log('IDs disponibles:', productosActuales.map(p => obtenerIdProducto(p)));
        return;
    }
    
    productoEditandoId = productoId;
    console.log('📝 Producto a editar:', producto);
    
    // Llenar formulario
    document.getElementById('editNombre').value = producto.nombre;
    document.getElementById('editCategoria').value = producto.categoria;
    document.getElementById('editPrecio').value = producto.precio;
    document.getElementById('editStock').value = producto.stock;
    document.getElementById('editDescuento').value = producto.descuento || 0;
    
    // Mostrar modal
    document.getElementById('editarModal').style.display = 'flex';
}

// ========== GUARDAR EDICIÓN ==========
async function guardarEdicion(event) {
    event.preventDefault();
    console.log('💾 Guardando edición...');
    console.log('ID del producto editando:', productoEditandoId);
    
    if (!productoEditandoId) {
        alert('❌ Error: No hay producto seleccionado para editar');
        return;
    }
    
    // Buscar el producto actual
    const producto = productosActuales.find(p => {
        const idActual = obtenerIdProducto(p);
        return String(idActual) === String(productoEditandoId);
    });
    
    if (!producto) {
        alert('❌ Error: Producto no encontrado');
        console.error('Producto no encontrado con ID:', productoEditandoId);
        return;
    }
    
    const datosActualizados = {
        nombre: document.getElementById('editNombre').value,
        categoria: document.getElementById('editCategoria').value,
        precio: parseFloat(document.getElementById('editPrecio').value),
        stock: parseInt(document.getElementById('editStock').value),
        descuento: parseFloat(document.getElementById('editDescuento').value) || 0
    };
    
    console.log('📝 Datos actualizados:', datosActualizados);
    
    try {
        const response = await fetch(`${API_URL}/productos/${productoEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar producto');
        }
        
        const resultado = await response.json();
        console.log('✅ Resultado:', resultado);
        
        alert('✅ Producto actualizado exitosamente');
        cerrarModal();
        await cargarProductos();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al actualizar: ' + error.message);
    }
}

// ========== ELIMINAR PRODUCTO ==========
async function eliminarProducto(productoId) {
    console.log('🗑️ Eliminando producto:', productoId);
    console.log('Tipo de productoId:', typeof productoId);
    
    // Buscar el producto
    const producto = productosActuales.find(p => {
        const idActual = obtenerIdProducto(p);
        return String(idActual) === String(productoId);
    });
    
    if (!producto) {
        alert('❌ Producto no encontrado');
        console.error('No se encontró producto con ID:', productoId);
        return;
    }
    
    const confirmar = confirm(`¿Estás seguro de eliminar "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`);
    
    if (!confirmar) {
        console.log('❌ Eliminación cancelada');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/productos/${productoId}`, {
            method: 'DELETE'
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar producto');
        }
        
        console.log('✅ Producto eliminado');
        alert('✅ Producto eliminado exitosamente');
        await cargarProductos();
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al eliminar: ' + error.message);
    }
}

// ========== CERRAR MODAL ==========
function cerrarModal() {
    document.getElementById('editarModal').style.display = 'none';
    productoEditandoId = null;
}

// ========== CARGAR VENTAS ==========
async function cargarVentas() {
    console.log('💰 Cargando ventas...');
    try {
        const response = await fetch(`${API_URL}/ventas`);
        if (!response.ok) throw new Error('Error al cargar ventas');
        
        const ventas = await response.json();
        console.log('✅ Ventas cargadas:', ventas.length);
        renderizarTablaVentas(ventas);
        
    } catch (error) {
        console.error('❌ Error al cargar ventas:', error);
        const tbody = document.getElementById('ventasTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr><td colspan="6" style="text-align: center; padding: 2rem; color: #e74c3c;">
                    ❌ Error: ${error.message}
                </td></tr>
            `;
        }
    }
}

// ========== RENDERIZAR TABLA VENTAS ==========
function renderizarTablaVentas(ventas) {
    const tbody = document.getElementById('ventasTableBody');
    if (!tbody) return;
    
    if (ventas.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
                No hay ventas registradas
            </td></tr>
        `;
        return;
    }
    
    ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    tbody.innerHTML = ventas.map(venta => {
        const fecha = new Date(venta.fecha).toLocaleString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const productos = venta.productos || venta.items || [];
        
        const productosHTML = productos.map(prod => {
            const variantes = [];
            if (prod.color) variantes.push(`🎨 ${prod.color}`);
            if (prod.capacidad) variantes.push(`💾 ${prod.capacidad}`);
            
            return `
                <div style="margin-bottom: 0.5rem; padding: 0.6rem; background: #f8f9fa; border-left: 3px solid #0066cc; border-radius: 4px;">
                    <strong>${prod.nombre}</strong>
                    ${variantes.length > 0 ? `<br><small>${variantes.join(' | ')}</small>` : ''}
                    <br>
                    <small>📦 ${prod.cantidad} × $${Number(prod.precio).toLocaleString('es-CL')} = <strong>$${(prod.cantidad * prod.precio).toLocaleString('es-CL')}</strong></small>
                </div>
            `;
        }).join('');
        
        return `
            <tr>
                <td><strong>#${String(venta.id).substring(0, 8)}</strong></td>
                <td>
                    <strong>${venta.cliente.nombre}</strong><br>
                    <small>📧 ${venta.cliente.email}<br>
                    📱 ${venta.cliente.telefono}</small>
                </td>
                <td>${productosHTML}</td>
                <td><strong style="color: #00a651;">$${Number(venta.total).toLocaleString('es-CL')}</strong></td>
                <td><small>${fecha}</small></td>
                <td><span style="padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.813rem; font-weight: 600; background: #d4edda; color: #155724;">${venta.estado || 'COMPLETADA'}</span></td>
            </tr>
        `;
    }).join('');
}

function cerrarModalVenta() {
    document.getElementById('detallesVentaModal').style.display = 'none';
}

// ========== REPORTE DE STOCK ==========
async function cargarReporteStock() {
    console.log('📊 Cargando reporte de stock...');
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const productos = await response.json();
        console.log('✅ Stock cargado:', productos.length, 'productos');
        
        const totalProductos = productos.length;
        const stockTotal = productos.reduce((sum, p) => sum + p.stock, 0);
        const productosAgotados = productos.filter(p => p.stock === 0).length;
        const stockBajo = productos.filter(p => p.stock > 0 && p.stock < 5).length;
        
        const totalProdEl = document.getElementById('totalProductos');
        const stockTotalEl = document.getElementById('stockTotal');
        const agotadosEl = document.getElementById('productosAgotados');
        const bajoEl = document.getElementById('stockBajo');
        
        if (totalProdEl) totalProdEl.textContent = totalProductos;
        if (stockTotalEl) stockTotalEl.textContent = stockTotal;
        if (agotadosEl) agotadosEl.textContent = productosAgotados;
        if (bajoEl) bajoEl.textContent = stockBajo;
        
        const tbody = document.getElementById('stockBajoTableBody');
        if (tbody) {
            const productosBajo = productos.filter(p => p.stock < 5);
            
            if (productosBajo.length === 0) {
                tbody.innerHTML = `
                    <tr><td colspan="4" style="text-align: center; padding: 2rem; color: #666;">
                        ✅ Todos los productos tienen stock suficiente
                    </td></tr>
                `;
            } else {
                tbody.innerHTML = productosBajo.map(p => {
                    const estado = p.stock === 0 ? 'Agotado' : 'Stock Bajo';
                    const clase = p.stock === 0 ? 'agotado' : 'bajo';
                    
                    return `
                        <tr>
                            <td>${p.nombre}</td>
                            <td>${p.categoria}</td>
                            <td><strong>${p.stock}</strong></td>
                            <td><span class="stock-badge ${clase}">${estado}</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }
        
    } catch (error) {
        console.error('❌ Error al cargar reporte:', error);
    }
}
