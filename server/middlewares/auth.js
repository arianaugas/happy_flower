
// Middlewares de autenticación y autorización de roles

'use strict';

// Middleware opcional, si hay sesión, la deja, si no, crea un usuario invitado
function cargarUsuario(req, res, next) {
    if (!req.session.usuario) {
        // Usuario invitado sin ID real, es decir null
        req.session.usuario = {
            id_usuario: null,   // Indica que es invitado
            id_rol: 1, 
            nombre: 'Invitado',
            correo: null
        };
    }
    next();
}

// Middleware que exige inicio de sesión real
function requireLogin(req, res, next) {
    if (req.session.usuario && req.session.usuario.id_usuario !== null) {
        return next();
    }
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ ok: false, mensaje: 'Debe iniciar sesión.' });
    }
    return res.redirect('/login');
}

// Protege rutas de administrador
function requireAdmin(req, res, next) {
    if (req.session.usuario && req.session.usuario.id_rol === 2) {
        return next();
    }
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({ ok: false, mensaje: 'Acceso denegado.' });
    }
    return res.redirect('/');
}
//EXPORTAMOS
module.exports = { cargarUsuario, requireLogin, requireAdmin };