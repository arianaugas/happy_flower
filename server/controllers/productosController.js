'use strict';

const { query } = require('../db/conexion_sql');//conexion
const multer = require('multer');//multer para subir archivos
const path = require('path');

async function listar(req, res) {
    try {
        const { categoria, buscar } = req.query;
        const params = [];

        let q = `SELECT p.id_producto, p.nombre, p.descripcion, p.imagen,
                        p.precio_anterior, p.precio_actual, p.stock, c.nombre AS categoria
                 FROM productos p
                 INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                 WHERE p.activo = 1`;

        if (categoria) { q += ' AND c.nombre = ?'; params.push(categoria); }
        if (buscar) { q += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)'; params.push(`%${buscar}%`, `%${buscar}%`); }

        q += ' ORDER BY p.id_producto DESC';

        const rows = await query(q, params);
        return res.json({ ok: true, productos: rows });

    } catch (err) {
        console.error('Error listar productos:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener productos.' });
    }
}

async function obtenerUno(req, res) {
    const idNum = parseInt(req.params.id, 10);
    if (isNaN(idNum)) return res.status(400).json({ ok: false, mensaje: 'ID inválido.' });

    try {
        const rows = await query(
            `SELECT p.*, c.nombre AS categoria
             FROM productos p
             INNER JOIN categorias c ON p.id_categoria = c.id_categoria
             WHERE p.id_producto = ? AND p.activo = 1`,
            [idNum]
        );
        if (!rows.length) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
        return res.json({ ok: true, producto: rows[0] });
    } catch (err) {
        console.error('Error obtener producto:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error interno.' });
    }
}

async function crear(req, res) {
    const { id_categoria, nombre, descripcion, imagen, precio_anterior, precio_actual, stock } = req.body;

    if (!id_categoria || !nombre || !precio_actual) {
        return res.status(400).json({ ok: false, mensaje: 'Categoría, nombre y precio son obligatorios.' });
    }

    try {
        await query(
            'INSERT INTO productos (id_categoria, nombre, descripcion, imagen, precio_anterior, precio_actual, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [parseInt(id_categoria,10), nombre.trim(), descripcion?.trim()||null, imagen?.trim()||null,
             precio_anterior ? parseFloat(precio_anterior) : null, parseFloat(precio_actual), parseInt(stock,10)||0]
        );
        return res.status(201).json({ ok: true, mensaje: 'Producto creado correctamente.' });
    } catch (err) {
        console.error('Error crear producto:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al crear producto.' });
    }
}

async function actualizar(req, res) {
    const idNum = parseInt(req.params.id, 10);
    const { id_categoria, nombre, descripcion, imagen, precio_anterior, precio_actual, stock, activo } = req.body;

    try {
        if (imagen !== undefined) {
            await query(
                `UPDATE productos SET id_categoria=?, nombre=?, descripcion=?, imagen=?,
                 precio_anterior=?, precio_actual=?, stock=?, activo=? WHERE id_producto=?`,
                [parseInt(id_categoria,10), nombre.trim(), descripcion?.trim()||null, imagen?.trim()||null,
                 precio_anterior ? parseFloat(precio_anterior) : null, parseFloat(precio_actual),
                 parseInt(stock,10)||0, activo===false ? 0 : 1, idNum]
            );
        } else {
            await query(
                `UPDATE productos SET id_categoria=?, nombre=?, descripcion=?,
                 precio_anterior=?, precio_actual=?, stock=?, activo=? WHERE id_producto=?`,
                [parseInt(id_categoria,10), nombre.trim(), descripcion?.trim()||null,
                 precio_anterior ? parseFloat(precio_anterior) : null, parseFloat(precio_actual),
                 parseInt(stock,10)||0, activo===false ? 0 : 1, idNum]
            );
        }
        return res.json({ ok: true, mensaje: 'Producto actualizado.' });
    } catch (err) {
        console.error('Error actualizar producto:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al actualizar.' });
    }
}

async function eliminar(req, res) {
    const idNum = parseInt(req.params.id, 10);
    try {
        await query('UPDATE productos SET activo = 0 WHERE id_producto = ?', [idNum]);
        return res.json({ ok: true, mensaje: 'Producto eliminado.' });
    } catch (err) {
        console.error('Error eliminar producto:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al eliminar.' });
    }
}

async function listarCategorias(req, res) {
    try {
        const rows = await query('SELECT id_categoria, nombre FROM categorias WHERE activo = 1 ORDER BY nombre');
        return res.json({ ok: true, categorias: rows });
    } catch (err) {
        console.error('Error listar categorías:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener categorías.' });
    }
}

async function listarPreviewCategorias(req, res) {
    try {
        const q = `
            SELECT p.id_producto, p.nombre, p.imagen, c.nombre AS categoria
            FROM productos p
            INNER JOIN categorias c ON p.id_categoria = c.id_categoria
            WHERE p.activo = 1
              AND p.id_producto = (
                  SELECT MIN(p2.id_producto)
                  FROM productos p2
                  WHERE p2.id_categoria = p.id_categoria
                    AND p2.activo = 1
              )
            ORDER BY c.nombre`;

        const rows = await query(q);
        return res.json({ ok: true, previews: rows });
    } catch (err) {
        console.error('Error listarPreviewCategorias:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener previews de categorías.' });
    }
}

//Importamos cloudinary para almacenar imagenes
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');//combierte bufer en stream

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extOk  = /\.(jpeg|jpg|png|webp|gif|jfif)$/i.test(path.extname(file.originalname));
        const mimeOk = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
        if (extOk && mimeOk) cb(null, true);
        else cb(new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF.'));
    }
});

function subirACloudinary(buffer, publicId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { public_id: publicId, folder: 'happyflower', overwrite: true, resource_type: 'image' },
            (error, result) => { if (error) reject(error); else resolve(result); }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

async function uploadImagen(req, res) {
    if (!req.file) return res.status(400).json({ ok: false, mensaje: 'No se recibió ninguna imagen.' });

    try {
        const baseName = path.basename(req.file.originalname, path.extname(req.file.originalname))
                            .replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const publicId = `${baseName}_${Date.now()}`;

        const resultado = await subirACloudinary(req.file.buffer, publicId);
        return res.json({ ok: true, ruta: resultado.secure_url });
    } catch (err) {
        console.error('Error subiendo imagen a Cloudinary:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al subir la imagen.' });
    }
}


module.exports = { listar, obtenerUno, crear, actualizar, eliminar, listarCategorias, listarPreviewCategorias, upload, uploadImagen };