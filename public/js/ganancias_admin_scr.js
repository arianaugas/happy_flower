'use strict';

const COLORES_BAR = ['bar-verde', 'bar-rosa', 'bar-azul', 'bar-dorado', 'bar-indigo', 'bar-teal', 'bar-amber', 'bar-cyan'];

let datosGlobal = [];
let categoriaActiva = '';

function margenClase(m) {
    if (m >= 20) return 'margen-alto';
    if (m >= 10) return 'margen-medio';
    return 'margen-bajo';
}

function pct(val, total) {
    if (!total) return 0;
    return Math.round((val / total) * 100);
}

async function cargarGanancias() {
    try {
        const res = await fetch('/api/admin/ganancias', { credentials: 'include' });
        const data = await res.json();

        if (!data.ok || !data.ganancias) {
            mostrarError('No se pudieron cargar los datos de ganancias.');
            return;
        }

        datosGlobal = data.ganancias;
        construirFiltros(datosGlobal);
        renderizar(datosGlobal);

    } catch (err) {
        console.error('Error cargando ganancias:', err);
        mostrarError('Error de conexión con el servidor.');
    }
}

function mostrarError(msg) {
    ['tbodyGanancias', 'tbodyResumenCat'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">${msg}</td></tr>`;
    });
}

function construirFiltros(datos) {
    const cats = [...new Set(datos.map(d => d.categoria))].sort();
    const cont = document.getElementById('filtroCategorias');
    if (!cont) return;

    cont.innerHTML = `<button class="categoria-pill active" data-cat="">
        <i class="bi bi-grid"></i> Todas
    </button>`;

    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'categoria-pill';
        btn.dataset.cat = cat;
        btn.innerHTML = `<i class="bi bi-tag"></i> ${cat}`;
        cont.appendChild(btn);
    });

    cont.addEventListener('click', (e) => {
        const btn = e.target.closest('.categoria-pill');
        if (!btn) return;
        cont.querySelectorAll('.categoria-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        categoriaActiva = btn.dataset.cat;

        const label = document.getElementById('categoriaActivaLabel');
        if (label) {
            label.textContent = categoriaActiva || '';
            label.style.display = categoriaActiva ? 'inline-flex' : 'none';
        }

        const filtrado = categoriaActiva
            ? datosGlobal.filter(d => d.categoria === categoriaActiva)
            : datosGlobal;
        renderizar(filtrado, false);
    });
}

function renderizar(datos) {
    if (!datos.length) { mostrarError('Sin datos para mostrar.'); return; }

    const totalInversion = datos.reduce((a, d) => a + Number(d.costo_inversion), 0);
    const totalGanancia = datos.reduce((a, d) => a + Number(d.ganancia), 0);

    document.getElementById('statInversion').textContent = `S/ ${totalInversion.toFixed(2)}`;
    document.getElementById('statGanancia').textContent = `S/ ${totalGanancia.toFixed(2)}`;

    renderResumenCategorias(datos, totalGanancia);
    renderDetalleProductos(datos, totalGanancia);
}

function renderResumenCategorias(datos, totalGananciaGlobal) {
    const tbody = document.getElementById('tbodyResumenCat');
    if (!tbody) return;

    const grupos = {};
    datos.forEach(d => {
        if (!grupos[d.categoria]) grupos[d.categoria] = { inversion: 0, ganancia: 0, count: 0 };
        grupos[d.categoria].inversion += Number(d.costo_inversion);
        grupos[d.categoria].ganancia += Number(d.ganancia);
        grupos[d.categoria].count += 1;
    });

    const maxGanancia = Math.max(...Object.values(grupos).map(g => g.ganancia));

    tbody.innerHTML = Object.entries(grupos)
        .sort((a, b) => b[1].ganancia - a[1].ganancia)
        .map(([cat, g], i) => {
            const margen = g.inversion ? (g.ganancia / g.inversion) * 100 : 0;
            const distribPct = totalGananciaGlobal ? pct(g.ganancia, totalGananciaGlobal) : 0;
            const barPct = maxGanancia ? pct(g.ganancia, maxGanancia) : 0;
            const barColor = COLORES_BAR[i % COLORES_BAR.length];
            return `<tr>
            <td data-label="Categoría"><strong>${cat}</strong></td>
            <td data-label="Productos">${g.count}</td>
            <td data-label="Inversión">S/ ${g.inversion.toFixed(2)}</td>
            <td data-label="Ganancia" class="fw-600" style="color:var(--verde)">S/ ${g.ganancia.toFixed(2)}</td>
            <td data-label="Margen"><span class="margen-badge ${margenClase(margen)}">${margen.toFixed(1)}%</span></td>
            <td data-label="Distribución" style="min-width:160px">
                <div class="d-flex align-items-center gap-2">
                    <div class="bar-wrap flex-grow-1">
                        <div class="bar-fill ${barColor}" style="width:${barPct}%"></div>
                    </div>
                    <span style="font-size:.78rem;color:var(--gris);min-width:28px">${distribPct}%</span>
                </div>
            </td>
        </tr>`;
        }).join('');
}

function renderDetalleProductos(datos, totalGananciaGlobal) {
    const tbody = document.getElementById('tbodyGanancias');
    const tfoot = document.getElementById('tfootGanancias');
    if (!tbody) return;

    const maxGanancia = Math.max(...datos.map(d => Number(d.ganancia)));
    let totalInv = 0, totalGan = 0, totalPrecio = 0;

    tbody.innerHTML = datos
        .sort((a, b) => Number(b.ganancia) - Number(a.ganancia))
        .map((d, i) => {
            const inv = Number(d.costo_inversion);
            const gan = Number(d.ganancia);
            const precio = Number(d.precio_actual);
            const margen = inv ? (gan / inv) * 100 : 0;
            const barPct = maxGanancia ? pct(gan, maxGanancia) : 0;
            const barColor = COLORES_BAR[i % COLORES_BAR.length];
            totalInv += inv;
            totalGan += gan;
            totalPrecio += precio;
            return `<tr>
            <td data-label="#">${i + 1}</td>
            <td data-label="Producto"><div class="fw-500">${d.nombre}</div></td>
            <td data-label="Categoría"><span style="background:#f3f4f6;color:#374151;padding:.2rem .6rem;border-radius:20px;font-size:.75rem">${d.categoria}</span></td>
            <td data-label="Inversión">S/ ${inv.toFixed(2)}</td>
            <td data-label="Ganancia" class="fw-600" style="color:var(--verde)">S/ ${gan.toFixed(2)}</td>
            <td data-label="P. Venta">S/ ${precio.toFixed(2)}</td>
            <td data-label="Margen"><span class="margen-badge ${margenClase(margen)}">${margen.toFixed(1)}%</span></td>
            <td data-label="Dist." style="min-width:130px">
                <div class="d-flex align-items-center gap-2">
                    <div class="bar-wrap flex-grow-1">
                        <div class="bar-fill ${barColor}" style="width:${barPct}%"></div>
                    </div>
                    <span style="font-size:.75rem;color:var(--gris);min-width:28px">${totalGananciaGlobal ? pct(gan, totalGananciaGlobal) : 0}%</span>
                </div>
            </td>
        </tr>`;
        }).join('');

    if (tfoot) {
        const margenTotal = totalInv ? (totalGan / totalInv) * 100 : 0;
        tfoot.innerHTML = `<tr>
            <td colspan="3" class="text-end">TOTALES:</td>
            <td>S/ ${totalInv.toFixed(2)}</td>
            <td style="color:var(--verde)">S/ ${totalGan.toFixed(2)}</td>
            <td>S/ ${totalPrecio.toFixed(2)}</td>
            <td><span class="margen-badge ${margenClase(margenTotal)}">${margenTotal.toFixed(1)}%</span></td>
            <td></td>
        </tr>`;
    }
}

// inicializar el dom
document.addEventListener('DOMContentLoaded', async () => {

    // Tabs
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const key = btn.dataset.tab;
            document.getElementById('tabVentas-dia').style.display = key === 'ventas-dia' ? '' : 'none';
            document.getElementById('tabPor-categoria').style.display = key === 'por-categoria' ? '' : 'none';
        });
    });

    // Ventas del día
    function fechaHoy() {
        return new Date().toISOString().split('T')[0];
    }

    async function cargarVentasDia() {
        const fecha = document.getElementById('fechaDia').value;
        if (!fecha) return;
        const tbody = document.getElementById('tbodyVentasDia');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Cargando...</td></tr>';
        try {
            const res = await fetch(`/api/admin/pedidos?desde=${fecha}&hasta=${fecha}`, { credentials: 'include' });
            const data = await res.json();
            const pedidos = data.pedidos || [];
            const ingresos = pedidos.filter(p => p.estado !== 'cancelado').reduce((a, p) => a + Number(p.total), 0);
            document.getElementById('diaStatPedidos').textContent = pedidos.length;
            document.getElementById('diaStatIngresos').textContent = `S/ ${ingresos.toFixed(2)}`;
            document.getElementById('diaStatEntregados').textContent = pedidos.filter(p => p.estado === 'entregado').length;
            document.getElementById('diaStatCancelados').textContent = pedidos.filter(p => p.estado === 'cancelado').length;
            if (!pedidos.length) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Sin pedidos en esta fecha.</td></tr>';
                return;
            }
            const estadoMap = {
                pendiente: 'estado-pendiente', preparacion: 'estado-preparacion',
                listo: 'estado-listo', camino: 'estado-camino',
                entregado: 'estado-entregado', cancelado: 'estado-cancelado'
            };

            tbody.innerHTML = pedidos.map(p => {
                const hora = p.creado_en ? new Date(p.creado_en).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '—';
                return `<tr>
        <td data-label="N° Pedido"><code>${p.numero_pedido}</code></td>
        <td data-label="Cliente">
            <div>
                <div class="fw-500">${p.cliente || 'Invitado'}</div>
                <div class="cell-sub">${p.correo || ''}</div>
            </div>
        </td>
        <td data-label="Total" class="fw-600" style="color:var(--verde)">S/ ${Number(p.total).toFixed(2)}</td>
        <td data-label="Pago"><span class="cell-meta">${p.metodo_pago || '—'}</span></td>
        <td data-label="Estado"><span class="badge-estado ${estadoMap[p.estado] || ''}">${p.estado || '—'}</span></td>
        <td data-label="Hora" class="cell-meta">${hora}</td>
    </tr>`;
            }).join('');

        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${e.message}</td></tr>`;
        }
    }

    document.getElementById('btnCargarDia')?.addEventListener('click', cargarVentasDia);
    document.getElementById('btnHoy')?.addEventListener('click', () => {
        document.getElementById('fechaDia').value = fechaHoy();
        cargarVentasDia();
    });

    // Inicializar fecha y cargar
    const inputFecha = document.getElementById('fechaDia');
    if (inputFecha) inputFecha.value = fechaHoy();
    cargarVentasDia();

    // Ganancias por categoría
    await cargarGanancias();
});