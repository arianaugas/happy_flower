'use strict';

const { query, queryT, withTransaction } = require('../db/conexion_sql');

async function crear(req, res) {
    const id_usuario = req.session.usuario?.id_usuario || null;
    const { direccion_entrega, metodo_pago, numero_voucher, items, invitado } = req.body;

    const nombreInvitado = !id_usuario && invitado ? invitado.nombre : null;
    const correoInvitado = !id_usuario && invitado ? invitado.correo : null;
    const telefonoInvitado = !id_usuario && invitado ? invitado.telefono : null;

    if (!direccion_entrega || !metodo_pago || !items?.length) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos del pedido.' });
    }
    if (!id_usuario && (!nombreInvitado || !telefonoInvitado)) {
        return res.status(400).json({ ok: false, mensaje: 'Nombre y teléfono son obligatorios para invitados.' });
    }

    try {
        let totalCalculado = 0;
        const itemsVerificados = [];

        for (const item of items) {
            const idProd = parseInt(item.id_producto, 10);
            const cantidad = parseInt(item.cantidad, 10);

            if (!idProd || cantidad < 1) {
                return res.status(400).json({ ok: false, mensaje: 'Item inválido en el pedido.' });
            }

            const rows = await query(
                'SELECT id_producto, nombre, precio_actual, stock FROM productos WHERE id_producto = ? AND activo = 1',
                [idProd]
            );

            if (!rows.length) {
                return res.status(400).json({ ok: false, mensaje: 'Producto no encontrado o inactivo.' });
            }

            const prod = rows[0];

            if (prod.stock < cantidad) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock}.`
                });
            }

            const precioReal = parseFloat(prod.precio_actual);
            totalCalculado += precioReal * cantidad;
            itemsVerificados.push({ id_producto: idProd, cantidad, precio_unit: precioReal });
        }

        totalCalculado = Math.round(totalCalculado * 100) / 100;

        //creamos número de pedido
        const fecha = new Date();
        const yyyymmdd = `${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}`;
        const rnd = Date.now().toString().slice(-5) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const numeroPed = `HF${yyyymmdd}-${rnd}`;

        let idPedidoCreado;

        await withTransaction(async (conn) => {

            //insertamos pedido
            const resPed = await queryT(conn,
                `INSERT INTO pedidos
                 (id_usuario, numero_pedido, direccion_entrega, metodo_pago,
                  numero_voucher, total, nombre_invitado, correo_invitado, telefono_invitado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id_usuario, numeroPed, direccion_entrega.trim(), metodo_pago,
                    numero_voucher || null, totalCalculado,
                    nombreInvitado, correoInvitado, telefonoInvitado]
            );

            idPedidoCreado = resPed.insertId;

            for (const item of itemsVerificados) {

                //insertamos el detalle del pedido
                await queryT(conn,
                    'INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unit) VALUES (?, ?, ?, ?)',
                    [idPedidoCreado, item.id_producto, item.cantidad, item.precio_unit]
                );

                //Descontar stock — WHERE garantiza que no baje de 0
                const resStock = await queryT(conn,
                    'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
                    [item.cantidad, item.id_producto, item.cantidad]
                );

                //stock agotado
                if (resStock.affectedRows === 0) {
                    throw new Error(`Stock agotado para el producto ID ${item.id_producto}.`);
                }
            }
            // Insertar historial inicial
            await queryT(conn,
                'INSERT INTO historial_pedidos (id_pedido, estado, descripcion) VALUES (?, ?, ?)',
                [idPedidoCreado, 'pendiente', 'Pedido recibido y en espera de confirmación.']
            );
        });

        return res.status(201).json({
            ok: true,
            numero_pedido: numeroPed,
            id_pedido: idPedidoCreado,
            total: totalCalculado,
            mensaje: '¡Pedido registrado con éxito!'
        });

    } catch (err) {
        console.error('Error crear pedido:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al registrar el pedido.' });
    }
}

async function listarMisPedidos(req, res) {
    const id_usuario = req.session.usuario?.id_usuario;
    if (!id_usuario) return res.json({ ok: true, pedidos: [] });

    try {
        const rows = await query(
            'SELECT id_pedido, numero_pedido, estado, total, metodo_pago, creado_en, direccion_entrega FROM pedidos WHERE id_usuario = ? ORDER BY creado_en DESC',
            [id_usuario]
        );
        return res.json({ ok: true, pedidos: rows });
    } catch (err) {
        console.error('Error listar pedidos:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener pedidos.' });
    }
}

async function detalle(req, res) {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) return res.status(400).json({ ok: false, mensaje: 'ID inválido.' });

    const usuario = req.session.usuario || null;

    try {
        const rows = await query(
            `SELECT p.*, u.nombre AS nombre_usuario, u.correo AS correo_usuario, u.telefono AS telefono_usuario
             FROM pedidos p LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
             WHERE p.id_pedido = ?`,
            [idNum]
        );

        if (!rows.length) {
            return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado.' });
        }

        const pedido = rows[0];

        // Si hay sesión activa: verificamos que sea admin o dueño del pedido
        if (usuario) {
            const esAdmin = usuario.id_rol === 2;
            const esDueno = pedido.id_usuario === usuario.id_usuario;
            if (!esAdmin && !esDueno) {
                return res.status(403).json({ ok: false, mensaje: 'Acceso denegado.' });
            }
        } else {
            if (pedido.id_usuario !== null) {
                return res.status(403).json({ ok: false, mensaje: 'Acceso denegado.' });
            }
        }

        const items = await query(
            `SELECT d.cantidad, d.precio_unit, (d.cantidad * d.precio_unit) AS subtotal, pr.nombre, pr.imagen
             FROM detalle_pedidos d
             INNER JOIN productos pr ON d.id_producto = pr.id_producto
             WHERE d.id_pedido = ?`,
            [idNum]
        );

        const tracking = await query(
            'SELECT estado, descripcion, registrado_en FROM historial_pedidos WHERE id_pedido = ? ORDER BY registrado_en',
            [idNum]
        );

        return res.json({ ok: true, pedido, items, tracking });

    } catch (err) {
        console.error('Error detalle pedido:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener detalle.' });
    }
}

async function actualizarEstado(req, res) {
    const { id } = req.params;
    const idNum = parseInt(id, 10);
    const { estado, descripcion } = req.body;
    const id_admin = req.session.usuario.id_usuario;

    const validos = ['pendiente', 'preparacion', 'listo', 'camino', 'entregado', 'cancelado'];
    if (!validos.includes(estado)) {
        return res.status(400).json({ ok: false, mensaje: 'Estado no válido.' });
    }

    const MENSAJES_DEFAULT = {
        pendiente: 'Tu pedido ha sido recibido y está en espera de confirmación.',
        preparacion: '¡Estamos preparando tu pedido con mucho cuidado!',
        listo: '¡Tu pedido está listo! Pronto saldrá camino hacia ti.',
        camino: 'Tu pedido ya está en camino, el repartidor está en ruta.',
        entregado: '¡Tu pedido fue entregado! Esperamos que lo disfrutes mucho.',
        cancelado: 'Tu pedido fue cancelado. Contáctanos por WhatsApp si necesitas ayuda.',
    };
    const descFinal = descripcion?.trim() || MENSAJES_DEFAULT[estado] || null;

    try {
        await query(
            'UPDATE pedidos SET estado = ?, actualizado_en = NOW() WHERE id_pedido = ?',
            [estado, idNum]
        );

        await query(
            'INSERT INTO historial_pedidos (id_pedido, estado, descripcion, registrado_por) VALUES (?, ?, ?, ?)',
            [idNum, estado, descFinal, id_admin]
        );

        return res.json({ ok: true, mensaje: `Estado actualizado a "${estado}".` });
    } catch (err) {
        console.error('Error actualizar estado:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al actualizar estado.' });
    }
}

async function listarTodos(req, res) {
    const { estado, desde, hasta } = req.query;
    const params = [];

    let q = `SELECT p.id_pedido, p.numero_pedido, p.estado, p.total, p.metodo_pago, p.creado_en,
                    COALESCE(u.nombre, p.nombre_invitado) AS cliente,
                    COALESCE(u.correo, p.correo_invitado) AS correo
             FROM pedidos p LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
             WHERE 1=1`;

    if (estado) { q += ' AND p.estado = ?'; params.push(estado); }
    if (desde) { q += ' AND (p.creado_en - INTERVAL 5 HOUR) >= ?'; params.push(`${desde} 00:00:00`); }
    if (hasta) { q += ' AND (p.creado_en - INTERVAL 5 HOUR) <= ?'; params.push(`${hasta} 23:59:59`); }

    q += ' ORDER BY p.creado_en DESC';

    try {
        const rows = await query(q, params);
        return res.json({ ok: true, pedidos: rows });
    } catch (err) {
        console.error('Error listar todos pedidos:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener pedidos.' });
    }
}

module.exports = { crear, listarMisPedidos, detalle, actualizarEstado, listarTodos };