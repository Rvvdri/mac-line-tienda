// admin.js - FIX EDICIÓN DE IMÁGENES COMPLETO
const API_URL = window.location.origin + '/api';

let productosActuales = [];
let productoEditandoId = null;

// Para agregar
let imagenPortadaBase64 = null;
let imagenesAdicionales = [null, null, null, null, null];

// Para editar
let imagenPortadaEditBase64 = null;
let imagenesAdicionalesEdit = [null, null, null, null, null];
let imagenesOriginales = []; // IMPORTANTE: Guardar las originales

function obtenerIdProducto(producto) {
    return producto.id || producto._id || String(producto._id);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Admin Panel - Fix Edición Imágenes');
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

function calcularPrecioFinal() {
    const precioOriginal = parseFloat(document.getElementById('precioOriginal').value) || 0;
    const descuento = parseFloat(document.getElementById('descuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    document.getElementById('precioFinal').value = '$' + precioFinal.toLocaleString('es-CL');
}

function calcularPrecioFinalEdit() {
    const precioOriginal = parseFloat(document.getElementById('editPrecioOriginal').value) || 0;
    const descuento = parseFloat(document.getElementById('editDescuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    document.getElementById('editPrecioFinal').value = '$' + precioFinal.toLocaleString('es-CL');
}

function comprimirImagen(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const comprimido = canvas.toDataURL('image/jpeg', quality);
                console.log(`✅ Comprimida: ${(file.size / 1024).toFixed(0)}KB → ${(comprimido.length * 0.75 / 1024).toFixed(0)}KB`);
                resolve(comprimido);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function previsualizarPortada(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('previewPortada');
    
    if (!file) {
        preview.innerHTML = '<p style="color: #999;">Portada</p>';
        imagenPortadaBase64 = null;
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('❌ Imagen muy grande. Máximo 10MB.');
        event.target.value = '';
        return;
    }
    
    try {
        imagenPortadaBase64 = await comprimirImagen(file, 800, 0.8);
        preview.innerHTML = `<img src="${imagenPortadaBase64}" style="max-width: 100%; max-height: 150px; object-fit: contain;">`;
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la imagen');
    }
}

async function previsualizarImagen(event, numero) {
    const file = event.target.files[0];
    const preview = document.getElementById(`preview${numero}`);
    
    if (!file) {
        preview.innerHTML = `<p style="color: #999; font-size: 0.75rem;">Imagen ${numero}</p>`;
        imagenesAdicionales[numero - 1] = null;
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert(`❌ Imagen ${numero} muy grande.`);
        event.target.value = '';
        return;
    }
    
    try {
        imagenesAdicionales[numero - 1] = await comprimirImagen(file, 800, 0.7);
        preview.innerHTML = `<img src="${imagenesAdicionales[numero - 1]}" style="max-width: 100%; max-height: 120px; object-fit: contain;">`;
    } catch (error) {
        console.error('Error:', error);
    }
}

function limpiarFormulario() {
    document.getElementById('previewPortada').innerHTML = '<p style="color: #999;">Portada</p>';
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`preview${i}`).innerHTML = `<p style="color: #999; font-size: 0.75rem;">Imagen ${i}</p>`;
    }
    imagenPortadaBase64 = null;
    imagenesAdicionales = [null, null, null, null, null];
    document.getElementById('precioFinal').value = '';
}

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        productosActuales = await response.json();
        renderizarTablaProductos(productosActuales);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarTablaProductos(productos) {
    const tbody = document.getElementById('productosTableBody');
    if (!tbody || productos.length === 0) return;
    
    tbody.innerHTML = productos.map(p => {
        const productoId = obtenerIdProducto(p);
        const precioOriginal = p.precioOriginal || p.precio;
        const precioFinal = p.precio;
        const descuento = p.descuento || 0;
        
        return `
        <tr>
            <td><code title="${productoId}">${String(productoId).substring(0, 8)}...</code></td>
            <td>
                ${p.imagenPortada 
                    ? `<img src="${p.imagenPortada}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px;">` 
                    : `<span style="font-size: 2rem;">${p.emoji || '📦'}</span>`
                }
            </td>
            <td>${p.nombre}</td>
            <td><span class="badge badge-${p.categoria}">${p.categoria}</span></td>
            <td>$${Number(precioOriginal).toLocaleString('es-CL')}</td>
            <td><strong style="color: #00a651;">$${Number(precioFinal).toLocaleString('es-CL')}</strong></td>
            <td>${descuento > 0 ? `<span class="descuento-badge">-${descuento}%</span>` : '-'}</td>
            <td><span class="stock-badge ${p.stock === 0 ? 'agotado' : p.stock < 5 ? 'bajo' : 'disponible'}">${p.stock}</span></td>
            <td class="acciones">
                <button class="btn-accion btn-editar" onclick='abrirModalEditar(${JSON.stringify(productoId)})'>✏️</button>
                <button class="btn-accion btn-eliminar" onclick='eliminarProducto(${JSON.stringify(productoId)})'>🗑️</button>
            </td>
        </tr>
    `}).join('');
}

function filtrarProductosAdmin() {
    const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
    const filtrados = productosActuales.filter(p => {
        const id = obtenerIdProducto(p);
        return p.nombre.toLowerCase().includes(busqueda) ||
               p.categoria.toLowerCase().includes(busqueda) ||
               String(id).toLowerCase().includes(busqueda);
    });
    renderizarTablaProductos(filtrados);
}

async function agregarProducto(event) {
    event.preventDefault();
    
    if (!imagenPortadaBase64) {
        alert('❌ Debes subir una imagen de portada');
        return;
    }
    
    const precioOriginal = parseFloat(document.getElementById('precioOriginal').value);
    const descuento = parseFloat(document.getElementById('descuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    const imagenesValidas = imagenesAdicionales.filter(img => img !== null);
    
    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value,
        precioOriginal: precioOriginal,
        precio: precioFinal,
        descuento: descuento,
        stock: parseInt(document.getElementById('stock').value),
        imagenPortada: imagenPortadaBase64,
        imagenes: imagenesValidas,
        emoji: '📦'
    };
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        
        alert('✅ Producto agregado exitosamente');
        document.getElementById('formularioProducto').reset();
        limpiarFormulario();
        await cargarProductos();
        mostrarSeccion('productos');
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al agregar producto');
    }
}

// ========== EDITAR PRODUCTO - FIX COMPLETO ==========
function abrirModalEditar(productoId) {
    const producto = productosActuales.find(p => {
        const id = obtenerIdProducto(p);
        return String(id) === String(productoId);
    });
    
    if (!producto) {
        alert('❌ Producto no encontrado');
        return;
    }
    
    productoEditandoId = productoId;
    
    // Llenar formulario
    document.getElementById('editNombre').value = producto.nombre;
    document.getElementById('editCategoria').value = producto.categoria;
    document.getElementById('editDescripcion').value = producto.descripcion || '';
    document.getElementById('editPrecioOriginal').value = producto.precioOriginal || producto.precio;
    document.getElementById('editDescuento').value = producto.descuento || 0;
    document.getElementById('editStock').value = producto.stock;
    
    calcularPrecioFinalEdit();
    
    // Cargar colores si existen
    const editColoresEl = document.getElementById('editColores');
    if (editColoresEl && producto.colores && producto.colores.length > 0) {
        editColoresEl.value = producto.colores.join(', ');
    } else if (editColoresEl) {
        editColoresEl.value = '';
    }
    
    // Cargar capacidades si existen
    const editCapacidadesEl = document.getElementById('editCapacidades');
    if (editCapacidadesEl && producto.capacidades && producto.capacidades.length > 0) {
        const capacidadesStr = producto.capacidades.map(cap => 
            `${cap.nombre}:${cap.precioIncremental || 0}`
        ).join(', ');
        editCapacidadesEl.value = capacidadesStr;
    } else if (editCapacidadesEl) {
        editCapacidadesEl.value = '';
    }
    
    // Mostrar imagen portada actual
    const previewPortada = document.getElementById('editPreviewPortada');
    if (producto.imagenPortada) {
        previewPortada.innerHTML = `<img src="${producto.imagenPortada}" style="max-width: 100%; max-height: 150px; object-fit: contain;">`;
    } else {
        previewPortada.innerHTML = '<p style="color: #999;">Sin portada</p>';
    }
    
    // IMPORTANTE: Guardar las imágenes originales
    imagenesOriginales = producto.imagenes || [];
    console.log('📸 Imágenes originales:', imagenesOriginales.length);
    
    // Mostrar imágenes adicionales actuales
    for (let i = 0; i < 5; i++) {
        const preview = document.getElementById(`editPreview${i + 1}`);
        if (imagenesOriginales[i]) {
            preview.innerHTML = `<img src="${imagenesOriginales[i]}" style="max-width: 100%; max-height: 120px; object-fit: contain;">`;
        } else {
            preview.innerHTML = `<p style="color: #999; font-size: 0.75rem;">Imagen ${i + 1}</p>`;
        }
    }
    
    // Resetear las editadas
    imagenPortadaEditBase64 = null;
    imagenesAdicionalesEdit = [null, null, null, null, null];
    
    document.getElementById('editarModal').style.display = 'flex';
}

async function previsualizarPortadaEdit(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('editPreviewPortada');
    
    if (!file) return;
    
    try {
        imagenPortadaEditBase64 = await comprimirImagen(file, 800, 0.8);
        preview.innerHTML = `<img src="${imagenPortadaEditBase64}" style="max-width: 100%; max-height: 150px; object-fit: contain;">`;
        console.log('✅ Nueva portada cargada');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function previsualizarImagenEdit(event, numero) {
    const file = event.target.files[0];
    const preview = document.getElementById(`editPreview${numero}`);
    
    if (!file) return;
    
    try {
        imagenesAdicionalesEdit[numero - 1] = await comprimirImagen(file, 800, 0.7);
        preview.innerHTML = `<img src="${imagenesAdicionalesEdit[numero - 1]}" style="max-width: 100%; max-height: 120px; object-fit: contain;">`;
        console.log(`✅ Nueva imagen ${numero} cargada`);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function guardarEdicion(event) {
    event.preventDefault();
    
    if (!productoEditandoId) {
        alert('❌ Error');
        return;
    }
    
    const precioOriginal = parseFloat(document.getElementById('editPrecioOriginal').value);
    const descuento = parseFloat(document.getElementById('editDescuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    
    const datosActualizados = {
        nombre: document.getElementById('editNombre').value,
        categoria: document.getElementById('editCategoria').value,
        descripcion: document.getElementById('editDescripcion').value,
        precioOriginal: precioOriginal,
        precio: precioFinal,
        descuento: descuento,
        stock: parseInt(document.getElementById('editStock').value)
    };
    
    // Parsear colores (opcional)
    const coloresInput = document.getElementById('editColores')?.value || '';
    if (coloresInput.trim()) {
        const colores = coloresInput.split(',').map(c => c.trim()).filter(c => c);
        if (colores.length > 0) {
            datosActualizados.colores = colores;
        }
    }
    
    // Parsear capacidades (opcional)
    const capacidadesInput = document.getElementById('editCapacidades')?.value || '';
    if (capacidadesInput.trim()) {
        const capacidades = capacidadesInput.split(',').map(cap => {
            const [nombre, precio] = cap.trim().split(':');
            if (nombre && nombre.trim()) {
                return {
                    nombre: nombre.trim(),
                    precioIncremental: parseInt(precio?.trim()) || 0
                };
            }
            return null;
        }).filter(c => c !== null);
        
        if (capacidades.length > 0) {
            datosActualizados.capacidades = capacidades;
        }
    }
    
    // PORTADA: Si hay nueva, usarla; si no, mantener la original
    if (imagenPortadaEditBase64) {
        datosActualizados.imagenPortada = imagenPortadaEditBase64;
        console.log('📸 Actualizando portada');
    }
    
    // IMÁGENES ADICIONALES: Combinar originales con nuevas
    const imagenesFinales = [];
    for (let i = 0; i < 5; i++) {
        if (imagenesAdicionalesEdit[i]) {
            // Si hay nueva imagen para esta posición, usarla
            imagenesFinales.push(imagenesAdicionalesEdit[i]);
            console.log(`📸 Imagen ${i + 1}: NUEVA`);
        } else if (imagenesOriginales[i]) {
            // Si no hay nueva, mantener la original
            imagenesFinales.push(imagenesOriginales[i]);
            console.log(`📸 Imagen ${i + 1}: Original mantenida`);
        }
        // Si no hay ni nueva ni original, no agregar nada
    }
    
    datosActualizados.imagenes = imagenesFinales;
    console.log('📸 Total imágenes finales:', imagenesFinales.length);
    
    try {
        const response = await fetch(`${API_URL}/productos/${productoEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error('Error al actualizar');
        }
        
        const resultado = await response.json();
        console.log('✅ Producto actualizado:', resultado);
        
        alert('✅ Producto actualizado exitosamente');
        cerrarModal();
        await cargarProductos();
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al actualizar: ' + error.message);
    }
}

function cerrarModal() {
    document.getElementById('editarModal').style.display = 'none';
    productoEditandoId = null;
    imagenPortadaEditBase64 = null;
    imagenesAdicionalesEdit = [null, null, null, null, null];
    imagenesOriginales = [];
}

async function eliminarProducto(productoId) {
    const producto = productosActuales.find(p => {
        const id = obtenerIdProducto(p);
        return String(id) === String(productoId);
    });
    
    if (!producto || !confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${productoId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error');
        alert('✅ Producto eliminado');
        await cargarProductos();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar');
    }
}

async function cargarVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        const ventas = await response.json();
        const tbody = document.getElementById('ventasTableBody');

        if (!tbody) return;

        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#999;">No hay ventas registradas aún.</td></tr>';
            return;
        }

        tbody.innerHTML = ventas.reverse().map(v => {
            const c = v.cliente || v;
            const nombre = c.nombre || 'Sin nombre';
            const email = c.email || '—';
            const comuna = c.comuna || '—';
            const region = c.region || '—';
            const idVenta = v._id || v.id;
            const items = v.items || v.productos || [];
            const totalItems = items.length;

            // Color badge según estado
            const estadoColors = {
                'pagado': { bg: '#dcfce7', color: '#16a34a' },
                'pendiente': { bg: '#fef9c3', color: '#92400e' },
                'cancelado': { bg: '#fee2e2', color: '#dc2626' }
            };
            const estadoKey = (v.estado || 'pendiente').toLowerCase();
            const estadoStyle = estadoColors[estadoKey] || { bg: '#e3f2fd', color: '#0071e3' };

            return `
            <tr>
                <td style="font-size:0.85rem;">
                    ${v.fecha ? new Date(v.fecha).toLocaleDateString('es-CL') : 'S/F'}<br>
                    <small style="color:#999;">${v.fecha ? new Date(v.fecha).toLocaleTimeString('es-CL', {hour:'2-digit', minute:'2-digit'}) : ''}</small>
                </td>
                <td>
                    <strong>${nombre}</strong><br>
                    <small style="color:#86868b;">${email}</small>
                </td>
                <td style="font-size:0.85rem;">${comuna}<br><small style="color:#999;">${region}</small></td>
                <td><strong style="color:#16a34a;">$${Number(v.total || 0).toLocaleString('es-CL')}</strong></td>
                <td>
                    <span style="background:${estadoStyle.bg}; color:${estadoStyle.color}; padding:4px 10px; border-radius:20px; font-size:0.7rem; font-weight:700;">
                        ${(v.estado || 'PENDIENTE').toUpperCase()}
                    </span>
                </td>
                <td>
                    <button onclick="verDetalleVenta('${idVenta}')" style="background:linear-gradient(135deg,#667eea,#764ba2); color:white; border:none; padding:6px 14px; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.85rem;">
                        Ver detalle
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Error cargando ventas:", error);
    }
}

async function verDetalleVenta(id) {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        const ventas = await response.json();
        const v = ventas.find(venta => (venta._id === id || venta.id === id));
        if (!v) return;

        const cuerpoModal = document.getElementById('modalVentaCuerpo');
        const c = v.cliente || v;
        const items = v.items || v.productos || [];

        // Método de entrega — es objeto { tipo, nombre, precio }
        const metodo = v.metodoEntrega || c.metodoEntrega;
        let metodoNombre = '—';
        let metodoIcono = '🚚';
        if (metodo) {
            if (typeof metodo === 'object') {
                const tipo = metodo.tipo || '';
                metodoIcono = tipo === 'flash' ? '⚡' : tipo === 'gratis' ? '🎉' : '🚚';
                metodoNombre = metodo.nombre || tipo || '—';
            } else {
                metodoIcono = metodo === 'flash' ? '⚡' : metodo === 'gratis' ? '🎉' : '🚚';
                metodoNombre = metodo === 'flash' ? 'Envío Flash (24-48h)' :
                               metodo === 'normal' ? 'Envío Normal (3-5 días)' :
                               metodo === 'gratis' ? 'Envío Gratis' : metodo;
            }
        }

        // Estado
        const estadoMap = {
            'pagado':    { bg: '#dcfce7', color: '#14532d', label: '✅ PAGADO' },
            'pendiente': { bg: '#fef3c7', color: '#78350f', label: '⏳ PENDIENTE' },
            'cancelado': { bg: '#fee2e2', color: '#7f1d1d', label: '❌ CANCELADO' }
        };
        const estadoKey = (v.estado || 'pendiente').toLowerCase();
        const estadoStyle = estadoMap[estadoKey] || estadoMap['pendiente'];

        // Nota sobre estado
        const notaEstado = estadoKey === 'pagado'
            ? '<p style="margin:8px 0 0; font-size:12px; color:#15803d;">✔ Pago confirmado por Mercado Pago</p>'
            : estadoKey === 'pendiente'
            ? '<p style="margin:8px 0 0; font-size:12px; color:#92400e;">⚠ El cliente inició el pago pero aún no se confirmó</p>'
            : '<p style="margin:8px 0 0; font-size:12px; color:#991b1b;">✘ Pago cancelado o rechazado</p>';

        // Productos
        const productosHtml = items.length > 0 ? items.map(p => {
            // color y capacidad pueden venir directo o dentro de variantes seleccionadas
            const colorTexto = p.color || p.colorSeleccionado || '';
            const capacidadTexto = p.capacidad || p.capacidadSeleccionada || '';
            const variantes = [colorTexto, capacidadTexto].filter(Boolean).join(' · ');
            return `
            <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:12px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                <div>
                    <strong style="color:#111827; font-size:14px;">${p.nombre || 'Producto'}</strong>
                    ${variantes
                        ? `<br><span style="background:#ede9fe; color:#5b21b6; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px; margin-top:5px; display:inline-block;">${variantes}</span>`
                        : `<br><span style="color:#9ca3af; font-size:11px;">Sin color/capacidad registrado</span>`}
                </div>
                <div style="text-align:right; white-space:nowrap; flex-shrink:0;">
                    <span style="font-size:12px; color:#6b7280; display:block;">x${p.cantidad || 1}</span>
                    <strong style="color:#15803d; font-size:14px;">$${(Number(p.precio || 0) * Number(p.cantidad || 1)).toLocaleString('es-CL')}</strong>
                </div>
            </div>`;
        }).join('') : '<p style="color:#9ca3af; font-size:13px;">Sin productos registrados</p>';

        // Campos de dirección
        const region    = c.region     || '—';
        const comuna    = c.comuna     || '—';
        const calle     = c.direccion  || '—';
        const numero    = c.numero     || '—';
        const complemento = c.complemento || '';

        cuerpoModal.style.background = '#ffffff';
        cuerpoModal.style.color = '#111827';

        cuerpoModal.innerHTML = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#111827 !important; font-size:14px; background:#ffffff;">

            <!-- Estado -->
            <div style="background:${estadoStyle.bg}; border-radius:10px; padding:12px 16px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <span style="color:${estadoStyle.color}; font-weight:800; font-size:14px;">${estadoStyle.label}</span>
                    <small style="color:#6b7280;">${v.fecha ? new Date(v.fecha).toLocaleString('es-CL') : ''}</small>
                </div>
                ${notaEstado}
            </div>

            <!-- Cliente -->
            <div style="background:#fffbeb; border:1px solid #fcd34d; border-radius:10px; padding:14px 16px; margin-bottom:12px;">
                <p style="margin:0 0 10px; font-weight:800; color:#92400e; font-size:11px; text-transform:uppercase; letter-spacing:1px;">👤 Datos del Cliente</p>
                <table style="width:100%; border-collapse:collapse; font-size:13px; color:#1f2937;">
                    <tr><td style="padding:3px 0; color:#6b7280; width:110px;">Nombre</td><td style="padding:3px 0; font-weight:600;">${c.nombre || '—'}</td></tr>
                    <tr><td style="padding:3px 0; color:#6b7280;">Email</td><td style="padding:3px 0; font-weight:600;">${c.email || '—'}</td></tr>
                    <tr><td style="padding:3px 0; color:#6b7280;">Teléfono</td><td style="padding:3px 0; font-weight:600;">${c.telefono || '—'}</td></tr>
                </table>
            </div>

            <!-- Dirección -->
            <div style="background:#eff6ff; border:1px solid #93c5fd; border-radius:10px; padding:14px 16px; margin-bottom:12px;">
                <p style="margin:0 0 10px; font-weight:800; color:#1e40af; font-size:11px; text-transform:uppercase; letter-spacing:1px;">📦 Dirección de Envío</p>
                <table style="width:100%; border-collapse:collapse; font-size:13px; color:#1f2937;">
                    <tr><td style="padding:3px 0; color:#6b7280; width:110px;">Región</td><td style="padding:3px 0; font-weight:600;">${region}</td></tr>
                    <tr><td style="padding:3px 0; color:#6b7280;">Comuna</td><td style="padding:3px 0; font-weight:600;">${comuna}</td></tr>
                    <tr><td style="padding:3px 0; color:#6b7280;">Calle / Av.</td><td style="padding:3px 0; font-weight:600;">${calle}</td></tr>
                    <tr><td style="padding:3px 0; color:#6b7280;">Número</td><td style="padding:3px 0; font-weight:600;">${numero}</td></tr>
                    ${complemento ? `<tr><td style="padding:3px 0; color:#6b7280;">Depto/Casa/Of.</td><td style="padding:3px 0; font-weight:600;">${complemento}</td></tr>` : ''}
                    <tr><td style="padding:3px 0; color:#6b7280; vertical-align:top;">Entrega</td>
                        <td style="padding:3px 0;">
                            <span style="background:#ede9fe; color:#5b21b6; font-weight:700; font-size:12px; padding:3px 10px; border-radius:20px;">
                                ${metodoIcono} ${metodoNombre}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Productos -->
            <p style="font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#374151; margin:0 0 8px;">🛒 Productos</p>
            ${productosHtml}

            <!-- Totales -->
            <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:14px 16px; margin-top:12px;">
                ${v.subtotal !== undefined ? `
                <div style="display:flex; justify-content:space-between; color:#6b7280; font-size:13px; margin-bottom:5px;">
                    <span>Subtotal</span><span>$${Number(v.subtotal).toLocaleString('es-CL')}</span>
                </div>` : ''}
                ${v.costoEnvio !== undefined ? `
                <div style="display:flex; justify-content:space-between; color:#6b7280; font-size:13px; margin-bottom:8px;">
                    <span>Envío</span>
                    <span>${v.costoEnvio === 0 ? '<span style="color:#15803d; font-weight:600;">Gratis 🎉</span>' : '$' + Number(v.costoEnvio).toLocaleString('es-CL')}</span>
                </div>` : ''}
                <div style="display:flex; justify-content:space-between; border-top:2px solid #e5e7eb; padding-top:10px;">
                    <span style="font-weight:800; font-size:15px; color:#111827;">Total</span>
                    <span style="font-weight:800; font-size:18px; color:#15803d;">$${Number(v.total || 0).toLocaleString('es-CL')}</span>
                </div>
            </div>

            <!-- Cambiar Estado -->
            <div style="margin-top:16px;">
                <p style="font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#374151; margin:0 0 8px;">🔄 Cambiar Estado</p>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button onclick="cambiarEstadoVenta('${v._id || v.id}', 'pendiente')"
                        style="flex:1; padding:9px 12px; border:2px solid #f59e0b; background:${estadoKey==='pendiente'?'#fef3c7':'white'}; color:#92400e; border-radius:8px; cursor:pointer; font-weight:700; font-size:12px; min-width:90px;">
                        ⏳ Pendiente
                    </button>
                    <button onclick="cambiarEstadoVenta('${v._id || v.id}', 'pagado')"
                        style="flex:1; padding:9px 12px; border:2px solid #22c55e; background:${estadoKey==='pagado'?'#dcfce7':'white'}; color:#15803d; border-radius:8px; cursor:pointer; font-weight:700; font-size:12px; min-width:90px;">
                        ✅ Pagado
                    </button>
                    <button onclick="cambiarEstadoVenta('${v._id || v.id}', 'cancelado')"
                        style="flex:1; padding:9px 12px; border:2px solid #ef4444; background:${estadoKey==='cancelado'?'#fee2e2':'white'}; color:#dc2626; border-radius:8px; cursor:pointer; font-weight:700; font-size:12px; min-width:90px;">
                        ❌ Cancelado
                    </button>
                </div>
            </div>

            <p style="text-align:center; color:#d1d5db; font-size:11px; margin:14px 0 0;">ID: ${v._id || v.id || '—'}</p>
        </div>`;

        document.getElementById('modalVenta').style.display = 'flex';
    } catch (error) {
        console.error("Error visualizando detalle:", error);
    }
}

// 3. CERRAR MODAL
function cerrarModalVenta() {
    document.getElementById('modalVenta').style.display = 'none';
}

// 4. CAMBIAR ESTADO DE VENTA
async function cambiarEstadoVenta(id, nuevoEstado) {
    try {
        const response = await fetch(`${API_URL}/ventas/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!response.ok) throw new Error('Error al actualizar estado');

        // Actualizar el badge de estado en el modal sin cerrarlo
        await verDetalleVenta(id);

        // Recargar tabla de ventas en el fondo
        cargarVentas();

    } catch (error) {
        console.error('Error cambiando estado:', error);
        alert('Error al cambiar el estado. Intenta de nuevo.');
    }
}

function renderizarTablaVentas(ventas) {
    const tbody = document.getElementById('ventasTableBody');
    if (!tbody || ventas.length === 0) return;
    
    tbody.innerHTML = ventas.map(v => `
        <tr>
            <td>#${String(v.id).substring(0, 8)}</td>
            <td>${v.cliente.nombre}</td>
            <td>${(v.productos || v.items || []).length} producto(s)</td>
            <td><strong>$${Number(v.total).toLocaleString('es-CL')}</strong></td>
            <td><small>${new Date(v.fecha).toLocaleString('es-CL')}</small></td>
            <td><span style="padding: 0.35rem 0.75rem; border-radius: 20px; background: #d4edda; color: #155724;">COMPLETADA</span></td>
        </tr>
    `).join('');
}

async function cargarReporteStock() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) return;
        const productos = await response.json();
        
        document.getElementById('totalProductos').textContent = productos.length;
        document.getElementById('stockTotal').textContent = productos.reduce((sum, p) => sum + p.stock, 0);
        document.getElementById('productosAgotados').textContent = productos.filter(p => p.stock === 0).length;
        document.getElementById('stockBajo').textContent = productos.filter(p => p.stock > 0 && p.stock < 5).length;
        
        const tbody = document.getElementById('stockBajoTableBody');
        if (tbody) {
            const productosBajo = productos.filter(p => p.stock < 5);
            
            tbody.innerHTML = productosBajo.length === 0 
                ? `<tr><td colspan="4" style="text-align: center; padding: 2rem;">✅ Stock suficiente</td></tr>`
                : productosBajo.map(p => `
                    <tr>
                        <td>${p.nombre}</td>
                        <td>${p.categoria}</td>
                        <td><strong>${p.stock}</strong></td>
                        <td><span class="stock-badge ${p.stock === 0 ? 'agotado' : 'bajo'}">${p.stock === 0 ? 'Agotado' : 'Stock Bajo'}</span></td>
                    </tr>
                `).join('');
        }
    } catch (error) {}
}
