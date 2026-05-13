'use strict';

let categorias = [];
let productoEditando = null;

const modalEl = document.getElementById('modalProducto');
const bsModal = modalEl ? new bootstrap.Modal(modalEl) : null;

const modalDetalleEl = document.getElementById('modalDetalleProducto');
const bsModalDetalle = modalDetalleEl ? new bootstrap.Modal(modalDetalleEl) : null;


function mostrarAlert(id, msg, tipo = 'danger') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `auth-alert alert alert-${tipo}`;
    el.textContent = msg;
    el.classList.remove('d-none');
}
function limpiarAlert(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
}


//  IMAGEN: SWITCH MODO 
window.switchModoImagen = function (modo) {
    const modoArchivo = document.getElementById('modoArchivo');
    const modoUrl = document.getElementById('modoUrl');
    const btnArchivo = document.getElementById('btnModoArchivo');
    const btnUrl = document.getElementById('btnModoUrl');

    if (modo === 'archivo') {
        modoArchivo.style.display = '';
        modoUrl.style.display = 'none';
        btnArchivo.classList.add('primary');
        btnUrl.classList.remove('primary');
    } else {
        modoArchivo.style.display = 'none';
        modoUrl.style.display = '';
        btnUrl.classList.add('primary');
        btnArchivo.classList.remove('primary');
    }
    // Limpiar preview al cambiar modo
    ocultarPreview();
};

function ocultarPreview() {
    const wrap = document.getElementById('imagenPreviewWrap');
    if (wrap) wrap.style.display = 'none';
}

function mostrarPreview(src) {
    const wrap = document.getElementById('imagenPreviewWrap');
    const img = document.getElementById('imagenPreview');
    if (!wrap || !img || !src) return;
    img.src = src;
    wrap.style.display = '';
}


// CARGAR CATEGORÍAS 
async function cargarCategorias() {
    try {
        const res = await fetch('/api/categorias');
        const data = await res.json();
        if (data.ok) {
            categorias = data.categorias;
            const sel = document.getElementById('prodCategoria');
            const filtro = document.getElementById('filtroCategoria');
            categorias.forEach(c => {
                if (sel) sel.innerHTML += `<option value="${c.id_categoria}">${c.nombre}</option>`;
                if (filtro) filtro.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
            });
        }
    } catch (e) {
        console.error('Error cargando categorías:', e);
    }
}

//  CARGAR PRODUCTOS 
async function cargarProductos(buscar = '', categoria = '') {
    const tbody = document.getElementById('tbodyProductos');
    if (!tbody) return;

    tbody.innerHTML = `<tr>
        <td colspan="7" class="text-center py-3">
            <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
        </td>
    </tr>`;

    const params = new URLSearchParams();
    if (buscar) params.set('buscar', buscar);
    if (categoria) params.set('categoria', categoria);

    try {
        const res = await fetch(`/api/productos?${params}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.mensaje);

        if (!data.productos.length) {
            tbody.innerHTML = `<tr>
                <td colspan="7" class="text-center text-muted py-4">
                    No se encontraron productos.
                </td>
            </tr>`;
            return;
        }

        tbody.innerHTML = data.productos.map(p => {
            const img = p.imagen
                ? (p.imagen.startsWith('http') || p.imagen.startsWith('/')
                    ? p.imagen
                    : `/public/images/${p.imagen}`)
                : null;

            const stockBadge = p.stock > 10
                ? `<span class="badge bg-success">${p.stock}</span>`
                : p.stock > 0
                    ? `<span class="badge bg-warning text-dark">${p.stock}</span>`
                    : `<span class="badge bg-danger">${p.stock}</span>`;

            return `<tr>
        <td data-label="Imagen" class="td-imagen">
            ${img
                    ? `<img src="${img}" alt="${p.nombre}"
                       style="width:52px;height:52px;object-fit:cover;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.12)"
                       onerror="this.style.display='none'">`
                    : `<div style="width:52px;height:52px;border-radius:8px;background:#f3f4f6;display:flex;align-items:center;justify-content:center">
                       <i class="bi bi-image text-muted"></i>
                   </div>`
                }
        </td>
        <td data-label="Nombre" class="fw-500">${p.nombre}</td>
        <td data-label="Categoría">
            <span class="badge bg-light text-dark border">${p.categoria || '—'}</span>
        </td>
        <td data-label="Precio" class="fw-600">S/ ${parseFloat(p.precio_actual).toFixed(2)}</td>
        <td data-label="Ant.">
            ${p.precio_anterior
                    ? `<s class="text-muted small">S/ ${parseFloat(p.precio_anterior).toFixed(2)}</s>`
                    : '—'}
        </td>
        <td data-label="Stock">${stockBadge}</td>
        <td>
            <div class="d-flex gap-1 justify-content-end">
                <button class="btn btn-sm btn-outline-secondary rounded-pill"
                        onclick="verDetalleProducto(${p.id_producto})"
                        title="Ver detalle">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary rounded-pill"
                        onclick="editarProducto(${p.id_producto})"
                        title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger rounded-pill"
                        onclick="eliminarProducto(${p.id_producto}, '${p.nombre.replace(/'/g, "\\'")}')"
                        title="Eliminar">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        </td>
    </tr>`;
        }).join('');

    } catch (err) {
        tbody.innerHTML = `<tr>
            <td colspan="7" class="text-center text-danger py-4">${err.message}</td>
        </tr>`;
    }
}

//  VER DETALLE 
window.verDetalleProducto = async function (id) {
    const body = document.getElementById('modalDetalleBody');
    body.innerHTML = `<p class="text-center py-4 text-muted">
        <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
    </p>`;

    // Guardamos el id para el botón "Editar" del modal
    document.getElementById('btnEditarDesdeDetalle').onclick = () => {
        bsModalDetalle.hide();
        editarProducto(id);
    };

    bsModalDetalle?.show();

    try {
        const res = await fetch(`/api/productos/${id}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.mensaje);

        const p = data.producto;
        const img = p.imagen
            ? (p.imagen.startsWith('http') ? p.imagen : p.imagen)
            : null;

        const stockColor = p.stock > 10 ? '#053f2f9c' : p.stock > 0 ? '#aa710f' : '#9c0909';
        const stockLabel = p.stock > 10 ? 'En stock' : p.stock > 0 ? 'Stock bajo' : 'Agotado';

        body.innerHTML = `
        <div class="row g-4">

            <!-- Imagen -->
            <div class="col-md-5 d-flex align-items-center justify-content-center">
                ${img
                ? `<img src="${img}" alt="${p.nombre}"
                           style="width:100%;max-width:280px;border-radius:14px;
                                  object-fit:cover;box-shadow:0 4px 20px rgba(0,0,0,.13)"
                           onerror="this.replaceWith(document.createTextNode('Sin imagen'))">`
                : `<div style="width:200px;height:200px;border-radius:14px;background:#f3f4f6;
                                   display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#aaa">
                           <i class="bi bi-image" style="font-size:2.5rem"></i>
                           <span style="font-size:.85rem">Sin imagen</span>
                       </div>`}
            </div>

            <!-- Info -->
            <div class="col-md-7">

                <!-- Nombre y categoría -->
                <div class="mb-1">
                    <span class="badge bg-light text-dark border mb-2"
                          style="font-size:.78rem">${p.categoria || '—'}</span>
                </div>
                <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.6rem;
                           font-weight:700;color:#1a1a2e;margin-bottom:12px">
                    ${p.nombre}
                </h3>

                <!-- Descripción -->
                <p style="color:#555;font-size:.92rem;line-height:1.6;margin-bottom:16px">
                    ${p.descripcion || '<em style="color:#aaa">Sin descripción</em>'}
                </p>

                <!-- Precios -->
                <div class="d-flex align-items-baseline gap-3 mb-3">
                    <span style="font-size:1.8rem;font-weight:700;color:#2d6a4f">
                        S/ ${parseFloat(p.precio_actual).toFixed(2)}
                    </span>
                    ${p.precio_anterior
                ? `<s style="font-size:1rem;color:#aaa">
                               S/ ${parseFloat(p.precio_anterior).toFixed(2)}
                           </s>`
                : ''}
                </div>

                <!-- Stock -->
                <div class="d-flex align-items-center gap-2 mb-3">
                    <span style="font-size:.85rem;color:#666">Stock:</span>
                    <span class="badge"
                          style="background:${stockColor};font-size:.88rem;padding:5px 12px;border-radius:20px">
                        ${p.stock} unidades
                    </span>
                    <span style="font-size:.8rem;color:${stockColor}">${stockLabel}</span>
                </div>

                <!-- Separador -->
                <hr style="border-color:#e5e7eb;margin:16px 0">

                <!-- Datos adicionales -->
                <div class="row g-2" style="font-size:.85rem">
                    <div class="col-6">
                        <span style="color:#888">ID Producto:</span>
                        <span class="fw-500 ms-1">#${p.id_producto}</span>
                    </div>
                    <div class="col-6">
                        <span style="color:#888">Estado:</span>
                        <span class="badge ms-1 ${p.activo ? 'bg-success' : 'bg-secondary'}">
                            ${p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>
        </div>`;

    } catch (err) {
        body.innerHTML = `<p class="text-center text-danger py-4">
            <i class="bi bi-exclamation-triangle me-1"></i>${err.message}
        </p>`;
    }
};

//  ABRIR MODAL NUEVO 
document.getElementById('btnNuevoProducto')?.addEventListener('click', () => {
    productoEditando = null;
    document.getElementById('modalProductoLabel').textContent = 'Nuevo producto';
    limpiarModal();
    bsModal?.show();
});

function limpiarModal() {
    ['prodId', 'prodNombre', 'prodDescripcion', 'prodImagen',
        'prodStock', 'prodPrecioActual', 'prodPrecioAnterior'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    const archivoInput = document.getElementById('prodImagenArchivo');
    if (archivoInput) archivoInput.value = '';
    const catSel = document.getElementById('prodCategoria');
    if (catSel) catSel.value = '';
    limpiarAlert('modalProductoAlert');
    ocultarPreview();
    switchModoImagen('archivo'); // Siempre empieza en modo archivo
}

//  EDITAR PRODUCTO 
window.editarProducto = async function (id) {
    try {
        const res = await fetch(`/api/productos/${id}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.mensaje);
        const p = data.producto;

        productoEditando = id;
        document.getElementById('modalProductoLabel').textContent = 'Editar producto';
        document.getElementById('prodId').value = p.id_producto;
        document.getElementById('prodNombre').value = p.nombre || '';
        document.getElementById('prodDescripcion').value = p.descripcion || '';
        document.getElementById('prodImagen').value = p.imagen || '';
        document.getElementById('prodStock').value = p.stock ?? 0;
        document.getElementById('prodPrecioActual').value = p.precio_actual ?? '';
        document.getElementById('prodPrecioAnterior').value = p.precio_anterior ?? '';

        const cat = categorias.find(c => c.nombre === p.categoria);
        if (cat) document.getElementById('prodCategoria').value = cat.id_categoria;

        // Mostrar imagen existente y poner en modo URL si la tiene
        if (p.imagen) {
            switchModoImagen('url');
            const preview = p.imagen.startsWith('http') || p.imagen.startsWith('/')
                ? p.imagen
                : `/public/images/${p.imagen}`;
            mostrarPreview(preview);
        } else {
            switchModoImagen('archivo');
        }

        limpiarAlert('modalProductoAlert');
        bsModal?.show();
    } catch (e) {
        alert('Error al cargar producto: ' + e.message);
    }
};

//  BLOQUEO DE TECLAS NO NUMÉRICAS 
function bloquearNoNumericos(inputId, conDecimal = true) {
    const el = document.getElementById(inputId);
    if (!el) return;

    el.addEventListener('keydown', (e) => {
        const permitidas = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
        if (permitidas.includes(e.key)) return;
        if (conDecimal && (e.key === '.' || e.key === ',')) {
            // Solo un separador decimal
            if (el.value.includes('.') || el.value.includes(',')) e.preventDefault();
            return;
        }
        if (!/^\d$/.test(e.key)) e.preventDefault();
    });

    // También limpiar si pegan texto con Ctrl+V
    el.addEventListener('input', () => {
        const val = el.value;
        if (conDecimal) {
            // Permitir solo dígitos y un punto
            el.value = val.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
        } else {
            // Solo enteros
            el.value = val.replace(/[^0-9]/g, '');
        }
    });
}

// GUARDAR PRODUCTO
document.getElementById('btnGuardarProducto')?.addEventListener('click', async () => {
    const id_categoria = document.getElementById('prodCategoria').value;
    const nombre = document.getElementById('prodNombre').value.trim();
    const descripcion = document.getElementById('prodDescripcion').value.trim();

    const stockRaw = document.getElementById('prodStock').value.trim();
    const precioActualRaw = document.getElementById('prodPrecioActual').value.trim();
    const precioAnteriorRaw = document.getElementById('prodPrecioAnterior').value.trim();

    const stock = stockRaw !== '' ? Number(stockRaw) : NaN;
    const precio_actual = precioActualRaw !== '' ? Number(precioActualRaw) : NaN;
    const precio_anterior = precioAnteriorRaw !== '' ? Number(precioAnteriorRaw) : NaN;

    limpiarAlert('modalProductoAlert');
    //validamos
    if (!id_categoria || !nombre || !precioActualRaw) {
        mostrarAlert('modalProductoAlert', 'Categoría, nombre y precio son obligatorios.');
        return;
    }
    if (isNaN(precio_actual) || precio_actual <= 0) {
        mostrarAlert('modalProductoAlert', 'El precio actual debe ser un número mayor a 0.');
        return;
    }
    if (precioAnteriorRaw && (isNaN(precio_anterior) || precio_anterior <= 0)) {
        mostrarAlert('modalProductoAlert', 'El precio anterior debe ser un número mayor a 0.');
        return;
    }
    if (precioAnteriorRaw && precio_anterior <= precio_actual) {
        mostrarAlert('modalProductoAlert', 'El precio anterior debe ser mayor al precio actual.');
        return;
    }
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        mostrarAlert('modalProductoAlert', 'El stock debe ser un número entero mayor o igual a 0.');
        return;
    }

    // Determinar si es modo archivo o URL
    const modoArchivo = document.getElementById('modoArchivo').style.display !== 'none';
    const archivoInput = document.getElementById('prodImagenArchivo');
    const archivo = archivoInput?.files[0];
    const imagenUrl = document.getElementById('prodImagen')?.value.trim();

    // Si modo archivo y hay archivo → subir primero
    let imagenFinal = imagenUrl || ''; // valor por defecto

    if (modoArchivo && archivo) {
        // Subir el archivo al servidor
        const formData = new FormData();
        formData.append('imagen', archivo);

        try {
            const uploadRes = await fetch('/api/productos/upload-imagen', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.ok) {
                mostrarAlert('modalProductoAlert', uploadData.mensaje || 'Error al subir imagen.');
                return;
            }
            imagenFinal = uploadData.ruta; // ruta devuelta por el servidor
        } catch (e) {
            mostrarAlert('modalProductoAlert', 'Error al subir la imagen.');
            return;
        }
    } else if (modoArchivo && !archivo && productoEditando) {
        // Editando y no cambió la imagen, mantenemos la existente 
        imagenFinal = null; // señal para no sobreescribir
    }

    const body = {
        id_categoria,
        nombre,
        descripcion,
        stock: stock,
        precio_actual: precio_actual,
        precio_anterior: precioAnteriorRaw ? precio_anterior : '',
        ...(imagenFinal !== null && { imagen: imagenFinal })
    };

    try {
        const url = productoEditando ? `/api/productos/${productoEditando}` : '/api/productos';
        const method = productoEditando ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (data.ok) {
            mostrarAlert('modalProductoAlert', data.mensaje, 'success');
            setTimeout(() => { bsModal?.hide(); cargarProductos(); }, 800);
        } else {
            mostrarAlert('modalProductoAlert', data.mensaje || 'Error al guardar.');
        }
    } catch (e) {
        mostrarAlert('modalProductoAlert', 'Error de conexión.');
    }
});

//ELIMINAR PRODUCTO
window.eliminarProducto = async function (id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción lo desactivará del catálogo.`)) return;
    try {
        const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.ok) cargarProductos();
        else alert(data.mensaje || 'Error al eliminar.');
    } catch (e) {
        alert('Error de conexión.');
    }
};

//FILTROS Y BÚSQUEDA
let busquedaTimer;
document.getElementById('buscarProducto')?.addEventListener('input', function () {
    clearTimeout(busquedaTimer);
    busquedaTimer = setTimeout(() => {
        const cat = document.getElementById('filtroCategoria')?.value || '';
        cargarProductos(this.value.trim(), cat);
    }, 400);
});
document.getElementById('filtroCategoria')?.addEventListener('change', function () {
    const buscar = document.getElementById('buscarProducto')?.value.trim() || '';
    cargarProductos(buscar, this.value);
});

// inicializar el dom
document.addEventListener('DOMContentLoaded', () => {
    // Preview al seleccionar archivo
    document.getElementById('prodImagenArchivo')?.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) { ocultarPreview(); return; }
        if (file.size > 3 * 1024 * 1024) {
            mostrarAlert('modalProductoAlert', 'La imagen no debe superar 3 MB.');
            this.value = '';
            ocultarPreview();
            return;
        }
        const reader = new FileReader();
        reader.onload = e => mostrarPreview(e.target.result);
        reader.readAsDataURL(file);
    });

    // Preview al escribir URL externa
    document.getElementById('prodImagen')?.addEventListener('input', function () {
        if (this.value.trim()) mostrarPreview(this.value.trim());
        else ocultarPreview();
    });

    bloquearNoNumericos('prodPrecioActual', true);
    bloquearNoNumericos('prodPrecioAnterior', true);
    bloquearNoNumericos('prodStock', false);


    cargarCategorias().then(() => cargarProductos());
});