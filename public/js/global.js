
'use strict';
//  CARRITO 
function _carritoKey() {
    // Clave única por usuario; invitados comparten 'carrito_flores:guest'
    try {
        const raw = sessionStorage.getItem('_hf_uid');
        return raw ? `carrito_flores:${raw}` : 'carrito_flores:guest';
    } catch (e) {
        return 'carrito_flores:guest';
    }
}
function getCarrito() {
    return JSON.parse(localStorage.getItem(_carritoKey())) || [];
}
function setCarrito(c) {
    localStorage.setItem(_carritoKey(), JSON.stringify(c));
}
function actualizarBadgeCarrito() {
    const total = getCarrito().reduce((a, i) => a + i.cantidad, 0);
    document.querySelectorAll('.cart-badge').forEach(b => b.textContent = total);
    const badgeSidebar = document.querySelector('.sidebar .badge.text-bg-danger');
    if (badgeSidebar) badgeSidebar.textContent = total;
}

//  TOAST CAMBIO DE ESTADO PEDIDO 
function mostrarToastEstadoPedido(numeroPedido, estado) {
    const iconos = {
        pendiente: '⏳',
        preparacion: '👨‍🍳',
        listo: '✅',
        camino: '🚚',
        entregado: '🎉',
        cancelado: '❌',
    };

    let toast = document.getElementById('toastEstadoPedido');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastEstadoPedido';
        toast.style.cssText = `
      position:fixed;bottom:80px;right:20px;
      background:#1a1a2e;color:#fff;
      padding:14px 18px;border-radius:12px;
      font-size:.9rem;z-index:9999;
      opacity:0;transition:opacity .4s;
      box-shadow:0 6px 24px rgba(0,0,0,.35);
      border-left:4px solid #2d6a4f;
      max-width:320px;line-height:1.5;
      cursor:pointer;
    `;
        toast.onclick = () => { window.location.href = '/pedidos'; };
        document.body.appendChild(toast);
    }

    const icono = iconos[estado] || '📦';
    toast.innerHTML = `
    <div style="font-size:.75rem;color:#aaa;margin-bottom:3px">Actualización de pedido</div>
    <div><strong>${icono} Se actualizó el estado de tu pedido</strong></div>
    <div style="font-size:.82rem;margin-top:4px;color:#ccc">
      Pedido <strong style="color:#a8d8a8">${numeroPedido}</strong>
      → <strong style="color:#fff">${estado}</strong>
    </div>
    <div style="font-size:.72rem;color:#888;margin-top:5px">Toca para ver tus pedidos</div>
  `;

    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 6000);
}

//  VERIFICAR CAMBIOS DE ESTADO EN PEDIDOS 
async function verificarCambiosEstadoPedidos() {
    try {
        const res = await fetch('/api/auth/sesion');
        const data = await res.json();
        if (!data.ok || !data.usuario?.id_usuario) return; // solo usuarios logueados

        const resP = await fetch('/api/pedidos/mis', { credentials: 'include' });
        const dataP = await resP.json();
        if (!dataP.ok || !dataP.pedidos?.length) return;

        const guardados = JSON.parse(localStorage.getItem('hf_estados_pedidos') || '{}');
        const nuevosGuardados = { ...guardados };
        let toastMostrado = false;

        dataP.pedidos.forEach((p) => {
            const key = String(p.id_pedido || p.numero_pedido);
            const previo = guardados[key];
            const actual = p.estado;

            // Si existe registro previo Y cambió → notificar (solo 1 toast a la vez)
            if (previo && previo !== actual && !toastMostrado) {
                mostrarToastEstadoPedido(p.numero_pedido, actual);
                toastMostrado = true;
            }

            nuevosGuardados[key] = actual;
        });

        // Actualizar localStorage con estados frescos
        localStorage.setItem('hf_estados_pedidos', JSON.stringify(nuevosGuardados));

    } catch (e) { /* sin sesión */ }
}

//  SIDEBAR 
function iniciarSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const btnAbrir = document.querySelector('.sidebar-toggle');
    const btnCerrar = document.querySelector('.sidebar-close');

    function abrir() { sidebar?.classList.add('open'); overlay?.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function cerrar() { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow = ''; }

    btnAbrir?.addEventListener('click', abrir);
    btnCerrar?.addEventListener('click', cerrar);
    overlay?.addEventListener('click', cerrar);
}

//  SESIÓN EN NAV + SIDEBAR
async function mostrarSesionNav() {
    try {
        const res = await fetch('/api/auth/sesion');
        const data = await res.json();
        const usuarioLogueado = data.ok && data.usuario?.id_usuario;
        if (usuarioLogueado && data.usuario?.id_usuario) {
            const uid = String(data.usuario.id_usuario);
            const uidAnterior = sessionStorage.getItem('_hf_uid');

            if (uidAnterior && uidAnterior !== uid) {
                // si el usuario diferente se logueó en esta misma pestaña — limpiar todo del anterior
                localStorage.removeItem('pedidos_invitado');
                localStorage.removeItem(`carrito_flores:${uidAnterior}`);
            }

            sessionStorage.setItem('_hf_uid', uid);
        } else {
            sessionStorage.removeItem('_hf_uid');
        }

        const esAdmin = usuarioLogueado && data.usuario.id_rol === 2;

        // NAV principal
        const navList = document.querySelector('.navbar-nav');
        let liNav = document.getElementById('liNavSesion');
        if (!liNav && navList) {
            liNav = document.createElement('li');
            liNav.className = 'nav-item';
            liNav.id = 'liNavSesion';
            navList.appendChild(liNav);
        }
        if (liNav) {
            if (usuarioLogueado) {
                liNav.innerHTML = esAdmin
                    ? `<div class="d-flex align-items-center gap-2">
                           <a class="nav-link nav-link-main" href="/admin"
                              style="background:rgba(45,106,79,.18);border-radius:6px;padding:4px 10px;font-size:.82rem">
                               <i class="bi bi-shield-lock-fill me-1"></i>Administración
                           </a>
                           <a class="nav-link nav-link-main" href="/admin">
                               <i class="bi bi-person-circle me-1"></i>${data.usuario.nombre}
                           </a>
                       </div>`
                    : `<a class="nav-link nav-link-main" href="/pedidos">
                           <i class="bi bi-person-circle me-1"></i>${data.usuario.nombre}
                       </a>`;
            } else {
                liNav.innerHTML = `<a class="nav-link nav-link-main" href="/login">
                    <i class="bi bi-person me-1"></i>Iniciar sesión</a>`;
            }
        }

        // SIDEBAR
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        document.getElementById('sidebarBtnSesion')?.remove();

        const divSesion = document.createElement('div');
        divSesion.id = 'sidebarBtnSesion';
        divSesion.style.cssText = 'padding: 0 12px 12px;';

        if (usuarioLogueado) {
            divSesion.innerHTML = `
                <div class="sidebar-section-title" style="padding:12px 12px 4px">Cuenta</div>
                ${esAdmin ? `
                <a href="/admin" style="
                    display:flex;align-items:center;padding:10px 12px;
                    color:var(--verde,#2d6a4f);font-size:.9rem;
                    text-decoration:none;border-radius:8px;transition:background .2s;
                    background:rgba(45,106,79,.1)"
                    onmouseover="this.style.background='rgba(45,106,79,.2)'"
                    onmouseout="this.style.background='rgba(45,106,79,.1)'">
                    <i class="bi bi-shield-lock-fill me-2"></i>Panel Administración
                </a>` : ''}
                <div style="padding:8px 12px;font-size:.85rem;color:#aaa">
                    <i class="bi bi-person-circle me-1"></i>${data.usuario.nombre}
                </div>
                <button id="btnCerrarSesionSidebar" style="
                    width:100%;text-align:left;background:transparent;border:none;
                    padding:10px 12px;color:#e57373;font-size:.9rem;cursor:pointer;
                    border-radius:8px;transition:background .2s"
                    onmouseover="this.style.background='rgba(229,115,115,.12)'"
                    onmouseout="this.style.background='transparent'">
                    <i class="bi bi-box-arrow-left me-2"></i>Cerrar sesión
                </button>`;
        } else {
            divSesion.innerHTML = `
                <div class="sidebar-section-title" style="padding:12px 12px 4px">Cuenta</div>
                <a href="/login" style="
                    display:block;padding:10px 12px;color:var(--verde,#2d6a4f);
                    font-size:.9rem;text-decoration:none;border-radius:8px;transition:background .2s"
                    onmouseover="this.style.background='rgba(45,106,79,.1)'"
                    onmouseout="this.style.background='transparent'">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
                </a>`;
        }

        const lastDivider = sidebar.querySelector('hr.sidebar-divider:last-of-type');
        if (lastDivider) sidebar.insertBefore(divSesion, lastDivider);
        else sidebar.appendChild(divSesion);

        /*document.getElementById('btnCerrarSesionSidebar')?.addEventListener('click', async () => {
            if (!confirm('¿Cerrar sesión?')) return;
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (e) { }

            // Limpiar datos de sesión del localStorage
            const uid = sessionStorage.getItem('_hf_uid');
            if (uid) {
                localStorage.removeItem(`carrito_flores:${uid}`);
            }
            // Limpiar pedidos locales de invitado (ya no aplican a este usuario)
            //localStorage.removeItem('pedidos_invitado');
            sessionStorage.removeItem('_hf_uid');

            window.location.href = '/login';
        });*/

        document.getElementById('btnCerrarSesionSidebar')?.addEventListener('click', async () => {
            if (!confirm('¿Cerrar sesión?')) return;
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (e) { }

            // NO borrar el carrito del usuario — debe persistir al volver a iniciar sesión
            sessionStorage.removeItem('_hf_uid');

            window.location.href = '/login';
        });

    } catch (e) { /* sin sesión */ }
}

//  TOAST CARRITO 
function mostrarToast(msg) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.style.cssText = `position:fixed;bottom:80px;right:20px;background:#2d6a4f;color:#fff;
            padding:10px 18px;border-radius:8px;font-size:.9rem;z-index:9999;
            opacity:0;transition:opacity .3s;box-shadow:0 4px 15px rgba(0,0,0,.2)`;
        document.body.appendChild(toast);
    }
    toast.textContent = '🛍 ' + msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

//  BACK TO TOP 
function iniciarBackTop() {
    const btn = document.getElementById('backTop');
    window.addEventListener('scroll', () => btn?.classList.toggle('visible', window.scrollY > 300));
    btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

//  INIT COMPARTIDO 
function initShared() {
    iniciarSidebar();
    actualizarBadgeCarrito();
    mostrarSesionNav();
    verificarCambiosEstadoPedidos();
    iniciarBackTop();
}