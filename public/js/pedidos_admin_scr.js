"use strict";

let pedidoActivoId = null;

function formatFecha(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("es-PE") +
    " " +
    d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  );
}

function badgeEstado(estado) {
  return `<span class="status-badge status-${estado || "pendiente"}">${estado || "pendiente"}</span>`;
}

async function cargarPedidosAdmin() {
  const tbody = document.getElementById("tbodyPedidosAdmin");
  if (!tbody) return;

  tbody.innerHTML =
    '<tr><td colspan="7" class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm me-2"></span>Cargando pedidos…</td></tr>';

  const estado = document.getElementById("filtroEstadoPedido")?.value || "";
  const desde = document.getElementById("filtroDesde")?.value || "";
  const hasta = document.getElementById("filtroHasta")?.value || "";

  const params = new URLSearchParams();
  if (estado) params.append("estado", estado);
  if (desde) params.append("desde", desde);
  if (hasta) params.append("hasta", hasta);

  try {
    const res = await fetch(`/api/admin/pedidos?${params.toString()}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!data.ok || !data.pedidos?.length) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center text-muted py-4">No se encontraron pedidos.</td></tr>';
      const countEl = document.getElementById("pedidosCount");
      if (countEl) countEl.textContent = "0 pedidos";
      return;
    }

    tbody.innerHTML = data.pedidos
      .map(p => `
        <tr>
            <td data-label="N° Pedido"><code class="fw-600">${p.numero_pedido}</code></td>
            <td data-label="Cliente">
                <div>
                    <div class="fw-500">${p.cliente || 'Sin nombre'}</div>
                    <div style="font-size:.78rem;color:var(--gris)">${p.correo || ''}</div>
                </div>
            </td>
            <td data-label="Total" class="fw-600">S/ ${Number(p.total || 0).toFixed(2)}</td>
            <td data-label="Pago">
                <span class="pago-badge pago-${(p.metodo_pago || '').toLowerCase()}">
                    <i class="bi bi-${p.metodo_pago === 'yape' ? 'phone' : 'credit-card'} me-1"></i>
                    ${p.metodo_pago || '—'}
                </span>
            </td>
            <td data-label="Estado">${badgeEstado(p.estado)}</td>
            <td data-label="Fecha" style="font-size:.82rem">${formatFecha(p.creado_en)}</td>
            <td>
                <button class="btn-admin-sm" onclick="abrirDetallePedido(${p.id_pedido})">
                    <i class="bi bi-eye"></i><span class="d-none d-sm-inline ms-1">Ver</span>
                </button>
            </td>
        </tr>
    `).join('');

    const countEl = document.getElementById("pedidosCount");
    if (countEl) countEl.textContent = `${data.pedidos.length} pedido${data.pedidos.length !== 1 ? 's' : ''}`;

  } catch (err) {
    console.error("Error cargando pedidos admin:", err);
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-danger py-4">Error al cargar pedidos.</td></tr>';
  }
}


window.abrirDetallePedido = async function (id) {
  pedidoActivoId = id;
  const modalEl = document.getElementById("modalPedidoAdmin");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const body = document.getElementById("modalPedidoBody");

  body.innerHTML =
    '<p class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm me-2"></span>Cargando detalle…</p>';
  modal.show();

  try {
    const res = await fetch(`/api/pedidos/${id}`, { credentials: "include" });
    const data = await res.json();
    if (!data.ok) throw new Error(data.mensaje);

    const p = data.pedido;

    const cliente = p.nombre_usuario || p.nombre_invitado || "Invitado";
    const correo = p.correo_usuario || p.correo_invitado || "—";
    const tel = p.telefono_usuario || p.telefono_invitado || "—";

    //
    const itemsHtml = (data.items || [])
      .map((i) => {
        const subtotal = Number(
          i.subtotal || i.precio_unit * i.cantidad,
        ).toFixed(2);
        const img = i.imagen
          ? i.imagen.startsWith("http")
            ? i.imagen
            : i.imagen
          : null;

        const imgHtml = img
          ? `<img src="${img}" alt="${i.nombre}" class="pedido-item-img"
               onerror="this.style.display='none'">`
          : `<div class="pedido-item-img-placeholder">
               <i class="bi bi-image"></i>
           </div>`;

        return `<div class="pedido-item">
        ${imgHtml}
        <div class="pedido-item-info">
            <div class="pedido-item-nombre">${i.nombre}</div>
            <div class="pedido-item-meta">
                Cant: ${i.cantidad} &nbsp;·&nbsp;
                P. Unit: S/ ${Number(i.precio_unit).toFixed(2)}
            </div>
        </div>
        <div class="pedido-item-subtotal">S/ ${subtotal}</div>
    </div>`;
      })
      .join("");

    const trackingHtml = (data.tracking || [])
      .map(
        (t) => `
            <li class="tracking-item">
                <span class="status-badge status-${t.estado}">${t.estado}</span>
                <span class="ms-2 text-muted" style="font-size:.8rem">${formatFecha(t.registrado_en)}</span>
                ${t.descripcion ? `<p class="mb-0 mt-1" style="font-size:.82rem">${t.descripcion}</p>` : ""}
            </li>
        `,
      )
      .join("");

    const selectEstado = document.getElementById("nuevoEstadoPedido");
    if (selectEstado) selectEstado.value = p.estado || "pendiente";

    body.innerHTML = `
    <!-- CLIENTE + INFO PEDIDO -->
    <div class="row g-3 mb-3">
        <div class="col-md-6">
            <div class="detail-section">
                <h6 class="detail-section-title"><i class="bi bi-person me-1"></i>Cliente</h6>
                <p class="mb-1 fw-500">${cliente}</p>
                <p class="mb-1 text-muted" style="font-size:.85rem">
                    <i class="bi bi-envelope me-1"></i>${correo}
                </p>
                <p class="mb-0 text-muted" style="font-size:.85rem">
                    <i class="bi bi-telephone me-1"></i>${tel}
                </p>
            </div>
        </div>
        <div class="col-md-6">
            <div class="detail-section">
                <h6 class="detail-section-title"><i class="bi bi-info-circle me-1"></i>Info del pedido</h6>
                <p class="mb-1"><span class="text-muted">N° Pedido:</span>
                    <code style="color:var(--rosa)">${p.numero_pedido}</code>
                </p>
                <p class="mb-1"><span class="text-muted">Pago:</span>
                    <span class="pago-badge pago-${(p.metodo_pago || "").toLowerCase()} ms-1">
                        ${p.metodo_pago || "—"}
                    </span>
                </p>
                <p class="mb-1"><span class="text-muted">Voucher:</span>
                    <code>${p.numero_voucher || "—"}</code>
                </p>
                <p class="mb-0"><span class="text-muted">Dirección:</span> ${p.direccion_entrega}</p>
            </div>
        </div>
    </div>

    <!-- ↓ AQUÍ VA LA SECCIÓN DE PRODUCTOS ↓ -->
    <div class="detail-section mb-3">
        <h6 class="detail-section-title">
            <i class="bi bi-bag me-1"></i>Productos
        </h6>
        <div class="pedido-items-wrap">
            ${itemsHtml}
            <div class="pedido-items-total">
                <span class="pedido-items-total-label">Total:</span>
                <span class="pedido-items-total-valor">
                    S/ ${Number(p.total).toFixed(2)}
                </span>
            </div>
        </div>
    </div>

    <!-- HISTORIAL -->
    ${trackingHtml
        ? `
    <div class="detail-section">
        <h6 class="detail-section-title">
            <i class="bi bi-clock-history me-1"></i>Historial de estados
        </h6>
        <ul class="tracking-list">${trackingHtml}</ul>
    </div>`
        : ""
      }
`;
  } catch (err) {
    console.error("Error detalle pedido:", err);
    body.innerHTML =
      '<p class="text-center text-danger py-3">Error al cargar el detalle.</p>';
  }
};


document
  .getElementById("btnActualizarEstado")
  ?.addEventListener("click", async () => {
    if (!pedidoActivoId) return;
    const estado = document.getElementById("nuevoEstadoPedido")?.value;
    const descripcion =
      document.getElementById("descripcionEstado")?.value?.trim() || "";

    if (!estado) {
      alert("Selecciona un estado.");
      return;
    }

    const btn = document.getElementById("btnActualizarEstado");
    btn.disabled = true;
    btn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1"></span>Actualizando…';

    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoActivoId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado, descripcion }),
      });
      const data = await res.json();

      if (data.ok) {
        bootstrap.Modal.getInstance(
          document.getElementById("modalPedidoAdmin"),
        )?.hide();
        await cargarPedidosAdmin();
        mostrarToastEstado(estado);

        // Si se canceló, notificar visualmente que el stock fue repuesto
        if (estado === "cancelado") {
          setTimeout(() => {
            const toastEl = document.getElementById("toastEstado");
            const toastMsg = document.getElementById("toastMensaje");
            if (toastEl && toastMsg) {
              toastEl.className = "toast align-items-center border-0 bg-info text-dark";
              toastMsg.textContent = "Stock repuesto automáticamente en el inventario.";
              new bootstrap.Toast(toastEl, { delay: 4000 }).show();
            }
          }, 1000);
        }
      } else {
        alert(data.mensaje || "Error al actualizar.");
      }
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("Error de conexión.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Actualizar';
    }
});


function mostrarToastEstado(estado) {
  const colores = {
    pendiente: "bg-warning text-dark",
    preparacion: "bg-info text-dark",
    listo: "bg-primary",
    camino: "bg-secondary",
    entregado: "bg-success",
    cancelado: "bg-danger",
  };
  const toastEl = document.getElementById("toastEstado");
  const toastMsg = document.getElementById("toastMensaje");
  if (!toastEl || !toastMsg) return;
  toastEl.className = "toast align-items-center border-0";
  toastEl.classList.add(
    ...(colores[estado] || "bg-secondary text-white").split(" "),
  );
  toastMsg.textContent = `Se actualizó el estado del pedido: ${estado}`;
  new bootstrap.Toast(toastEl, { delay: 4500 }).show();
}


document
  .getElementById("btnFiltrarPedidos")
  ?.addEventListener("click", cargarPedidosAdmin);

document.getElementById("btnLimpiarFiltros")?.addEventListener("click", () => {
  document.getElementById("filtroEstadoPedido").value = "";
  document.getElementById("filtroDesde").value = "";
  document.getElementById("filtroHasta").value = "";
  cargarPedidosAdmin();
});

document.getElementById("buscarPedido")?.addEventListener("input", function () {
  const txt = this.value.toLowerCase();
  document.querySelectorAll("#tbodyPedidosAdmin tr").forEach((tr) => {
    tr.style.display = tr.textContent.toLowerCase().includes(txt) ? "" : "none";
  });
});
const MENSAJES_ESTADO = {
  pendiente: "Tu pedido ha sido recibido y está en espera de confirmación.",
  preparacion: "¡Estamos preparando tu pedido con mucho cuidado!",
  listo: "¡Tu pedido está listo! Pronto saldrá camino hacia ti.",
  camino: "Tu pedido ya está en camino, el repartidor está en ruta.",
  entregado: "¡Tu pedido fue entregado! Esperamos que lo disfrutes mucho.",
  cancelado:
    "Tu pedido fue cancelado. Contáctanos por WhatsApp si necesitas ayuda.",
};

//  Autorellenar nota al cambiar el estado 
document
  .getElementById("nuevoEstadoPedido")
  ?.addEventListener("change", function () {
    const nota = document.getElementById("descripcionEstado");
    if (nota) nota.value = MENSAJES_ESTADO[this.value] || "";
  });



// Auto-refresh de pedidos cada 45 segundos
let pedidosRefreshInterval = null;

function iniciarAutoRefreshPedidos() {
  if (pedidosRefreshInterval) clearInterval(pedidosRefreshInterval);
  pedidosRefreshInterval = setInterval(() => {
    const modalAbierto = document.querySelector(".modal.show");
    if (!modalAbierto) {
      cargarPedidosAdmin();
    }
  }, 45000);
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarPedidosAdmin();
  iniciarAutoRefreshPedidos();
});
