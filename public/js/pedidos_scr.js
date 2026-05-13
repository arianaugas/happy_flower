'use strict';

// ESTADO BADGE
function estadoBadge(estado) {
    const map = {
        pendiente:   { cls: 'status-pendiente',   icon: 'bi-hourglass',         label: 'Pendiente' },
        preparacion: { cls: 'status-preparacion',  icon: 'bi-tools',             label: 'En preparación' },
        listo:       { cls: 'status-listo',        icon: 'bi-check-circle',      label: 'Listo para envío' },
        camino:      { cls: 'status-en-camino',    icon: 'bi-truck',             label: 'En camino' },
        entregado:   { cls: 'status-entregado',    icon: 'bi-check-circle-fill', label: 'Entregado' },
        cancelado:   { cls: 'status-cancelado',    icon: 'bi-x-circle',          label: 'Cancelado' },
    };
    const s = map[estado] || { cls: '', icon: 'bi-question', label: estado };
    return `<span class="order-status ${s.cls}"><i class="bi ${s.icon} me-1"></i>${s.label}</span>`;
}

// FORMATEAR FECHA 
function formatFecha(f) {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

// CARGAR PEDIDOS 
async function cargarPedidos() {
    const lista = document.getElementById('orders-list');
    if (!lista) return;
    lista.innerHTML = '<p class="text-muted text-center py-4"><span class="spinner-border spinner-border-sm me-2"></span>Cargando pedidos...</p>';

    try {
        const res  = await fetch('/api/pedidos/mis');
        const data = await res.json();

        const pedidosServidor = (data.ok && data.pedidos?.length) ? data.pedidos : [];

        // Verificar sesión por separado
        const sesionRes  = await fetch('/api/auth/sesion');
        const sesionData = await sesionRes.json();
        const tienesSesion = sesionData.ok && sesionData.usuario?.id_usuario;

        // Solo mostrar pedidos locales si NO hay sesión activa
        const pedidosLocales = tienesSesion
            ? []
            : (JSON.parse(localStorage.getItem('pedidos_invitado')) || []);

        if (pedidosServidor.length === 0 && pedidosLocales.length === 0) {
            lista.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-bag-x" style="font-size:3rem;color:#ccc"></i>
                    <p class="mt-3 text-muted">No tienes pedidos aún.</p>
                    <a href="/catalogo" class="btn btn-outline-success btn-sm mt-2">Ir al catálogo</a>
                </div>`;
            return;
        }

        lista.innerHTML = '';

        if (pedidosServidor.length > 0) {
            pedidosServidor.forEach(p => lista.innerHTML += crearTarjetaPedido(p));
            pedidosServidor.forEach(p => cargarItemsPedido(p.id_pedido));
            configurarTabs(pedidosServidor);
            sincronizarEstadosLocales(pedidosServidor);
        }

        if (pedidosLocales.length > 0) {
            lista.innerHTML += `
                <div class="alert alert-info py-2 px-3 mb-3 small">
                    <i class="bi bi-info-circle me-1"></i>
                    Pedidos guardados en este dispositivo.
                    <a href="/login" class="alert-link"><strong>Inicia sesión</strong></a> para verlos siempre.
                </div>`;
            for (const local of pedidosLocales) {
                await cargarPedidoLocal(local.id_pedido, lista);
            }
        }

    } catch (e) {
        const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_invitado')) || [];

        if (pedidosLocales.length === 0) {
            lista.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-person-lock" style="font-size:3rem;color:#ccc"></i>
                    <p class="mt-3 text-muted">Inicia sesión para ver tus pedidos.</p>
                    <a href="/login" class="btn btn-success btn-sm mt-2">Iniciar sesión</a>
                </div>`;
            return;
        }

        lista.innerHTML = `
            <div class="alert alert-info py-2 px-3 mb-3 small">
                <i class="bi bi-info-circle me-1"></i>
                Pedidos guardados en este dispositivo.
                <a href="/login" class="alert-link">Inicia sesión</a> para verlos siempre.
            </div>`;
        for (const local of pedidosLocales) {
            await cargarPedidoLocal(local.id_pedido, lista);
        }
    }
}

async function cargarPedidoLocal(id_pedido, lista) {
    try {
        const res  = await fetch(`/api/pedidos/${id_pedido}`);
        const data = await res.json();
        if (!data.ok) return;
        const p = data.pedido;
        lista.innerHTML += crearTarjetaPedido({
            id_pedido:         p.id_pedido,
            numero_pedido:     p.numero_pedido,
            estado:            p.estado,
            total:             p.total,
            metodo_pago:       p.metodo_pago,
            creado_en:         p.creado_en,
            direccion_entrega: p.direccion_entrega,
        });
        cargarItemsPedido(p.id_pedido);
    } catch (e) { /* ignorar */ }
}
// TARJETA PEDIDO 
function crearTarjetaPedido(p) {
    return `
        <article class="order-card" data-status="${p.estado}">
            <div class="order-header">
                <div>
                    <p class="order-id">Pedido #${p.numero_pedido}</p>
                    <p class="order-date">
                        <i class="bi bi-calendar3 me-1"></i>${formatFecha(p.creado_en)}
                    </p>
                </div>
                ${estadoBadge(p.estado)}
            </div>
            <div class="order-body">
                <div id="items-pedido-${p.id_pedido}" class="order-items mb-2">
                    <p class="text-muted small mb-0">
                        <span class="spinner-border spinner-border-sm me-1"></span>Cargando productos...
                    </p>
                </div>
                <div class="order-product">
                    <div>
                        <p class="order-product-detail">
                            <i class="bi bi-geo-alt me-1"></i>${p.direccion_entrega || '—'}
                        </p>
                        <p class="order-product-detail">
                            <i class="bi bi-credit-card me-1"></i>${p.metodo_pago || '—'}
                        </p>
                    </div>
                </div>
                <!-- BOTÓN SEGUIMIENTO -->
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-secondary rounded-pill w-100"
                        style="font-size:.8rem"
                        onclick="abrirModalSeguimiento(${p.id_pedido}, '${p.numero_pedido}')">
                        <i class="bi bi-clock-history me-1"></i>Ver seguimiento del pedido
                    </button>
                </div>
            </div>
            <div class="order-footer">
                <span class="order-total">S/ ${parseFloat(p.total).toFixed(2)}</span>
            </div>
        </article>`;
}

// CARGAR ITEMS DEL PEDIDO 
async function cargarItemsPedido(id_pedido) {
    try {
        const res  = await fetch(`/api/pedidos/${id_pedido}`);
        const data = await res.json();
        if (!data.ok) return;

        const contenedor = document.getElementById(`items-pedido-${id_pedido}`);
        if (!contenedor) return;

        const items = data.items || [];
        if (items.length === 0) {
            contenedor.innerHTML = '<p class="text-muted small mb-0">Sin productos.</p>';
            return;
        }

        contenedor.innerHTML = items.map(i => {
            const imagenSrc = i.imagen
                ? (i.imagen.startsWith('http') ? i.imagen : `${i.imagen}`)
                : '';
            return `
                <div class="d-flex align-items-center gap-3 py-2 border-bottom border-secondary border-opacity-25">
                    <div style="width:52px;height:52px;border-radius:8px;overflow:hidden;flex-shrink:0;background:#2a2a2a">
                        ${imagenSrc
                            ? `<img src="${imagenSrc}" alt="${i.nombre}"
                                   style="width:100%;height:100%;object-fit:cover"
                                   onerror="this.parentElement.innerHTML='<i class=\\'bi bi-image\\' style=\\'color:#555;font-size:1.4rem;display:flex;height:100%;align-items:center;justify-content:center\\'></i>'">`
                            : `<i class="bi bi-image" style="color:#555;font-size:1.4rem;display:flex;height:100%;align-items:center;justify-content:center"></i>`
                        }
                    </div>
                    <div>
                        <p class="mb-0 fw-500" style="font-size:.9rem">${i.nombre}</p>
                        <p class="mb-0 text-muted" style="font-size:.8rem">
                            Cantidad: ${i.cantidad} &nbsp;·&nbsp;
                            S/ ${parseFloat(i.precio_unit).toFixed(2)} c/u
                        </p>
                    </div>
                </div>`;
        }).join('');

    } catch (e) {
        const contenedor = document.getElementById(`items-pedido-${id_pedido}`);
        if (contenedor) contenedor.innerHTML = '';
    }
}

// MODAL SEGUIMIENTO
window.abrirModalSeguimiento = async function(id_pedido, numero_pedido) {
    const modalEl    = document.getElementById('modalSeguimiento');
    const modalBody  = document.getElementById('modalSeguimientoBody');
    const modalTitle = document.getElementById('modalSeguimientoLabel');

    if (!modalEl) return;

    modalTitle.innerHTML = `<i class="bi bi-clock-history me-2"></i>Pedido #${numero_pedido}`;
    modalBody.innerHTML  = `<p class="text-center text-muted py-3">
        <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
    </p>`;

    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    try {
        const res  = await fetch(`/api/pedidos/${id_pedido}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.mensaje);

        const tracking = data.tracking || [];

        if (tracking.length === 0) {
            modalBody.innerHTML = `<p class="text-muted text-center py-3">Sin actualizaciones aún.</p>`;
            return;
        }

        const iconMap = {
            pendiente:   { icon: 'bi-hourglass',        color: '#9e9e9e' },
            preparacion: { icon: 'bi-tools',             color: '#64b5f6' },
            listo:       { icon: 'bi-check-circle',      color: '#81c784' },
            camino:      { icon: 'bi-truck',             color: '#ffb74d' },
            entregado:   { icon: 'bi-check-circle-fill', color: '#66bb6a' },
            cancelado:   { icon: 'bi-x-circle',          color: '#ef5350' },
        };
        const labelMap = {
            pendiente:   'Pedido recibido',
            preparacion: 'En preparación',
            listo:       'Listo para envío',
            camino:      'En camino',
            entregado:   'Entregado',
            cancelado:   'Cancelado',
        };

        const ultimoIdx = tracking.length - 1;

        modalBody.innerHTML = `
            <div style="position:relative;padding-left:4px">
                <!-- Línea vertical -->
                <div style="position:absolute;left:19px;top:8px;bottom:8px;
                    width:2px;background:rgba(255,255,255,.08);z-index:0"></div>

                ${tracking.map((t, idx) => {
                    const esUltimo = idx === ultimoIdx;
                    const cfg   = iconMap[t.estado]  || { icon: 'bi-circle', color: '#aaa' };
                    const label = labelMap[t.estado] || t.estado;
                    return `
                        <div style="position:relative;z-index:1;display:flex;gap:14px;
                            align-items:flex-start;
                            margin-bottom:${idx < ultimoIdx ? '24px' : '0'};
                            opacity:${esUltimo ? '1' : '0.55'}">

                            <!-- Ícono -->
                            <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;
                                background:${esUltimo ? cfg.color : 'rgba(255,255,255,.1)'};
                                display:flex;align-items:center;justify-content:center;
                                box-shadow:${esUltimo ? `0 0 0 4px ${cfg.color}33` : 'none'}">
                                <i class="bi ${cfg.icon}" style="font-size:.8rem;
                                    color:${esUltimo ? '#fff' : '#aaa'}"></i>
                            </div>

                            <!-- Texto -->
                            <div style="flex:1;padding-top:5px">
                                <div class="d-flex justify-content-between flex-wrap gap-1 align-items-start">
                                    <span style="font-size:.9rem;
                                        font-weight:${esUltimo ? '600' : '400'};
                                        color:${esUltimo ? cfg.color : '#ccc'}">
                                        ${label}
                                    </span>
                                    <span style="font-size:.75rem;color:#555">
                                        ${formatFecha(t.registrado_en)}
                                    </span>
                                </div>
                                ${t.descripcion ? `
                                    <p style="font-size:.82rem;color:#888;margin:6px 0 0;
                                        border-left:2px solid ${cfg.color};
                                        padding:6px 10px;border-radius:0 6px 6px 0;
                                        background:rgba(255,255,255,.03);font-style:italic">
                                        "${t.descripcion}"
                                    </p>` : ''}
                            </div>
                        </div>`;
                }).join('')}
            </div>`;

    } catch (e) {
        modalBody.innerHTML = `<p class="text-danger text-center py-3">Error al cargar el seguimiento.</p>`;
    }
};

// TABS FILTROS
function configurarTabs(pedidos) {
    const tabs = document.querySelectorAll('.order-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const filtro = tab.id;
            document.querySelectorAll('.order-card').forEach(card => {
                const estado = card.dataset.status;
                let mostrar = true;
                if (filtro === 'btnMostrarEnCamino')   mostrar = ['camino', 'preparacion', 'listo'].includes(estado);
                if (filtro === 'btnMostrarEntregados') mostrar = estado === 'entregado';
                card.style.display = mostrar ? '' : 'none';
            });
        });
    });
}

// SINCRONIZAR ESTADOS EN LOCALSTORAGE
function sincronizarEstadosLocales(pedidos) {
    if (!pedidos?.length) return;
    const guardados = JSON.parse(localStorage.getItem('hf_estados_pedidos') || '{}');
    pedidos.forEach(p => {
        const key = String(p.id_pedido || p.numero_pedido);
        if (key) guardados[key] = p.estado || 'pendiente';
    });
    localStorage.setItem('hf_estados_pedidos', JSON.stringify(guardados));
}

// inicializar el dom
document.addEventListener('DOMContentLoaded', () => {
    initShared();
    cargarPedidos();
});

