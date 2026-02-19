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
        precio: parseFloat(document.getElementById('precio').value),
        precioOriginal: parseFloat(document.getElementById('precioOriginal').value) || null,
        stock: parseInt(document.getElementById('stock').value),
        descuento: parseFloat(document.getElementById('descuento').value) || 0,
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
        precio: parseFloat(document.getElementById('editPrecio').value),
        stock: parseInt(document.getElementById('editStock').value),
        descuento: parseFloat(document.getElementById('editDescuento').value) || 0
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

// ========== CARGAR VENTAS CON FILTROS Y REPORTES ==========

let ventasGlobal = []; // Guardar todas las ventas para filtros

async function cargarVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        
        if (!response.ok) {
            throw new Error('Error al cargar ventas');
        }
        
        ventasGlobal = await response.json();
        aplicarFiltroVentas(); // Aplicar filtro inicial
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('ventasTableBody').innerHTML = `
            <tr><td colspan="6" style="text-align: center; padding: 2rem; color: #e74c3c;">
                ❌ Error al cargar ventas
            </td></tr>
        `;
    }
}

// Aplicar filtros de fecha
function aplicarFiltroVentas() {
    const filtro = document.getElementById('filtroFecha')?.value || 'semana';
    const fechaInicio = document.getElementById('fechaInicio')?.value;
    const fechaFin = document.getElementById('fechaFin')?.value;
    
    let ventasFiltradas = [...ventasGlobal];
    const ahora = new Date();
    
    if (filtro === 'hoy') {
        ventasFiltradas = ventasGlobal.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta.toDateString() === ahora.toDateString();
        });
    } else if (filtro === 'ayer') {
        const ayer = new Date(ahora);
        ayer.setDate(ayer.getDate() - 1);
        ventasFiltradas = ventasGlobal.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta.toDateString() === ayer.toDateString();
        });
    } else if (filtro === 'semana') {
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - 7);
        ventasFiltradas = ventasGlobal.filter(v => new Date(v.fecha) >= inicioSemana);
    } else if (filtro === 'mes') {
        const inicioMes = new Date(ahora);
        inicioMes.setDate(ahora.getDate() - 30);
        ventasFiltradas = ventasGlobal.filter(v => new Date(v.fecha) >= inicioMes);
    } else if (filtro === 'personalizado' && fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        ventasFiltradas = ventasGlobal.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta >= inicio && fechaVenta <= fin;
        });
    }
    
    renderizarTablaVentas(ventasFiltradas);
    calcularEstadisticasVentas(ventasFiltradas);
}

// Calcular estadísticas de ventas
function calcularEstadisticasVentas(ventas) {
    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);
    
    // COMISIÓN MERCADO PAGO: 4.99% + $150 por transacción
    const comisionPorcentaje = 0.0499; // 4.99%
    const comisionFija = 150; // $150 por transacción
    
    const totalComisiones = ventas.reduce((sum, v) => {
        const comision = (v.total * comisionPorcentaje) + comisionFija;
        return sum + comision;
    }, 0);
    
    const ingresosNetos = totalIngresos - totalComisiones;
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;
    const promedioNeto = totalVentas > 0 ? ingresosNetos / totalVentas : 0;
    
    // Productos más vendidos
    const productosVendidos = {};
    ventas.forEach(venta => {
        venta.productos.forEach(prod => {
            const key = `${prod.nombre}-${prod.color || ''}-${prod.capacidad || ''}`;
            if (!productosVendidos[key]) {
                productosVendidos[key] = {
                    nombre: prod.nombre,
                    color: prod.color,
                    capacidad: prod.capacidad,
                    cantidad: 0,
                    ingresos: 0
                };
            }
            productosVendidos[key].cantidad += prod.cantidad;
            productosVendidos[key].ingresos += prod.cantidad * prod.precio;
        });
    });
    
    // Actualizar cards si existen
    const totalVentasCard = document.getElementById('totalVentasCard');
    const totalIngresosCard = document.getElementById('totalIngresosCard');
    const promedioVentaCard = document.getElementById('promedioVentaCard');
    
    if (totalVentasCard) totalVentasCard.textContent = totalVentas;
    
    // Mostrar ingresos con comisión deducida
    if (totalIngresosCard) {
        totalIngresosCard.innerHTML = `
            <div>$${ingresosNetos.toLocaleString('es-CL')}</div>
            <small style="font-size: 0.75rem; opacity: 0.8; font-weight: 400;">
                Bruto: $${totalIngresos.toLocaleString('es-CL')}<br>
                Comisión MP: -$${Math.round(totalComisiones).toLocaleString('es-CL')}
            </small>
        `;
    }
    
    if (promedioVentaCard) {
        promedioVentaCard.innerHTML = `
            <div>$${Math.round(promedioNeto).toLocaleString('es-CL')}</div>
            <small style="font-size: 0.75rem; opacity: 0.8; font-weight: 400;">
                Por venta (neto)
            </small>
        `;
    }
    
    // Top 5 productos
    const topProductos = Object.values(productosVendidos)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);
    
    const topProductosEl = document.getElementById('topProductos');
    if (topProductosEl) {
        topProductosEl.innerHTML = topProductos.map((p, i) => {
            const variantes = [p.color, p.capacidad].filter(Boolean).join(' | ');
            return `
                <div style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${i + 1}. ${p.nombre}</strong>
                        ${variantes ? `<br><small style="color: #0066cc;">${variantes}</small>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <strong style="color: #00a651;">${p.cantidad} vendidos</strong>
                        <br><small>$${p.ingresos.toLocaleString('es-CL')}</small>
                    </div>
                </div>
            `;
        }).join('') || '<p style="text-align: center; color: #999;">No hay datos</p>';
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
    
    // Ordenar por fecha más reciente
    ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    tbody.innerHTML = ventas.map(venta => {
        const fecha = new Date(venta.fecha).toLocaleString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Generar HTML de productos con VARIANTES (color y capacidad)
        const productosHTML = venta.productos.map(prod => {
            const variantes = [];
            if (prod.color) variantes.push(`<span style="color: #0066cc;">🎨 ${prod.color}</span>`);
            if (prod.capacidad) variantes.push(`<span style="color: #0066cc;">💾 ${prod.capacidad}</span>`);
            
            const variantesTexto = variantes.length > 0 
                ? `<br><small style="font-weight: 500;">${variantes.join(' | ')}</small>` 
                : '';
            
            return `
                <div style="margin-bottom: 0.5rem; padding: 0.6rem; background: #f8f9fa; border-left: 3px solid #0066cc; border-radius: 4px;">
                    <strong style="color: #1a1f2e;">${prod.nombre}</strong> 
                    ${variantesTexto}
                    <br>
                    <small style="color: #666;">
                        📦 Cantidad: ${prod.cantidad} × $${prod.precio.toLocaleString('es-CL')} = 
                        <strong style="color: #00a651;">$${(prod.cantidad * prod.precio).toLocaleString('es-CL')}</strong>
                    </small>
                </div>
            `;
        }).join('');
        
        return `
            <tr style="border-bottom: 2px solid #e0e0e0;">
                <td style="vertical-align: top;"><strong>#${venta.id.substring(0, 8)}</strong></td>
                <td style="vertical-align: top;">
                    <strong style="color: #1a1f2e;">${venta.cliente.nombre}</strong><br>
                    <small style="color: #666; line-height: 1.6;">
                        📧 ${venta.cliente.email}<br>
                        📱 ${venta.cliente.telefono}<br>
                        📍 ${venta.cliente.direccion || 'N/A'}
                    </small>
                </td>
                <td style="max-width: 400px; vertical-align: top;">
                    ${productosHTML}
                </td>
                <td style="vertical-align: top;"><strong style="color: #00a651; font-size: 1.1rem;">$${venta.total.toLocaleString('es-CL')}</strong></td>
                <td style="vertical-align: top;"><small>${fecha}</small></td>
                <td style="vertical-align: top;">
                    <span style="padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.813rem; font-weight: 600; background: #d4edda; color: #155724;">${venta.estado || 'COMPLETADA'}</span>
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

// ========== REPORTES SEMANALES Y MENSUALES ==========

async function cargarReportes() {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        if (!response.ok) throw new Error('Error al cargar ventas');
        
        const ventas = await response.json();
        generarReporteSemanal(ventas);
        generarReporteMensual(ventas);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function generarReporteSemanal(ventas) {
    const ahora = new Date();
    const hace7Dias = new Date(ahora);
    hace7Dias.setDate(ahora.getDate() - 7);
    
    const ventasSemana = ventas.filter(v => new Date(v.fecha) >= hace7Dias);
    
    const totalVentas = ventasSemana.length;
    const totalIngresos = ventasSemana.reduce((sum, v) => sum + v.total, 0);
    
    // COMISIÓN MERCADO PAGO
    const comisionPorcentaje = 0.0499;
    const comisionFija = 150;
    const totalComisiones = ventasSemana.reduce((sum, v) => {
        return sum + (v.total * comisionPorcentaje) + comisionFija;
    }, 0);
    
    const ingresosNetos = totalIngresos - totalComisiones;
    const promedioVenta = totalVentas > 0 ? ingresosNetos / totalVentas : 0;
    
    const el1 = document.getElementById('ventasSemanales');
    const el2 = document.getElementById('ingresosSemanales');
    const el3 = document.getElementById('promedioSemanal');
    
    if (el1) el1.textContent = totalVentas;
    if (el2) el2.innerHTML = `
        <div>$${Math.round(ingresosNetos).toLocaleString('es-CL')}</div>
        <small style="font-size: 0.75rem; opacity: 0.8; font-weight: 400; display: block; margin-top: 0.25rem;">
            Neto (descontada comisión MP)
        </small>
    `;
    if (el3) el3.textContent = `$${Math.round(promedioVenta).toLocaleString('es-CL')}`;
}

function generarReporteMensual(ventas) {
    const ahora = new Date();
    const hace30Dias = new Date(ahora);
    hace30Dias.setDate(ahora.getDate() - 30);
    
    const ventasMes = ventas.filter(v => new Date(v.fecha) >= hace30Dias);
    
    const totalVentas = ventasMes.length;
    const totalIngresos = ventasMes.reduce((sum, v) => sum + v.total, 0);
    
    // COMISIÓN MERCADO PAGO
    const comisionPorcentaje = 0.0499;
    const comisionFija = 150;
    const totalComisiones = ventasMes.reduce((sum, v) => {
        return sum + (v.total * comisionPorcentaje) + comisionFija;
    }, 0);
    
    const ingresosNetos = totalIngresos - totalComisiones;
    const promedioVenta = totalVentas > 0 ? ingresosNetos / totalVentas : 0;
    
    const el1 = document.getElementById('ventasMensuales');
    const el2 = document.getElementById('ingresosMensuales');
    const el3 = document.getElementById('promedioMensual');
    
    if (el1) el1.textContent = totalVentas;
    if (el2) el2.innerHTML = `
        <div>$${Math.round(ingresosNetos).toLocaleString('es-CL')}</div>
        <small style="font-size: 0.75rem; opacity: 0.8; font-weight: 400; display: block; margin-top: 0.25rem;">
            Neto (descontada comisión MP)
        </small>
    `;
    if (el3) el3.textContent = `$${Math.round(promedioVenta).toLocaleString('es-CL')}`;
}

function exportarVentasExcel() {
    const filtro = document.getElementById('filtroFecha')?.value || 'todas';
    alert(`Exportando ventas (${filtro}) a Excel... (Función en desarrollo)`);
}
