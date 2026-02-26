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

        // .reverse() para que las ventas de hoy (25 de febrero) salgan arriba
        tbody.innerHTML = ventas.reverse().map(v => {
            // Buscamos los datos tanto en la raíz como dentro del objeto 'cliente'
            const nombre = v.nombre || (v.cliente && v.cliente.nombre) || "Sin nombre registrado";
            const ciudad = v.ciudad || (v.cliente && v.cliente.ciudad) || "N/A";
            const comuna = v.comuna || (v.cliente && v.cliente.comuna) || "N/A";
            const idVenta = v._id || v.id;

            return `
            <tr>
                <td>${v.fecha ? new Date(v.fecha).toLocaleDateString('es-CL') : 'S/F'}</td>
                <td>
                    <strong style="color: #1d1d1f;">${nombre}</strong><br>
                    <small style="color: #86868b;">${v.email || (v.cliente && v.cliente.email) || 'No email'}</small>
                </td>
                <td>${ciudad} / ${comuna}</td>
                <td><strong>$${Number(v.total || 0).toLocaleString('es-CL')}</strong></td>
                <td><span style="background: #e3f2fd; color: #0071e3; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;">${v.estado ? v.estado.toUpperCase() : 'RECIBIDA'}</span></td>
                <td>
                    <button class="btn-edit" onclick="verDetalleVenta('${idVenta}')" style="background: #1d1d1f; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Ver Todo
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
        // Buscamos la venta (probando ambos tipos de ID)
        const v = ventas.find(venta => (venta._id === id || venta.id === id));

        if (!v) return alert("Venta no encontrada");

        const cuerpoModal = document.getElementById('modalVentaCuerpo');
        if (!cuerpoModal) return;

        // ... dentro de verDetalleVenta ...
const listaProductos = v.productos || v.items || [];

const productosHtml = listaProductos.map(p => {
    // Intentamos todas las combinaciones posibles que podrías haber usado
    const colorFinal = p.color || p.colorSeleccionado || p.opcionColor || "No especificado";
    const capacidadFinal = p.capacidad || p.capacidadSeleccionada || p.storage || "No especificada";

    return `
    <div style="background: #f5f5f7; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #d2d2d7; color: #1d1d1f !important;">
        <div style="font-weight: 700; margin-bottom: 8px;">${p.nombre || 'Producto'}</div>
        <div style="display: flex; gap: 8px;">
            <span style="background: #fff; border: 1px solid #d2d2d7; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">
                <strong>Color:</strong> ${colorFinal}
            </span>
            <span style="background: #fff; border: 1px solid #d2d2d7; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">
                <strong>Capacidad:</strong> ${capacidadFinal}
            </span>
        </div>
    </div>
    `;
}).join('');

        // 2. EXTRAER DATOS DEL CLIENTE (Mapeo flexible)
        const nombre = v.nombre || (v.cliente && v.cliente.nombre) || "No registrado";
        const ciudad = v.ciudad || (v.cliente && v.cliente.ciudad) || "No registrada";
        const comuna = v.comuna || (v.cliente && v.cliente.comuna) || "No registrada";
        const direccion = v.calle ? `${v.calle} ${v.numero || ''}` : (v.cliente && v.cliente.calle ? `${v.cliente.calle} ${v.cliente.numero || ''}` : "Dirección no registrada");

        // 3. INYECTAR EN EL MODAL (Forzando color negro)
        cuerpoModal.innerHTML = `
            <div style="text-align: left; color: #1d1d1f !important; font-family: sans-serif; line-height: 1.5;">
                <p style="margin: 5px 0;"><strong>👤 Cliente:</strong> ${nombre}</p>
                <p style="margin: 5px 0;"><strong>📞 Teléfono:</strong> ${v.telefono || (v.cliente && v.cliente.telefono) || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>📍 Ubicación:</strong> ${ciudad}, ${comuna}</p>
                <p style="margin: 5px 0;"><strong>🏠 Dirección:</strong> ${direccion}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p style="font-weight: 700; color: #1d1d1f; margin-bottom: 10px;">📦 Pedido:</p>
                ${productosHtml}
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p style="font-size: 1.3rem; color: #0071e3; text-align: right; margin: 0;">
                    <strong>Total: $${Number(v.total || 0).toLocaleString('es-CL')}</strong>
                </p>
            </div>
        `;

        document.getElementById('modalVenta').style.display = 'flex';
    } catch (error) {
        console.error("Error al abrir detalle:", error);
    }
}

// 3. CERRAR MODAL
function cerrarModalVenta() {
    document.getElementById('modalVenta').style.display = 'none';
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
