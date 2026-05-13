
'use strict';

//creamos un objeto router de express para definir rutas
const router  = require('express').Router();
//importamos los controladores
const authCtrl= require('../controllers/authController');
const prodCtrl= require('../controllers/productosController');
const pedCtrl = require('../controllers/pedidosController');
const usrCtrl = require('../controllers/usuariosController');
const { requireLogin, requireAdmin } = require('../middlewares/auth');
const repCtrl = require('../controllers/reportesController');
const ganCtrl = require('../controllers/gananciasController');

//importamos las funciones de productos
const { listar, obtenerUno, crear, actualizar, eliminar, listarCategorias, upload, uploadImagen } = require('../controllers/productosController');

// Ruta para subir imagen imagen 
router.post('/productos/upload-imagen', requireLogin, requireAdmin, (req, res, next) => {
    upload.single('imagen')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ ok: false, mensaje: err.message || 'Error al procesar imagen.' });
        }
        next();
    });
}, uploadImagen);


//rutas de autenticacion
router.post('/auth/login', authCtrl.login);
router.post('/auth/registro', authCtrl.registro);
router.post('/auth/logout', authCtrl.logout);
router.get ('/auth/sesion', authCtrl.sesionActual);


//rutas de productos
router.get('/productos', prodCtrl.listar);
router.get('/productos/:id', prodCtrl.obtenerUno);
router.get ('/categorias', prodCtrl.listarCategorias);
router.get('/categorias/preview', prodCtrl.listarPreviewCategorias);
router.post('/productos', requireLogin, requireAdmin, prodCtrl.crear);
router.put('/productos/:id', requireLogin, requireAdmin, prodCtrl.actualizar);
router.delete('/productos/:id', requireLogin, requireAdmin, prodCtrl.eliminar);

//rutas de pedidos
router.post('/pedidos', pedCtrl.crear);
router.get ('/pedidos/mis', pedCtrl.listarMisPedidos);
router.get('/pedidos/:id', pedCtrl.detalle);

//rutas de Administradores
router.get('/admin/pedidos', requireLogin, requireAdmin, pedCtrl.listarTodos);
router.put('/admin/pedidos/:id/estado', requireLogin, requireAdmin, pedCtrl.actualizarEstado);
router.get ('/admin/usuarios', requireLogin, requireAdmin, usrCtrl.listar);
router.post ('/admin/usuarios', requireLogin, requireAdmin, usrCtrl.crear);
router.put ('/admin/usuarios/:id', requireLogin, requireAdmin, usrCtrl.actualizar);
router.delete('/admin/usuarios/:id', requireLogin, requireAdmin, usrCtrl.eliminar);
router.get('/admin/gestion', requireLogin, requireAdmin, repCtrl.resumen);
router.get('/admin/gestion/recientes',requireLogin, requireAdmin, repCtrl.pedidosRecientes);
router.get('/admin/reportes/ventas',  requireLogin, requireAdmin, repCtrl.ventasPorPeriodo);
router.get('/admin/reportes/top-productos',requireLogin, requireAdmin, repCtrl.topProductos);
router.get('/admin/ganancias', requireLogin, requireAdmin, ganCtrl.listarGanancias);

module.exports = router;//exportamos