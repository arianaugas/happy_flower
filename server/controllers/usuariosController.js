'use strict';

const bcrypt = require('bcrypt');
const { query } = require('../db/conexion_sql');
const ROUNDS = 10;

async function listar(req, res) {
    try {
        const rows = await query(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.activo, r.nombre AS rol
            FROM usuarios u INNER JOIN roles r ON u.id_rol = r.id_rol
            ORDER BY u.id_usuario DESC`
        );
        return res.json({ ok: true, usuarios: rows });
    } catch (err) {
        console.error('Error listar usuarios:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener usuarios.' });
    }
}

async function crear(req, res) {
    const { nombre, apellido, correo, telefono, contrasena, id_rol } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ ok: false, mensaje: 'Nombre, correo y contraseña son obligatorios.' });
    }

    try {
        const existe = await query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo.trim().toLowerCase()]);
        if (existe.length) return res.status(409).json({ ok: false, mensaje: 'El correo ya está en uso.' });

        const hash = await bcrypt.hash(contrasena, ROUNDS);
        await query(
            'INSERT INTO usuarios (id_rol, nombre, apellido, correo, telefono, contrasena) VALUES (?, ?, ?, ?, ?, ?)',
            [parseInt(id_rol,10)||1, nombre.trim(), apellido?.trim()||null, correo.trim().toLowerCase(), telefono?.trim()||null, hash]
        );
        return res.status(201).json({ ok: true, mensaje: 'Usuario creado correctamente.' });
    } catch (err) {
        console.error('Error crear usuario:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al crear usuario.' });
    }
}

async function actualizar(req, res) {
    const idNum = parseInt(req.params.id, 10);
    const idAdmin = req.session.usuario.id_usuario;
    const { nombre, apellido, telefono, id_rol, activo } = req.body;

    if (idNum === idAdmin) {
        if (parseInt(id_rol, 10) !== 2)
            return res.status(400).json({ ok: false, mensaje: 'No puedes cambiar tu propio rol de administrador.' });
        if (activo === false || activo === 0)
            return res.status(400).json({ ok: false, mensaje: 'No puedes desactivar tu propia cuenta.' });
    }

    try {
        await query(
            'UPDATE usuarios SET nombre=?, apellido=?, telefono=?, id_rol=?, activo=? WHERE id_usuario=?',
            [nombre.trim(), apellido?.trim()||null, telefono?.trim()||null, parseInt(id_rol,10)||1, activo===false?0:1, idNum]
        );
        return res.json({ ok: true, mensaje: 'Usuario actualizado.' });
    } catch (err) {
        console.error('Error actualizar usuario:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al actualizar.' });
    }
}

async function eliminar(req, res) {
    const idNum = parseInt(req.params.id, 10);
    const idAdmin = req.session.usuario.id_usuario;

    if (idNum === idAdmin)
        return res.status(400).json({ ok: false, mensaje: 'No puedes desactivar tu propia cuenta.' });

    try {
        await query('UPDATE usuarios SET activo = 0 WHERE id_usuario = ?', [idNum]);
        return res.json({ ok: true, mensaje: 'Usuario desactivado.' });
    } catch (err) {
        console.error('Error eliminar usuario:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al eliminar.' });
    }
}

module.exports = { listar, crear, actualizar, eliminar };