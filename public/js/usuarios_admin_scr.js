'use strict';

let usuarioEditando = null;

const modalEl = document.getElementById('modalUsuario');

const bsModal = modalEl
    ? new bootstrap.Modal(modalEl)
    : null;

// CARGAR USUARIOS
async function cargarUsuarios(buscar = '', rol = '') {
    const tbody = document.getElementById('tbodyUsuarios');
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-3">
                Cargando...
            </td>
        </tr>
    `;
    try {
        const res = await fetch('/api/admin/usuarios');
        const data = await res.json();
        if (!data.ok) {
            throw new Error(data.mensaje);
        }
        let usuarios = data.usuarios;
        // BUSCAR 
        if (buscar) {
            const texto = buscar.toString().toLowerCase();
            usuarios = usuarios.filter(u => {
                const nombreCompleto = `
                    ${u.nombre || ''}
                    ${u.apellido || ''}
                `.toLowerCase();
                const correo = (u.correo || '').toLowerCase();
                return (
                    nombreCompleto.includes(texto) ||
                    correo.includes(texto)
                );
            });
        }

        // FILTRO ROL 
        if (rol) {
            usuarios = usuarios.filter(u => {
                const rolUsuario = (u.rol || '').toLowerCase();
                if (rol === 'admin') {
                    return rolUsuario === 'admin';
                }
                return (
                    rolUsuario === 'usuario' ||
                    rolUsuario === 'cliente'
                );
            });
        }

        //  SIN RESULTADOS 
        if (usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        Sin resultados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';
        usuarios.forEach((u, i) => {
            tbody.innerHTML += `
    <tr>
        <td data-label="#">${i + 1}</td>
        <td data-label="Nombre">${u.nombre || ''} ${u.apellido || ''}</td>
        <td data-label="Correo">${u.correo || '—'}</td>
        <td data-label="Teléfono">${u.telefono || '—'}</td>
        <td data-label="Rol">
            <span class="badge ${(u.rol || '').toLowerCase() === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}">
                ${(u.rol || '').toLowerCase() === 'admin' ? 'Admin' : 'Cliente'}
            </span>
        </td>
        <td data-label="Estado">
            <span class="badge ${u.activo ? 'bg-success' : 'bg-danger'}">
                ${u.activo ? 'Activo' : 'Inactivo'}
            </span>
        </td>
        <td data-label="Registro">${formatearFecha(u.fecha_registro)}</td>
        <td>
            <div class="d-flex gap-1 justify-content-end">
                <button type="button" class="btn-admin-sm primary" onclick="editarUsuario(${u.id_usuario})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn-admin-sm danger" onclick="eliminarUsuario(${u.id_usuario}, '${u.nombre}')">
                    <i class="bi bi-person-x"></i>
                </button>
            </div>
        </td>
    </tr>`;
        });
    } catch (e) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-danger text-center">
                    ${e.message}
                </td>
            </tr>
        `;
    }
}


// FORMATEAR FECHA
function formatearFecha(fecha) {
    if (!fecha) return '—';
    return new Date(fecha)
        .toLocaleDateString('es-PE');
}


// NUEVO USUARIO
document.getElementById('btnNuevoUsuario')
    ?.addEventListener('click', () => {

        usuarioEditando = null;

        limpiarModal();

        document.getElementById('modalUsuarioLabel')
            .textContent = 'Nuevo usuario';

        document.getElementById('campoActivo')
            .style.display = 'none';

        bsModal.show();
    });


//EDITAR USUARIO
window.editarUsuario = async function (id) {

    try {
        const res = await fetch('/api/admin/usuarios');
        const data = await res.json();
        if (!data.ok) {
            throw new Error(data.mensaje);
        }
        const u = data.usuarios.find(
            x => x.id_usuario == id
        );
        if (!u) {
            alert('Usuario no encontrado');
            return;
        }
        usuarioEditando = id;
        document.getElementById('modalUsuarioLabel').textContent = 'Editar usuario';
        document.getElementById('usrNombre').value =u.nombre || '';
        document.getElementById('usrApellido').value =u.apellido || '';

        document.getElementById('usrCorreo').value =u.correo || '';

        document.getElementById('usrTelefono').value =u.telefono || '';

        //ROL 
        document.getElementById('usrRol').value =
            (u.rol || '').toLowerCase() === 'admin'
                ? '2'
                : '1';

        //ACTIVO 
        document.getElementById('campoActivo')
            .style.display = 'block';
        document.getElementById('usrActivo').checked =
            !!u.activo;
        bsModal.show();

    } catch (e) {
        alert('Error al cargar usuario');
    }
};


// GUARDAR USUARIO
document.getElementById('btnGuardarUsuario')
    ?.addEventListener('click', async function () {
        const nombre = document.getElementById('usrNombre').value.trim();
        const apellido = document.getElementById('usrApellido').value.trim();
        const correo = document.getElementById('usrCorreo').value.trim().toLowerCase();
        const telefono = document.getElementById('usrTelefono').value.trim();
        const contrasena = document.getElementById('usrContrasena').value;
        const id_rol = document.getElementById('usrRol').value;
        const activo = document.getElementById('usrActivo')?.checked;
        //  VALIDAR 
        if (!nombre || !correo) {
            alert('Nombre y correo son obligatorios');
            return;
        }

        //  VALIDAR CONTRASEÑA 
        if (!usuarioEditando && contrasena.length < 6) {
            alert('La contraseña debe tener mínimo 6 caracteres');
            return;
        }

        //  VALIDAR CORREO REPETIDO 
        try {
            const resUsuarios = await fetch('/api/admin/usuarios');
            const dataUsuarios = await resUsuarios.json();
            if (dataUsuarios.ok) {
                const repetido = dataUsuarios.usuarios.find(u =>
                    (u.correo || '').toLowerCase() === correo &&
                    u.id_usuario != usuarioEditando
                );
                if (repetido) {
                    alert('Ya existe un usuario con ese correo');
                    return;
                }
            }

        } catch (e) {
            alert('Error validando usuarios');
            return;
        }

        const body = {
            nombre,
            apellido,
            correo,
            telefono,
            contrasena,
            id_rol,
            activo
        };

        try {
            const url = usuarioEditando
                ? `/api/admin/usuarios/${usuarioEditando}`
                : '/api/admin/usuarios';

            const method = usuarioEditando
                ? 'PUT'
                : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (data.ok) {
                document.activeElement?.blur();
                bsModal.hide();
                cargarUsuarios();

            } else {
                alert(data.mensaje || 'Error');
            }

        } catch (e) {
            alert('Error de conexión');
        }
});


// ELIMINAR
window.eliminarUsuario = async function (id, nombre) {

    //  QUITAR FOCO DEL BOTÓN 
    document.activeElement?.blur();

    if (!confirm(`¿Desactivar a ${nombre}?`)) {
        return;
    }
    try {
        const res = await fetch(
            `/api/admin/usuarios/${id}`,
            {
                method: 'DELETE'
            }
        );
        const data = await res.json();
        if (data.ok) {
            cargarUsuarios();
        } else {
            alert(data.mensaje);
        }

    } catch (e) {
        alert('Error');
    }
};


// FILTROS
document.getElementById('buscarUsuario')
    ?.addEventListener('input', function () {
        const rol = document.getElementById('filtroRol')
            .value;
        cargarUsuarios(this.value, rol);
    });

document.getElementById('filtroRol')
    ?.addEventListener('change', function () {
        const buscar = document.getElementById('buscarUsuario')
            .value;
        cargarUsuarios(buscar, this.value);
    });

// LIMPIAR MODAL
function limpiarModal() {
    [
        'usrNombre',
        'usrApellido',
        'usrCorreo',
        'usrTelefono',
        'usrContrasena'
    ].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('usrRol').value = '1';
    document.getElementById('usrActivo').checked = true;
}


// AL CERRAR MODAL
modalEl?.addEventListener('hidden.bs.modal', () => {
    document.activeElement?.blur();
    document.body.focus();
});


// inicializar el dom
document.addEventListener(
    'DOMContentLoaded',
    () => cargarUsuarios()
);