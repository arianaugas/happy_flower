'use strict';

//  SIDEBAR TOGGLE 
(function () {
    const sidebar = document.getElementById('adminSidebar');
    const btnToggle = document.getElementById('btnToggleSidebar');
    const content = document.querySelector('.admin-content');
    if (!sidebar || !btnToggle) return;

    // Overlay para móvil 
    const overlay = document.getElementById('sidebarOverlay');

    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    function isMobile() {
        return window.innerWidth <= 1024;
    }

    function openMobile() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        btnToggle.setAttribute('aria-expanded', 'true');
    }
    function closeMobile() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        btnToggle.setAttribute('aria-expanded', 'false');
    }
    function toggleDesktop() {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        if (content) content.classList.toggle('sidebar-collapsed', isCollapsed);
        btnToggle.setAttribute('aria-expanded', String(!isCollapsed));
        localStorage.setItem('adminSidebarCollapsed', isCollapsed ? '1' : '0');
    }

    btnToggle.addEventListener('click', () => {
        if (isMobile()) {
            sidebar.classList.contains('open') ? closeMobile() : openMobile();
        } else {
            toggleDesktop();
        }
    });

    // Cerrar móvil al tocar overlay
    overlay.addEventListener('click', closeMobile);

    // Cerrar móvil con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMobile() && sidebar.classList.contains('open')) {
            closeMobile();
        }
    });

    // Al cambiar tamaño: limpiar estados cruzados
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeMobile();
        } else {
            sidebar.classList.remove('collapsed');
            if (content) content.classList.remove('sidebar-collapsed');
        }
    });

    // Restaurar preferencia desktop al cargar
    if (window.innerWidth > 1024 && localStorage.getItem('adminSidebarCollapsed') === '1') {
        sidebar.classList.add('collapsed');
        if (content) content.classList.add('sidebar-collapsed');
    }
})();

//  LOGOUT 
document.getElementById('btnLogout')?.addEventListener('click', async () => {
    if (!confirm('¿Cerrar sesión?')) return;
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (e) { console.error(e); }
    window.location.href = '/login';
});

//  MOSTRAR NOMBRE ADMIN EN TOPBAR 
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
    } catch (e) { console.error('Error cargando admin:', e); }
}

// inicializar el dom
document.addEventListener('DOMContentLoaded', async () => {
    await cargarInfoAdmin();
});