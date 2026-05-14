'use strict';

//importamos bcrypt para encriptar contraseñas
const bcrypt = require('bcrypt');
const { query } = require('../db/conexion_sql');//la conexion a mysql
const ROUNDS = 10; 

async function login(req, res) {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ ok: false, mensaje: 'Correo y contraseña requeridos.' });
    }

    try {
        const rows = await query(
            'SELECT id_usuario, id_rol, nombre, correo, contrasena, activo FROM usuarios WHERE correo = ?',
            [correo.trim().toLowerCase()]
        );

        const usuario = rows[0];

        if (!usuario || !usuario.activo) {
            return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
        }

        const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!coincide) {
            return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
        }

        req.session.usuario = {
            id_usuario: usuario.id_usuario,
            id_rol:     usuario.id_rol,
            nombre:     usuario.nombre,
            correo:     usuario.correo,
        };

        return res.json({
            ok:  true,
            rol: usuario.id_rol === 2 ? 'admin' : 'usuario',
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre:     usuario.nombre,
                correo:     usuario.correo,
                id_rol:     usuario.id_rol,
            }
        });

    } catch (err) {
        console.error('Error en login:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
}

async function registro(req, res) {
    const { nombre, apellido, correo, telefono, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ ok: false, mensaje: 'Nombre, correo y contraseña son obligatorios.' });
    }
    if (contrasena.length < 6) {
        return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.(com|pe|net|org|edu|gob|io|co)$/.test(correo.trim())) {
        return res.status(400).json({ ok: false, mensaje: 'Solo se permiten correos con dominio .com o .pe' });
    }

    try {
        const existe = await query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo.trim().toLowerCase()]);
        if (existe.length > 0) {
            return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado.' });
        }

        const hash = await bcrypt.hash(contrasena, ROUNDS);

        await query(
            'INSERT INTO usuarios (id_rol, nombre, apellido, correo, telefono, contrasena, activo) VALUES (1, ?, ?, ?, ?, ?, 1)',
            [nombre.trim(), apellido?.trim() || null, correo.trim().toLowerCase(), telefono?.trim() || null, hash]
        );

        return res.status(201).json({ ok: true, mensaje: 'Usuario registrado correctamente.' });

    } catch (err) {
        console.error('Error en registro:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al registrarse.' });
    }
}

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al destruir sesión:', err);
            return res.status(500).json({ ok: false, mensaje: 'Error al cerrar sesión.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ ok: true, mensaje: 'Sesión cerrada.' });
    });
}

function sesionActual(req, res) {
    if (req.session?.usuario?.id_usuario) {
        const { id_usuario, id_rol, nombre, correo } = req.session.usuario;
        return res.json({ ok: true, usuario: { id_usuario, id_rol, nombre, correo } });
    }
    return res.status(401).json({ ok: false, usuario: null });
}

module.exports = { login, registro, logout, sesionActual };