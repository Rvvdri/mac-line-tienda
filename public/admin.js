const API_URL = 'http://localhost:3000/api';

let productosAdmin = [];
let ventasAdmin = [];
let productoEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosAdmin();
    cargarVentasAdmin();
    actualizarEstadisticas();
});

// FUNCIÓN PARA CALCULAR DESCUENTO AUTOMÁTICAMENTE
function calcularDescuento() {
    const precioOriginal = parseFloat(document.getElementById('precioOriginal').value);
    const precioFinal = parseFloat(document.getElementById('precio').value);
    
    if (precioOriginal && precioFinal && precioOriginal > precioFinal) {
        const descuento = Math.round(((precioOriginal - precioFinal) / precioOriginal) * 100);
        document.getElementById('descuento').value = descuento;
    } else {
        document.getElementById('descuento').value = 0;
    }
}

// FUNCIÓN PARA CALCULAR PRECIO FINAL DESDE DESCUENTO
function calcularPrecioFinal() {
    const precioOriginal = parseFloat(document.getElementById('precioOriginal').value);
    const descuento = parseFloat(document.getElementById('descuento').value);
    
    if (precioOriginal && descuento) {
        const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
        document.getElementById('precio').value = precioFinal;
    }
}

function mostrarSeccion(seccion) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById(seccion + '-seccion').classList.add('activa');
    event.target.classList.add('active');
}

async function cargarProductosAdmin() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        productosAdmin = await response.json();
        renderizarTablaProductos(productosAdmin);
    } catch (error) {
        console.error('Error cargando productos:', error);
        alert('Error al cargar los productos');
    }
}

function renderizarTablaProductos(productos) {
    const tbody = document.getElementById('productosTableBody');
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">No hay productos</td></tr>';
        return;
    }

    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>$${p.precio.toLocaleString('es-CL')}</td>
            <td>
                <strong>${p.stock}</strong>
                ${p.stock === 0 ? '<br><span style="color: #ff4444;">AGOTADO</span>' : ''}
                ${p.stock > 0 && p.stock < 5 ? '<br><span style="color: #ffaa00;">BAJO</span>' : ''}
            </td>
            <td>${p.descuento ? p.descuento + '%' : '-'}</td>
            <td>
                <button class="btn-editar" onclick="abrirModalEditar(${p.id})">✏️ Editar</button>
                <button class="btn-eliminar" onclick="eliminarProducto(${p.id})">🗑️ Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function filtrarProductosAdmin() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const productosFiltrados = productosAdmin.filter(p => 
        p.nombre.toLowerCase().includes(busqueda) ||
        p.categoria.toLowerCase().includes(busqueda)
    );
    renderizarTablaProductos(productosFiltrados);
}

async function agregarProducto(event) {
    event.preventDefault();

    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseInt(document.getElementById('precio').value),
        precioOriginal: parseInt(document.getElementById('precioOriginal').value) || null,
        descuento: parseInt(document.getElementById('descuento').value) || 0,
        stock: parseInt(document.getElementById('stock').value),
        emoji: document.getElementById('emoji').value || '📦'
    };

    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });

        if (response.ok) {
            alert('✓ Producto agregado exitosamente');
            document.getElementById('formularioProducto').reset();
            cargarProductosAdmin();
        } else {
            alert('Error al agregar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

function abrirModalEditar(productoId) {
    productoEditando = productosAdmin.find(p => p.id === productoId);
    
    if (!productoEditando) return;

    document.getElementById('editNombre').value = productoEditando.nombre;
    document.getElementById('editCategoria').value = productoEditando.categoria;
    document.getElementById('editPrecio').value = productoEditando.precio;
    document.getElementById('editStock').value = productoEditando.stock;
    document.getElementById('editDescuento').value = productoEditando.descuento || 0;

    document.getElementById('editarModal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('editarModal').style.display = 'none';
    productoEditando = null;
}

async function guardarEdicion(event) {
    event.preventDefault();

    const productoActualizado = {
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
            body: JSON.stringify(productoActualizado)
        });

        if (response.ok) {
            alert('✓ Producto actualizado exitosamente');
            cerrarModal();
            cargarProductosAdmin();
        } else {
            alert('Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

async function eliminarProducto(productoId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/productos/${productoId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('✓ Producto eliminado');
            cargarProductosAdmin();
        } else {
            alert('Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

async function cargarVentasAdmin() {
    try {
        const response = await fetch(`${API_URL}/pagos`);
        ventasAdmin = await response.json();
        renderizarTablaVentas(ventasAdmin);
    } catch (error) {
        console.error('Error cargando ventas:', error);
    }
}

function renderizarTablaVentas(ventas) {
    const tbody = document.getElementById('ventasTableBody');
    
    if (ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">No hay ventas registradas</td></tr>';
        return;
    }

    tbody.innerHTML = ventas.map(v => `
        <tr>
            <td>#${v.id}</td>
            <td>${v.cliente.nombre}</td>
            <td>${v.cliente.email}</td>
            <td>${v.cliente.telefono}</td>
            <td>$${v.total.toLocaleString('es-CL')}</td>
            <td>${new Date(v.fechaCreacion).toLocaleDateString('es-CL')}</td>
            <td>
                <button class="btn-detalles" onclick="verDetallesVenta(${v.id})">👁️ Ver</button>
            </td>
        </tr>
    `).join('');
}

function verDetallesVenta(ventaId) {
    const venta = ventasAdmin.find(v => v.id === ventaId);
    if (!venta) return;

    const itemsHTML = venta.items.map(item => `
        <tr>
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toLocaleString('es-CL')}</td>
            <td>$${(item.cantidad * item.precio).toLocaleString('es-CL')}</td>
        </tr>
    `).join('');

    const contenido = `
        <div style="margin-bottom: 1.5rem;">
            <h3 style="color: #00d4ff; margin-bottom: 1rem;">Cliente</h3>
            <p><strong>Nombre:</strong> ${venta.cliente.nombre}</p>
            <p><strong>Email:</strong> ${venta.cliente.email}</p>
            <p><strong>Teléfono:</strong> ${venta.cliente.telefono}</p>
            <p><strong>Dirección:</strong> ${venta.cliente.direccion}</p>
            <p><strong>Fecha:</strong> ${new Date(venta.fechaCreacion).toLocaleString('es-CL')}</p>
        </div>

        <div style="margin-bottom: 1.5rem;">
            <h3 style="color: #00d4ff; margin-bottom: 1rem;">Productos</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background-color: #0f1419;">
                    <tr>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #00d4ff;">Producto</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #00d4ff;">Cantidad</th>
                        <th style="padding: 0.75rem; text-align: right; border-bottom: 2px solid #00d4ff;">Precio</th>
                        <th style="padding: 0.75rem; text-align: right; border-bottom: 2px solid #00d4ff;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>

        <div style="background-color: #0f1419; padding: 1rem; border-radius: 6px; border: 2px solid #00d4ff;">
            <p style="text-align: right; font-size: 1.3rem;"><strong style="color: #00d4ff;">Total: $${venta.total.toLocaleString('es-CL')}</strong></p>
        </div>
    `;

    document.getElementById('detallesVentaContent').innerHTML = contenido;
    document.getElementById('detallesVentaModal').style.display = 'flex';
}

function cerrarModalVenta() {
    document.getElementById('detallesVentaModal').style.display = 'none';
}

function actualizarEstadisticas() {
    document.getElementById('totalProductos').textContent = productosAdmin.length;

    const agotados = productosAdmin.filter(p => p.stock === 0).length;
    document.getElementById('productosAgotados').textContent = agotados;

    const stockBajo = productosAdmin.filter(p => p.stock > 0 && p.stock < 5).length;
    document.getElementById('stockBajo').textContent = stockBajo;

    const totalVentas = ventasAdmin.reduce((sum, v) => sum + v.total, 0);
    document.getElementById('totalVentas').textContent = '$' + totalVentas.toLocaleString('es-CL');

    renderizarTablaStock();
}

function renderizarTablaStock() {
    const tbody = document.getElementById('stockTableBody');
    
    tbody.innerHTML = productosAdmin.map(p => {
        let estado = '';
        let clase = '';

        if (p.stock === 0) {
            estado = 'AGOTADO';
            clase = 'estado-agotado';
        } else if (p.stock < 5) {
            estado = 'BAJO';
            clase = 'estado-bajo';
        } else {
            estado = 'DISPONIBLE';
            clase = 'estado-disponible';
        }

        return `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td><strong>${p.stock}</strong></td>
                <td><span class="${clase}">${estado}</span></td>
            </tr>
        `;
    }).join('');
}

window.onclick = function(event) {
    const editarModal = document.getElementById('editarModal');
    const detallesModal = document.getElementById('detallesVentaModal');
    
    if (event.target === editarModal) {
        cerrarModal();
    }
    if (event.target === detallesModal) {
        cerrarModalVenta();
    }
}

setInterval(() => {
    cargarProductosAdmin();
    cargarVentasAdmin();
    actualizarEstadisticas();
}, 30000);
