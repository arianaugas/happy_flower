'use strict';

const { query } = require('../db/conexion_sql');//conexion a mysql

async function listarGanancias(req, res) {
    try {
        const rows = await query(`
            SELECT
                p.id_producto,
                p.nombre,
                p.precio_actual,
                c.nombre                                           AS categoria,
                SUM(dp.cantidad)                                   AS total_vendido,
                IFNULL(MAX(gp.inversion), 0) * SUM(dp.cantidad)   AS costo_inversion,
                IFNULL(MAX(gp.ganancia),  0) * SUM(dp.cantidad)   AS ganancia
            FROM detalle_pedidos dp
            INNER JOIN pedidos             ped ON dp.id_pedido   = ped.id_pedido
            INNER JOIN productos             p ON dp.id_producto = p.id_producto
            INNER JOIN categorias            c ON p.id_categoria = c.id_categoria
            LEFT  JOIN ganancias_productos  gp ON gp.id_producto = p.id_producto
            WHERE ped.estado != 'cancelado'
            GROUP BY p.id_producto, p.nombre, p.precio_actual, c.nombre
            ORDER BY ganancia DESC
        `);

        return res.json({ ok: true, ganancias: rows });
    } catch (err) {
        console.error('Error listar ganancias:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener ganancias.' });
    }
}

module.exports = { listarGanancias };