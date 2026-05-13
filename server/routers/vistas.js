
'use strict';

//importamos modulos
const path = require('path');
const router = require('express').Router();
const { requireLogin, requireAdmin } = require('../middlewares/auth');

const views = path.join(__dirname, '../../public');//carpeta publica

//vistas publicas
router.get('/', (_req, res) => res.sendFile(path.join(views, 'index.html')));
router.get('/catalogo', (_req, res) => res.sendFile(path.join(views, 'catalogo.html')));
router.get('/contacto', (_req, res) => res.sendFile(path.join(views, 'contacto.html')));
router.get('/login', (_req, res) => res.sendFile(path.join(views, 'login.html')));
router.get('/carrito', (_req, res) => res.sendFile(path.join(views, 'carrito.html')));
router.get('/pedidos', (_req, res) => res.sendFile(path.join(views, 'pedidos.html')));

// ADMIN
router.get('/admin',  requireLogin, requireAdmin, (_req, res) => res.sendFile(path.join(views, 'admin/index_admin.html')));
router.get('/admin/pedidos', requireLogin, requireAdmin, (_req, res) => res.sendFile(path.join(views, 'admin/pedidos_admin.html')));
router.get('/admin/productos', requireLogin, requireAdmin, (_req, res) => res.sendFile(path.join(views, 'admin/inventario.html')));
router.get('/admin/usuarios', requireLogin, requireAdmin, (_req, res) => res.sendFile(path.join(views, 'admin/usuarios_admin.html')));
router.get('/admin/ventas', requireLogin, requireAdmin, (_req, res) => res.sendFile(path.join(views, 'admin/ganancias_admin.html')));
router.get('/admin/reportes', requireLogin, requireAdmin, (_req, res) => res.sendFile(path.join(views, 'admin/reportes_admin.html')));

module.exports = router;