// admin.js - Panel de Administración MAC LINE
const API_URL = window.location.origin + '/api';

let productosActuales = [];
let productoEditando = null;

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarVentas();
    cargarReporteStock();
});

// ========== NAVEGACIÓN ==========
function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    
    // Mostrar la seleccionada
    document.getElementById(`${seccion}-seccion`).classList.add('activa');
    
    // Actualizar menú activo
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    event.target.classList.add('active');
}

// ========== CARGAR PRODUCTOS ==========
async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productosActuales = await response.json();
        renderizarTablaProductos(productosActuales);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('productosTableBody').innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 2rem; color: #e74c3c;">
                ❌ Error al cargar productos. Verifica la conexión.
            </td></tr>
        `;
    }
}

// ========== RENDERIZAR TABLA ==========
function renderizarTablaProductos(productos) {
    const tbody = document.getElementById('productosTableBody');
    
    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">
                No hay productos registrados
            </td></tr>
        `;
        return;
    }
    
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td><code>${p.id}</code></td>
            <td>${p.nombre}</td>
            <td><span class="badge badge-${p.categoria}">${p.categoria}</span></td>
            <td>$${p.precio.toLocaleString('es-CL')}</td>
            <td>
                <span class="stock-badge ${p.stock === 0 ? 'agotado' : p.stock < 5 ? 'bajo' : 'disponible'}">
                    ${p.stock} unidades
                </span>
            </td>
            <td>${p.descuento ? `<span class="descuento-badge">-${p.descuento}%</span>` : '-'}</td>
            <td class="acciones">
                <button class="btn-accion btn-editar" onclick="abrirModalEditar('${p.id}')" title="Editar">
                    ✏️
                </button>
                <button class="btn-accion btn-eliminar" onclick="eliminarProducto('${p.id}')" title="Eliminar">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
}

// ========== FILTRAR PRODUCTOS ==========
function filtrarProductosAdmin() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    
    const productosFiltrados = productosActuales.filter(p => 
        p.nombre.toLowerCase().includes(busqueda) ||
        p.categoria.toLowerCase().includes(busqueda) ||
        p.id.toString().includes(busqueda)
    );
    
    renderizarTablaProductos(productosFiltrados);
}

// ========== AGREGAR PRODUCTO ==========
async function agregarProducto(event) {
    event.preventDefault();
    
    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseInt(document.getElementById('precio').value),
        precioOriginal: parseInt(document.getElementById('precioOriginal').value) || null,
        stock: parseInt(document.getElementById('stock').value),
        descuento: parseInt(document.getElementById('descuento').value) || 0,
        emoji: document.getElementById('emoji').value || '📦'
    };
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });
        
        if (!response.ok) throw new Error('Error al agregar producto');
        
        alert('✅ Producto agregado exitosamente');
        document.getElementById('formularioProducto').reset();
        cargarProductos();
        mostrarSeccion('productos');
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al agregar producto: ' + error.message);
    }
}

// ========== ABRIR MODAL EDITAR ==========
function abrirModalEditar(productoId) {
    const producto = productosActuales.find(p => String(p.id) === String(productoId));
    
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }
    
    productoEditando = producto;
    
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
    
    if (!productoEditando) return;
    
    const datosActualizados = {
        nombre: document.getElementById('editNombre').value,
        categoria: document.getElementById('editCategoria').value,
        precio: parseInt(document.getElementById('editPrecio').value),
        stock: parseInt(document.getElementById('editStock').value),
        descuento: parseInt(document.getElementById('editDescuento').value) || 0
    };
    
    try {
        const response = await fetch(`${API_URL}/productos/${productoEditando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        
        if (!response.ok) throw new Error('Error al actualizar producto');
        
        alert('✅ Producto actualizado exitosamente');
        cerrarModal();
        cargarProductos();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al actualizar: ' + error.message);
    }
}

// ========== ELIMINAR PRODUCTO ==========
async function eliminarProducto(productoId) {
    const producto = productosActuales.find(p => String(p.id) === String(productoId));
    
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }
    
    const confirmar = confirm(`¿Estás seguro de eliminar "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`);
    
    if (!confirmar) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${productoId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar producto');
        
        alert('✅ Producto eliminado exitosamente');
        cargarProductos();
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar: ' + error.message);
    }
}

// ========== CERRAR MODAL ==========
function cerrarModal() {
    document.getElementById('editarModal').style.display = 'none';
    productoEditando = null;
}

// ========== CARGAR VENTAS ==========
async function cargarVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        
        if (!response.ok) {
            throw new Error('Error al cargar ventas');
        }
        
        const ventas = await response.json();
        renderizarTablaVentas(ventas);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('ventasTableBody').innerHTML = `
            <tr><td colspan="6" style="text-align: center; padding: 2rem; color: #e74c3c;">
                ❌ Error al cargar ventas
            </td></tr>
        `;
    }
}

function renderizarTablaVentas(ventas) {
    const tbody = document.getElementById('ventasTableBody');
    
    if (ventas.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
                No hay ventas registradas
            </td></tr>
        `;
        return;
    }
    
    tbody.innerHTML = ventas.map(v => {
        const fecha = new Date(v.fecha).toLocaleDateString('es-CL');
        const total = v.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
        
        return `
            <tr>
                <td><code>${v.id}</code></td>
                <td>${fecha}</td>
                <td>${v.cliente.nombre}</td>
                <td>${v.cliente.email}</td>
                <td>$${total.toLocaleString('es-CL')}</td>
                <td>
                    <button class="btn-accion btn-ver" onclick="verDetallesVenta('${v.id}')">
                        👁️ Ver
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function verDetallesVenta(ventaId) {
    // Implementar vista de detalles de venta
    alert('Función en desarrollo');
}

function cerrarModalVenta() {
    document.getElementById('detallesVentaModal').style.display = 'none';
}

// ========== REPORTE DE STOCK ==========
async function cargarReporteStock() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const productos = await response.json();
        
        // Calcular estadísticas
        const totalProductos = productos.length;
        const productosAgotados = productos.filter(p => p.stock === 0).length;
        const stockBajo = productos.filter(p => p.stock > 0 && p.stock < 5).length;
        
        document.getElementById('totalProductos').textContent = totalProductos;
        document.getElementById('productosAgotados').textContent = productosAgotados;
        document.getElementById('stockBajo').textContent = stockBajo;
        
        // Renderizar tabla
        const tbody = document.getElementById('stockTableBody');
        tbody.innerHTML = productos.map(p => {
            let estado = '';
            let clase = '';
            
            if (p.stock === 0) {
                estado = 'Agotado';
                clase = 'agotado';
            } else if (p.stock < 5) {
                estado = 'Stock Bajo';
                clase = 'bajo';
            } else {
                estado = 'Disponible';
                clase = 'disponible';
            }
            
            return `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.categoria}</td>
                    <td>${p.stock}</td>
                    <td><span class="stock-badge ${clase}">${estado}</span></td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error:', error);
    }
}
