'use strict';

function fechaLocal(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const BARS = ['bar-verde', 'bar-rosa', 'bar-azul', 'bar-dorado', 'bar-indigo', 'bar-teal', 'bar-amber', 'bar-cyan', 'bar-lime', 'bar-violet'];

//  TABS 
document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tabTop').style.display = btn.dataset.tab === 'top' ? '' : 'none';
        document.getElementById('tabPeriodo').style.display = btn.dataset.tab === 'periodo' ? '' : 'none';
    });
});

document.getElementById('btnLogout')?.addEventListener('click', async () => {
    if (!confirm('¿Cerrar sesión?')) return;
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) { console.error(e); }
    window.location.href = '/login';
});

async function cargarInfoAdmin() {
    try {
        const res = await fetch('/api/auth/sesion', { credentials: 'include' });
        const data = await res.json();
        if (data.ok && data.usuario) {
            const el = document.getElementById('adminNombre');
            const av = document.getElementById('adminAvatar');
            if (el) el.textContent = data.usuario.nombre;
            if (av) av.textContent = (data.usuario.nombre || 'A')[0].toUpperCase();
        }
    } catch (e) { console.error(e); }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1);
        document.getElementById(`tab${key}`)?.classList.add('active');
    });
});

let limitActivo = 5;

document.querySelectorAll('[data-limit]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-limit]').forEach(b => b.classList.remove('active', 'primary'));
        btn.classList.add('active', 'primary');
        limitActivo = parseInt(btn.dataset.limit, 10);
        cargarTopProductos();
    });
});


async function cargarTopProductos() {
    const tbody = document.getElementById('tbodyTopProductos');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Cargando…</td></tr>';

    try {
        const res = await fetch(`/api/admin/reportes/top-productos?limit=${limitActivo}`, { credentials: 'include' });
        const data = await res.json();

        if (!data.ok || !data.productos?.length) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Sin datos de ventas todavía.</td></tr>';
            return;
        }

        const prods = data.productos;
        const maxUnidades = Math.max(...prods.map(p => Number(p.unidades_vendidas)));
        const totalUnidades = prods.reduce((a, p) => a + Number(p.unidades_vendidas), 0);
        const totalIngresos = prods.reduce((a, p) => a + Number(p.ingresos_generados), 0);
        const totalPedidos = prods.reduce((a, p) => a + Number(p.numero_pedidos), 0);

        document.getElementById('statUnidades').textContent = totalUnidades;
        document.getElementById('statIngresos').textContent = `S/ ${totalIngresos.toFixed(2)}`;
        document.getElementById('statPedidosTop').textContent = totalPedidos;

        const rankClass = (i) => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-n';

        if (tbody) {
            tbody.innerHTML = prods.map((p, i) => {
                const unidades = Number(p.unidades_vendidas);
                const barPct = maxUnidades ? Math.round((unidades / maxUnidades) * 100) : 0;
                return `<tr>
        <td data-label="#">
            <div class="rank-num ${rankClass(i)}">${i + 1}</div>
        </td>
        <td data-label="Producto"><div class="fw-500">${p.nombre}</div></td>
        <td data-label="Precio">S/ ${Number(p.precio_actual).toFixed(2)}</td>
        <td data-label="Unidades" class="fw-600">${unidades}</td>
        <td data-label="Ingresos" class="fw-600" style="color:var(--verde)">S/ ${Number(p.ingresos_generados).toFixed(2)}</td>
        <td data-label="Pedidos">${p.numero_pedidos}</td>
        <td data-label="Tendencia" style="min-width:150px">
            <div class="d-flex align-items-center gap-2">
                <div class="bar-wrap flex-grow-1">
                    <div class="bar-fill ${BARS[i % BARS.length]}" style="width:${barPct}%"></div>
                </div>
                <span style="font-size:.75rem;color:var(--gris)">${barPct}%</span>
            </div>
        </td>
    </tr>`;
            }).join('');
        }

    } catch (err) {
        console.error('Error top productos:', err);
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Error al cargar datos.</td></tr>';
    }
}

//  VENTAS POR PERÍODO
let rangoActivoDias = 30;

document.querySelectorAll('[data-rango]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-rango]').forEach(b => {
            b.classList.remove('active');
            b.className = 'btn-admin-secondary';
        });
        btn.className = 'btn-admin-primary active';
        rangoActivoDias = parseInt(btn.dataset.rango, 10);
        const hasta = new Date();
        const desde = new Date();
        desde.setDate(desde.getDate() - rangoActivoDias);
        document.getElementById('fechaDesde').value = fechaLocal(desde);
        document.getElementById('fechaHasta').value = fechaLocal(hasta);
        cargarVentasPeriodo();
    });
});

document.getElementById('btnFiltrarPeriodo')?.addEventListener('click', () => {
    document.querySelectorAll('[data-rango]').forEach(b => b.classList.remove('active'));
    cargarVentasPeriodo();
});

async function cargarVentasPeriodo() {
    const tbody = document.getElementById('tbodyPeriodo');
    const tfoot = document.getElementById('tfootPeriodo');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Cargando…</td></tr>';

    const desde = document.getElementById('fechaDesde')?.value;
    const hasta = document.getElementById('fechaHasta')?.value;
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);

    try {
        const res = await fetch(`/api/admin/reportes/ventas?${params.toString()}`, { credentials: 'include' });
        const data = await res.json();
        if (!data.ok) throw new Error(data.mensaje);

        const ventas = data.ventas || [];
        const totales = data.totales || {};

        document.getElementById('statTotalPedidos').textContent = totales.total_pedidos || 0;
        document.getElementById('statIngresosTotal').textContent = `S/ ${Number(totales.ingresos_totales || 0).toFixed(2)}`;
        document.getElementById('statInversionTotal').textContent = `S/ ${Number(totales.inversion_total || 0).toFixed(2)}`;
        document.getElementById('statGananciaNeta').textContent = `S/ ${Number(totales.ganancia_total || 0).toFixed(2)}`;

        const totalEntregados = ventas.reduce((a, v) => a + Number(v.entregados || 0), 0);
        const totalCancelados = ventas.reduce((a, v) => a + Number(v.cancelados || 0), 0);
        document.getElementById('statEntregados').textContent = totalEntregados;
        document.getElementById('statCancelados').textContent = totalCancelados;

        if (!ventas.length) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Sin ventas en el período seleccionado.</td></tr>';
            if (tfoot) tfoot.innerHTML = '';
            return;
        }

        const maxIngresos = Math.max(...ventas.map(v => Number(v.ingresos)));

        if (tbody) {
            tbody.innerHTML = ventas.map(v => {
                const ingresos = Number(v.ingresos);
                const barPct = maxIngresos ? Math.round((ingresos / maxIngresos) * 100) : 0;
                const fecha = new Date(v.fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short' });
                return `<tr>
        <td data-label="Fecha"><strong>${fecha}</strong></td>
        <td data-label="Pedidos">${v.total_pedidos}</td>
        <td data-label="Entregados"><span class="badge-estado estado-entregado">${v.entregados || 0}</span></td>
        <td data-label="Cancelados"><span class="badge-estado estado-cancelado">${v.cancelados || 0}</span></td>
        <td data-label="Ingresos" class="fw-600" style="color:var(--verde)">S/ ${ingresos.toFixed(2)}</td>
        <td data-label="Tendencia" style="min-width:140px">
            <div class="d-flex align-items-center gap-2">
                <div class="bar-wrap flex-grow-1">
                    <div class="bar-fill bar-verde" style="width:${barPct}%"></div>
                </div>
                <span style="font-size:.75rem;color:var(--gris)">${barPct}%</span>
            </div>
        </td>
    </tr>`;
            }).join('');
        }

        if (tfoot) {
            const totalPedidos2 = ventas.reduce((a, v) => a + Number(v.total_pedidos || 0), 0);
            const totalIngresos2 = ventas.reduce((a, v) => a + Number(v.ingresos || 0), 0);
            tfoot.innerHTML = `<tr class="total-row">
                <td>TOTALES (${ventas.length} días)</td>
                <td>${totalPedidos2}</td>
                <td>${totalEntregados}</td>
                <td>${totalCancelados}</td>
                <td style="color:var(--verde)">S/ ${totalIngresos2.toFixed(2)}</td>
                <td></td>
            </tr>`;
        }

    } catch (err) {
        console.error('Error ventas período:', err);
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Error al cargar datos.</td></tr>';
    }
}

// inicializar el dom
document.addEventListener('DOMContentLoaded', async () => {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);
    document.getElementById('fechaDesde').value = fechaLocal(hace30);
    document.getElementById('fechaHasta').value = fechaLocal(hoy);

    await cargarTopProductos();
    await cargarVentasPeriodo();
});