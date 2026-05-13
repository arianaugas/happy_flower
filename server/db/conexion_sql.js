'use strict';
//Importa la versión con promesas de mysql2
const mysql = require('mysql2/promise');

let pool = null;//ceamos un conjunto de conexiones reutilizables

function getPool() {//creamos el pool
    if (!pool) {
        pool = mysql.createPool({//Crea el pool de conexiones.
            //variables de entorno.
            host: process.env.DB_HOST ,
            port: parseInt(process.env.DB_PORT,10),//Convierte el puerto a número entero.
            database: process.env.DB_NAME ,
            user: process.env.DB_USER,
            password: process.env.DB_PASS ,
            waitForConnections: true,
            connectionLimit: 10,//Máximo 10 conexiones simultáneas.
            timezone: 'local',
        });
        console.log('Pool MySQL creado');
    }
    return pool;
}

//query para ejecutar consultas simples
async function query(queryStr, params = []) {
    const p = getPool();
    const [rows] = await p.execute(queryStr, params);//ejecuta la consulta
    return rows;
}

//ejecuta múltiples operaciones dentro de una transacción
async function withTransaction(callback) {
    const conn = await getPool().getConnection();
    try {
        await conn.beginTransaction();
        const result = await callback(conn);
        await conn.commit();//guarda los cambios
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

//query dentro de una transacción abierta
async function queryT(conn, queryStr, params = []) {
    const [rows] = await conn.execute(queryStr, params);
    return rows;
}

module.exports = { query, queryT, withTransaction };