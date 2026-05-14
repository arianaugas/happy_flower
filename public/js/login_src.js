'use strict';

function mostrarAlerta(id, mensaje, tipo = 'danger') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `auth-alert alert alert-${tipo}`;
    el.textContent = mensaje;
    el.classList.remove('d-none');
}
function ocultarAlerta(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
}
function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const txt = btn.querySelector('.btn-text');
    const spin = btn.querySelector('.btn-spinner');
    btn.disabled = loading;
    if (txt) txt.classList.toggle('d-none', loading);
    if (spin) spin.classList.toggle('d-none', !loading);
}

// TOGGLE CONTRASEÑA
document.getElementById('btnVerPass')?.addEventListener('click', () => {
    const inp = document.getElementById('loginContrasena');
    const ico = document.querySelector('#btnVerPass i');
    if (inp.type === 'password') {
        inp.type = 'text';
        ico.className = 'bi bi-eye-slash';
    } else {
        inp.type = 'password';
        ico.className = 'bi bi-eye';
    }
});

// CAMBIO PANEL LOGIN / REGISTRO
document.getElementById('btnIrRegistro')?.addEventListener('click', () => {
    document.getElementById('panelLogin').classList.add('d-none');
    document.getElementById('panelRegistro').classList.remove('d-none');
});
document.getElementById('btnIrLogin')?.addEventListener('click', () => {
    document.getElementById('panelRegistro').classList.add('d-none');
    document.getElementById('panelLogin').classList.remove('d-none');
});

// SELECTOR ROL 
document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.role-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
    });
});

//REGEX COMPARTIDAS
const emailRegex = /^[^\s@]+@[^\s@]+\.(com|pe|org|net|edu|gob|es|mx|co|io|info|biz|us|uk|cl|ar|bo|ec|ve|py|uy)$/i;
const soloLetrasRegex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/;
const telefonoRegex = /^9\d{8}$/;

// LOGIN
document.getElementById('btnLogin')?.addEventListener('click', async () => {
    const correo     = document.getElementById('loginCorreo').value.trim();
    const contrasena = document.getElementById('loginContrasena').value;
    ocultarAlerta('loginAlert');

    // Validar vacíos
    if (!correo && !contrasena) {
        mostrarAlerta('loginAlert', 'Completa todos los campos.');
        return;
    }
    if (!correo) {
        mostrarAlerta('loginAlert', 'El correo es obligatorio.');
        return;
    }
    if (!emailRegex.test(correo)) {
        mostrarAlerta('loginAlert', 'Ingresa un correo válido (ej: nombre@gmail.com).');
        return;
    }
    if (!contrasena) {
        mostrarAlerta('loginAlert', 'La contraseña es obligatoria.');
        return;
    }
    if (contrasena.length < 4) {
        mostrarAlerta('loginAlert', 'La contraseña debe tener al menos 4 caracteres.');
        return;
    }

    setLoading('btnLogin', true);
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        const data = await res.json();

        if (data.ok) {
            localStorage.removeItem('pedidos_invitado');
            localStorage.removeItem('carrito_flores:guest');
            if (data.rol === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
        } else {
            mostrarAlerta('loginAlert', data.mensaje || 'Correo o contraseña incorrectos.');
        }
    } catch (e) {
        mostrarAlerta('loginAlert', 'Error de conexión. Intenta nuevamente.');
    } finally {
        setLoading('btnLogin', false);
    }
});

// Enter en campos de login
['loginCorreo', 'loginContrasena'].forEach(id => {
    document.getElementById(id)?.addEventListener('keypress', e => {
        if (e.key === 'Enter') document.getElementById('btnLogin')?.click();
    });
});

// REGISTRO
document.getElementById('btnRegistro')?.addEventListener('click', async () => {
    const nombre     = document.getElementById('regNombre').value.trim();
    const apellido   = document.getElementById('regApellido').value.trim();
    const correo     = document.getElementById('regCorreo').value.trim();
    const telefono   = document.getElementById('regTelefono').value.trim();
    const contrasena = document.getElementById('regContrasena').value;
    ocultarAlerta('registroAlert');

    // Nombre
    if (!nombre) {
        mostrarAlerta('registroAlert', 'El nombre es obligatorio.');
        return;
    }
    if (!soloLetrasRegex.test(nombre)) {
        mostrarAlerta('registroAlert', 'El nombre solo puede contener letras, no números ni símbolos.');
        return;
    }
    if (nombre.length < 2) {
        mostrarAlerta('registroAlert', 'El nombre debe tener al menos 2 caracteres.');
        return;
    }

    // Apellido (opcional pero si se llena, se valida)
    if (apellido) {
        if (!soloLetrasRegex.test(apellido)) {
            mostrarAlerta('registroAlert', 'El apellido solo puede contener letras, no números ni símbolos.');
            return;
        }
        if (apellido.length < 2) {
            mostrarAlerta('registroAlert', 'El apellido debe tener al menos 2 caracteres.');
            return;
        }
    }

    // Correo
    if (!correo) {
        mostrarAlerta('registroAlert', 'El correo es obligatorio.');
        return;
    }
    if (!emailRegex.test(correo)) {
        mostrarAlerta('registroAlert', 'Ingresa un correo válido (ej: nombre@gmail.com).');
        return;
    }

    // Teléfono (opcional pero si se llena, se valida)
    if (telefono) {
        if (!/^\d+$/.test(telefono)) {
            mostrarAlerta('registroAlert', 'El teléfono solo debe contener números.');
            return;
        }
        if (!telefonoRegex.test(telefono)) {
            mostrarAlerta('registroAlert', 'El teléfono debe empezar con 9 y tener 9 dígitos (ej: 987654321).');
            return;
        }
    }

    // Contraseña
    if (!contrasena) {
        mostrarAlerta('registroAlert', 'La contraseña es obligatoria.');
        return;
    }
    if (contrasena.length < 6) {
        mostrarAlerta('registroAlert', 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    setLoading('btnRegistro', true);
    try {
        const res = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, correo, telefono, contrasena })
        });
        const data = await res.json();

        if (data.ok) {
            mostrarAlerta('registroAlert', '¡Cuenta creada! Ahora inicia sesión.', 'success');
            setTimeout(() => {
                document.getElementById('panelRegistro').classList.add('d-none');
                document.getElementById('panelLogin').classList.remove('d-none');
            }, 1500);
        } else {
            mostrarAlerta('registroAlert', data.mensaje || 'Error al registrarse.');
        }
    } catch (e) {
        mostrarAlerta('registroAlert', 'Error de conexión. Intenta nuevamente.');
    } finally {
        setLoading('btnRegistro', false);
    }
});