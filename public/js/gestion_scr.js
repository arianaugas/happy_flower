'use strict';

// ESTADÍSTICAS DEL DASHBOARD
async function cargarResumen() {
    try {
        const res  = await fetch('/api/admin/gestion');
        const data = await res.json();
        if (!data.ok) throw new Error(data.mensaje);

        // ← corregido: pedidos_hoy, ventas_hoy, productos_activos (snake_case)
        document.getElementById('statPedidosHoy').textContent  = data.resumen.pedidos_hoy ?? 0;
        document.getElementById('statVentasHoy').textContent   = `S/ ${parseFloat(data.resumen.ventas_hoy || 0).toFixed(2)}`;
        document.getElementById('statProductos').textContent   = data.resumen.productos_activos ?? 0;
        document.getElementById('statClientes').textContent    = data.resumen.clientes ?? 0;
    } catch (e) {
        console.error('Error resumen:', e);
    }
}

// PEDIDOS RECIENTES
async function cargarPedidosRecientes() {
    const tbody = document.getElementById('tbodyPedidos');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3"><span class="spinner-border spinner-border-sm me-2"></span>Cargando...</td></tr>';

    try {
        const res  = await fetch('/api/admin/gestion/recientes');
        const data = await res.json();
        if (!data.ok) throw new Error(data.mensaje);

        if (!data.pedidos?.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Sin pedidos recientes.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.pedidos.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><code>${p.numero_pedido}</code></td>
                    <td>${p.cliente || 'Invitado'}</td>
                    <td>S/ ${parseFloat(p.total).toFixed(2)}</td>
                    <td><span class="status-badge status-${p.estado || 'pendiente'}">${p.estado || 'pendiente'}</span></td>
                    <td>${p.creado_en ? new Date(p.creado_en).toLocaleString('es-PE') : 'Sin fecha'}</td>
                    <td>
                        <a href="/admin/pedidos" class="btn-admin-sm">
                            <i class="bi bi-eye me-1"></i>Ver
                        </a>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">${e.message}</td></tr>`;
    }
}


// inicializar el dom
document.addEventListener('DOMContentLoaded', () => {
    cargarResumen();
    cargarPedidosRecientes();
});