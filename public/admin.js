// admin.js - FIX EDICIÓN DE IMÁGENES COMPLETO + WEBP
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
    console.log('🚀 Admin Panel - WebP Automático');
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

// FUNCIÓN DE CONVERSIÓN A WEBP
function comprimirImagen(file, maxWidth = 1200, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxWidth) {
                    if (width > height) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    } else {
                        width = (width * maxWidth) / height;
                        height = maxWidth;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a WebP
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Error al convertir a WebP'));
                        return;
                    }
                    const reader2 = new FileReader();
                    reader2.onload = function() {
                        const ahorro = (((file.size - blob.size) / file.size) * 100).toFixed(1);
                        console.log(`✅ WebP: ${(file.size/1024).toFixed(0)}KB → ${(blob.size/1024).toFixed(0)}KB (${ahorro}% ahorro)`);
                        resolve(reader2.result);
                    };
                    reader2.readAsDataURL(blob);
                }, 'image/webp', quality);
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
    
    preview.innerHTML = '<p style="color: #00d4ff;">⏳ Convirtiendo a WebP...</p>';
    
    try {
        imagenPortadaBase64 = await comprimirImagen(file, 1200, 0.85);
        preview.innerHTML = `<img src="${imagenPortadaBase64}" style="max-width: 100%; max-height: 150px; object-fit: contain;">`;
    } catch (error) {
        console.error('Error:', error);
        preview.innerHTML = '<p style="color: #c00;">Error</p>';
        imagenPortadaBase64 = null;
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
    
    preview.innerHTML = '<p style="color: #00d4ff; font-size: 0.75rem;">⏳ Convirtiendo...</p>';
    
    try {
        imagenesAdicionales[numero - 1] = await comprimirImagen(file, 1200, 0.85);
        preview.innerHTML = `<img src="${imagenesAdicionales[numero - 1]}" style="max-width: 100%; max-height: 120px; object-fit: contain;">`;
    } catch (error) {
        console.error('Error:', error);
        preview.innerHTML = '<p style="color: #c00; font-size: 0.75rem;">Error</p>';
    }
}

function limpiarFormulario() {
    document.getElementById('previewPortada').innerHTML = '<p style="color: #00d4ff;">Click en "Examinar" para subir portada</p>';
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`preview${i}`).innerHTML = `<p style="color: #999; font-size: 0.75rem;">Sin imagen</p>`;
        document.getElementById(`imagen${i}`).value = '';
    }
    imagenPortadaBase64 = null;
    imagenesAdicionales = [null, null, null, null, null];
}

function quitarImagen(numero) {
    imagenesAdicionales[numero - 1] = null;
    document.getElementById(`preview${numero}`).innerHTML = `<p style="color: #999; font-size: 0.75rem;">Sin imagen</p>`;
    document.getElementById(`imagen${numero}`).value = '';
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
    }
}

function renderizarTablaProductos(productos) {
    const tbody = document.getElementById('productosTableBody');
    if (!tbody) {
        console.error('❌ No se encontró productosTableBody');
        return;
    }
    
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
                    ${p.imagenPortada 
                        ? `<img src="${p.imagenPortada}" style="width: 50px; height: 50px; object-fit: contain;">` 
                        : '📦'}
                </td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.categoria}</td>
                <td>$${precioOriginal.toLocaleString('es-CL')}</td>
                <td>${descuento}%</td>
                <td><strong>$${precio.toLocaleString('es-CL')}</strong></td>
                <td>${p.stock}</td>
                <td>
                    <button onclick="abrirModalEditar('${id}')" class="btn-accion btn-editar">✏️ Editar</button>
                    <button onclick="eliminarProducto('${id}')" class="btn-accion btn-eliminar">🗑️ Eliminar</button>
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
    
    const precioOriginal = parseFloat(document.getElementById('precioOriginal').value);
    const descuento = parseFloat(document.getElementById('descuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    
    const imagenesFinales = imagenesAdicionales.filter(img => img !== null);
    
    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        categoria: document.getElementById('categoria').value,
        descripcion: document.getElementById('descripcion').value,
        precioOriginal: precioOriginal,
        descuento: descuento,
        precio: precioFinal,
        stock: parseInt(document.getElementById('stock').value),
        imagenPortada: imagenPortadaBase64,
        imagenes: imagenesFinales,
        emoji: '📦'
    };
    
    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoProducto)
        });
        
        if (!response.ok) throw new Error('Error al agregar');
        
        alert('✅ Producto agregado exitosamente (imágenes en WebP)');
        document.querySelector('.form-producto').reset();
        limpiarFormulario();
        await cargarProductos();
        mostrarSeccion('productos');
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al agregar producto');
    }
}

// EDITAR PRODUCTO CON IMÁGENES
async function previsualizarPortadaEdit(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('editPreviewPortada');
    
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        alert('❌ Imagen muy grande.');
        event.target.value = '';
        return;
    }
    
    preview.innerHTML = '<p style="color: #00d4ff;">⏳ Convirtiendo...</p>';
    
    try {
        imagenPortadaEditBase64 = await comprimirImagen(file, 1200, 0.85);
        preview.innerHTML = `<img src="${imagenPortadaEditBase64}" style="max-width: 100%; max-height: 150px; object-fit: contain;">`;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function previsualizarImagenEdit(event, numero) {
    const file = event.target.files[0];
    const preview = document.getElementById(`editPreview${numero}`);
    
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        alert(`❌ Imagen ${numero} muy grande.`);
        event.target.value = '';
        return;
    }
    
    preview.innerHTML = '<p style="color: #00d4ff; font-size: 0.75rem;">⏳ Convirtiendo...</p>';
    
    try {
        imagenesAdicionalesEdit[numero - 1] = await comprimirImagen(file, 1200, 0.85);
        preview.innerHTML = `<img src="${imagenesAdicionalesEdit[numero - 1]}" style="max-width: 100%; max-height: 120px; object-fit: contain;">`;
    } catch (error) {
        console.error('Error:', error);
    }
}

function quitarImagenEdit(numero) {
    imagenesAdicionalesEdit[numero - 1] = null;
    document.getElementById(`editPreview${numero}`).innerHTML = `<p style="color: #999; font-size: 0.75rem;">Imagen ${numero}</p>`;
    document.getElementById(`editImagen${numero}`).value = '';
}

function abrirModalEditar(id) {
    const producto = productosActuales.find(p => obtenerIdProducto(p) === id);
    if (!producto) return;
    
    productoEditandoId = id;
    imagenesOriginales = producto.imagenes || [];
    
    document.getElementById('editNombre').value = producto.nombre;
    document.getElementById('editCategoria').value = producto.categoria;
    document.getElementById('editDescripcion').value = producto.descripcion || '';
    document.getElementById('editPrecioOriginal').value = producto.precioOriginal || producto.precio;
    document.getElementById('editDescuento').value = producto.descuento || 0;
    document.getElementById('editStock').value = producto.stock;
    
    calcularPrecioFinalEdit();
    
    // Mostrar portada actual
    imagenPortadaEditBase64 = producto.imagenPortada;
    const previewPortada = document.getElementById('editPreviewPortada');
    if (producto.imagenPortada) {
        previewPortada.innerHTML = `<img src="${producto.imagenPortada}" style="max-width: 100%; max-height: 150px; object-fit: contain;">`;
    } else {
        previewPortada.innerHTML = '<p style="color: #999;">Portada</p>';
    }
    
    // Mostrar imágenes adicionales
    imagenesAdicionalesEdit = [...imagenesOriginales];
    while (imagenesAdicionalesEdit.length < 5) {
        imagenesAdicionalesEdit.push(null);
    }
    
    for (let i = 1; i <= 5; i++) {
        const preview = document.getElementById(`editPreview${i}`);
        if (imagenesAdicionalesEdit[i-1]) {
            preview.innerHTML = `<img src="${imagenesAdicionalesEdit[i-1]}" style="max-width: 100%; max-height: 120px; object-fit: contain;">`;
        } else {
            preview.innerHTML = `<p style="color: #999; font-size: 0.75rem;">Imagen ${i}</p>`;
        }
    }
    
    document.getElementById('editarModal').style.display = 'flex';
}

function cerrarModalEditar() {
    document.getElementById('editarModal').style.display = 'none';
    productoEditandoId = null;
    imagenPortadaEditBase64 = null;
    imagenesAdicionalesEdit = [null, null, null, null, null];
    imagenesOriginales = [];
}

async function guardarCambios(event) {
    event.preventDefault();
    
    const precioOriginal = parseFloat(document.getElementById('editPrecioOriginal').value);
    const descuento = parseFloat(document.getElementById('editDescuento').value) || 0;
    const precioFinal = Math.round(precioOriginal * (1 - descuento / 100));
    
    const imagenesFinales = imagenesAdicionalesEdit.filter(img => img !== null);
    
    const productoActualizado = {
        nombre: document.getElementById('editNombre').value,
        categoria: document.getElementById('editCategoria').value,
        descripcion: document.getElementById('editDescripcion').value,
        precioOriginal: precioOriginal,
        descuento: descuento,
        precio: precioFinal,
        stock: parseInt(document.getElementById('editStock').value),
        imagenPortada: imagenPortadaEditBase64,
        imagenes: imagenesFinales
    };
    
    try {
        const response = await fetch(`${API_URL}/productos/${productoEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoActualizado)
        });
        
        if (!response.ok) throw new Error('Error al actualizar');
        
        alert('✅ Producto actualizado');
        cerrarModalEditar();
        await cargarProductos();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al actualizar producto');
    }
}

async function eliminarProducto(id) {
    const producto = productosActuales.find(p => obtenerIdProducto(p) === id);
    if (!producto || !confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar');
        
        alert('✅ Producto eliminado');
        await cargarProductos();
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al eliminar producto');
    }
}

// VENTAS MINIMALISTAS
async function cargarVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        if (!response.ok) return;
        const ventas = await response.json();
        renderizarTablaVentas(ventas);
    } catch (error) {}
}

function renderizarTablaVentas(ventas) {
    const tbody = document.getElementById('ventasTableBody');
    if (!tbody || ventas.length === 0) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#999;">No hay ventas</td></tr>';
        return;
    }
    
    tbody.innerHTML = ventas.map((v, idx) => {
        const prods = v.productos || v.items || [];
        const cli = v.cliente || {};
        const vid = 'venta' + idx;
        
        return `
            <tr onclick="toggleVentaDetalle('${vid}')" style="cursor:pointer;">
                <td style="color:#00d4ff;font-weight:700;">#${String(v.id).substring(0, 8)}</td>
                <td><strong>${cli.nombre}</strong></td>
                <td>${prods.length} item(s)</td>
                <td><strong style="color:#00d4ff;font-size:1.125rem;">$${Number(v.total).toLocaleString('es-CL')}</strong></td>
                <td><small style="color:#94a3b8;">${new Date(v.fecha).toLocaleDateString('es-CL')}</small></td>
                <td><span style="padding:0.35rem 0.75rem;border-radius:20px;background:#d4edda;color:#155724;">✓</span></td>
            </tr>
            <tr id="${vid}" style="display:none;">
                <td colspan="6" style="padding:1.5rem;background:rgba(0,212,255,0.03);border-top:2px solid rgba(0,212,255,0.2);">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.5rem;">
                        <div>
                            <div style="color:#94a3b8;font-size:0.75rem;text-transform:uppercase;margin-bottom:0.25rem;">📧 Email</div>
                            <div style="color:#e0e0e0;font-weight:500;">${cli.email||'N/A'}</div>
                        </div>
                        <div>
                            <div style="color:#94a3b8;font-size:0.75rem;text-transform:uppercase;margin-bottom:0.25rem;">📞 Teléfono</div>
                            <div style="color:#e0e0e0;font-weight:500;">${cli.telefono||'N/A'}</div>
                        </div>
                        <div style="grid-column:1/-1;">
                            <div style="color:#94a3b8;font-size:0.75rem;text-transform:uppercase;margin-bottom:0.25rem;">📍 Dirección</div>
                            <div style="color:#e0e0e0;font-weight:500;">${cli.direccion||'N/A'}</div>
                        </div>
                    </div>
                    <div style="color:#00d4ff;font-size:0.875rem;font-weight:600;margin-bottom:0.75rem;">🛒 Productos:</div>
                    ${prods.map(p => `
                        <div style="padding:0.75rem;background:rgba(0,0,0,0.2);border-radius:6px;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="font-weight:600;color:#e0e0e0;">${p.nombre}</div>
                                ${p.color||p.capacidad?`<div style="color:#94a3b8;font-size:0.875rem;margin-top:0.25rem;">${[p.color,p.capacidad].filter(Boolean).join(' • ')}</div>`:''}
                                <div style="color:#94a3b8;font-size:0.875rem;margin-top:0.25rem;">Cantidad: ${p.cantidad}</div>
                            </div>
                            <div style="color:#00d4ff;font-weight:700;font-size:1.125rem;">$${(p.precio*p.cantidad).toLocaleString('es-CL')}</div>
                        </div>
                    `).join('')}
                </td>
            </tr>
        `;
    }).join('');
}

function toggleVentaDetalle(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
}

// REPORTE DE STOCK
async function cargarReporteStock() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) return;
        
        const productos = await response.json();
        
        const agotados = productos.filter(p => p.stock === 0);
        const bajoStock = productos.filter(p => p.stock > 0 && p.stock < 5);
        
        // Solo actualizar si los elementos existen
        const stockAgotadoEl = document.getElementById('stockAgotado');
        const stockBajoEl = document.getElementById('stockBajo');
        
        if (stockAgotadoEl) stockAgotadoEl.textContent = agotados.length;
        if (stockBajoEl) stockBajoEl.textContent = bajoStock.length;
        
        const tbody = document.getElementById('stockBajoTableBody');
        if (!tbody) return;
        
        if (bajoStock.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No hay productos con stock bajo</td></tr>';
            return;
        }
        
        tbody.innerHTML = bajoStock.map(p => `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td><strong style="color: #f59e0b;">${p.stock}</strong></td>
                <td><span style="padding: 0.35rem 0.75rem; border-radius: 20px; background: #fef3c7; color: #92400e;">⚠️ BAJO</span></td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error:', error);
    }
}
