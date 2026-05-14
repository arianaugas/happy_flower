'use strict';

const { query } = require('../db/conexion_sql');//conexion

async function resumen(req, res) {
    try {
        const rows = await query(`
            SELECT
                (SELECT COUNT(*) FROM pedidos WHERE DATE(creado_en) = CURDATE()) AS pedidos_hoy,
                (SELECT IFNULL(SUM(total),0) FROM pedidos WHERE DATE(creado_en) = CURDATE() AND estado != 'cancelado') AS ventas_hoy,
                (SELECT COUNT(*) FROM productos WHERE activo = 1) AS productos_activos,
                (SELECT COUNT(*) FROM usuarios WHERE id_rol = 1 AND activo = 1) AS clientes
        `);
        return res.json({ ok: true, resumen: rows[0] });
    } catch (err) {
        console.error('Error resumen dashboard:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener resumen.' });
    }
}

async function pedidosRecientes(req, res) {
    try {
        const rows = await query(`
            SELECT p.numero_pedido, p.estado, p.total, p.creado_en,
                   COALESCE(u.nombre, p.nombre_invitado) AS cliente
            FROM pedidos p LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            ORDER BY p.creado_en DESC
            LIMIT 10
        `);
        return res.json({ ok: true, pedidos: rows });
    } catch (err) {
        console.error('Error pedidos recientes:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener pedidos recientes.' });
    }
}

async function ventasPorPeriodo(req, res) {
    const { desde, hasta } = req.query;

    const fechaLocal = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const fechaDesde = desde ? `${desde} 00:00:00` : (() => {
        const d = new Date(); d.setDate(d.getDate() - 30);
        return `${fechaLocal(d)} 00:00:00`;
    })();
    const fechaHasta = hasta ? `${hasta} 23:59:59` : (() => {
        const d = new Date();
        return `${fechaLocal(d)} 23:59:59`;
    })();

    try {
        const ventas = await query(`
            SELECT
                DATE_FORMAT(creado_en - INTERVAL 5 HOUR, '%Y-%m-%d') AS fecha,
                COUNT(*) AS total_pedidos,
                IFNULL(SUM(CASE WHEN estado != 'cancelado' THEN total ELSE 0 END), 0) AS ingresos,
                COUNT(CASE WHEN estado = 'entregado' THEN 1 END) AS entregados,
                COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) AS cancelados
            FROM pedidos
            WHERE creado_en >= ? AND creado_en <= ?
            GROUP BY DATE_FORMAT(creado_en - INTERVAL 5 HOUR, '%Y-%m-%d')
            ORDER BY fecha DESC
        `, [fechaDesde, fechaHasta]);

        const totRow = await query(`
            SELECT
                COUNT(DISTINCT p.id_pedido) AS total_pedidos,
                COUNT(CASE WHEN p.estado = 'entregado' THEN 1 END) AS entregados,
                COUNT(CASE WHEN p.estado = 'cancelado' THEN 1 END) AS cancelados,
                IFNULL(SUM(CASE WHEN p.estado != 'cancelado' THEN dp.precio_unit * dp.cantidad ELSE 0 END),0) AS ingresos_totales,
                IFNULL(SUM(CASE WHEN p.estado != 'cancelado' THEN IFNULL(gp.inversion,0) * dp.cantidad ELSE 0 END),0) AS inversion_total,
                IFNULL(SUM(CASE WHEN p.estado != 'cancelado' THEN IFNULL(gp.ganancia,0)  * dp.cantidad ELSE 0 END),0) AS ganancia_total
            FROM pedidos p
            INNER JOIN detalle_pedidos dp ON dp.id_pedido = p.id_pedido
            INNER JOIN productos pr ON pr.id_producto = dp.id_producto
            LEFT  JOIN ganancias_productos gp ON gp.id_producto = dp.id_producto
            WHERE p.creado_en >= ? AND p.creado_en <= ?
        `, [fechaDesde, fechaHasta]);

        const t = totRow[0];
        const ingresos = parseFloat(t.ingresos_totales) || 0;
        const inversion = parseFloat(t.inversion_total) || 0;
        const gananciaDB = parseFloat(t.ganancia_total) || 0;
        const ganancia = gananciaDB > 0 ? gananciaDB : ingresos - inversion;

        return res.json({
            ok: true,
            ventas,
            totales: {
                total_pedidos: t.total_pedidos,
                entregados: t.entregados,
                cancelados: t.cancelados,
                ingresos_totales: ingresos.toFixed(2),
                inversion_total: inversion.toFixed(2),
                ganancia_total: ganancia.toFixed(2),
            }
        });
    } catch (err) {
        console.error('Error ventas por período:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener reporte de ventas.' });
    }
}

async function topProductos(req, res) {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const { desde, hasta } = req.query;
    const params = [];

    let filtroFecha = '';
    if (desde && hasta) {
        filtroFecha = 'AND p.creado_en >= ? AND p.creado_en <= ?';
        params.push(`${desde} 00:00:00`, `${hasta} 23:59:59`);
    }

    try {
        const rows = await query(`
            SELECT pr.id_producto, pr.nombre, pr.imagen, pr.precio_actual,
                   SUM(d.cantidad)                 AS unidades_vendidas,
                   SUM(d.cantidad * d.precio_unit) AS ingresos_generados,
                   COUNT(DISTINCT d.id_pedido)     AS numero_pedidos
            FROM detalle_pedidos d
            INNER JOIN productos pr ON d.id_producto = pr.id_producto
            INNER JOIN pedidos   p  ON d.id_pedido   = p.id_pedido
            WHERE p.estado != 'cancelado'
            ${filtroFecha}
            GROUP BY pr.id_producto, pr.nombre, pr.imagen, pr.precio_actual
            ORDER BY unidades_vendidas DESC
            LIMIT ${limit}
        `, params);

        return res.json({ ok: true, productos: rows });
    } catch (err) {
        console.error('Error top productos:', err.message);
        return res.status(500).json({ ok: false, mensaje: 'Error al obtener top productos.' });
    }
}

module.exports = { resumen, pedidosRecientes, ventasPorPeriodo, topProductos };