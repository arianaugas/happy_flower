
'use strict';

// Importamos los módulos
const express = require('express');
const path  = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();
const morgan = require('morgan');

//importamos las rutas creadas
const apiRouter = require('./server/routers/api');
const vistasRouter = require('./server/routers/vistas');
const { cargarUsuario } = require('./server/middlewares/auth');


//creamos el servidor
const app  = express();
app.set('trust proxy', 1); 
const PORT = process.env.PORT || 3000;


// MIDDLEWARES GLOBALES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));//te duevuelve las peticiones y respuestas por consolaa


if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.error('FATAL: SESSION_SECRET no definido en producción.');
    process.exit(1);
}

// SESIONES
/* (ignorar esto) app.use(session({
    secret: process.env.SESSION_SECRET || 'happyflower_secret_dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Será true solo en producción con HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8,   // 8 horas
    }
}));*/

const sessionStore = new MySQLStore({
    host:               process.env.DB_HOST,
    port:       parseInt(process.env.DB_PORT, 10) || 3306,
    database:           process.env.DB_NAME,
    user:               process.env.DB_USER,
    password:           process.env.DB_PASS,
    clearExpired:       true,
    checkExpirationInterval: 1000 * 60 * 15,  // limpia sesiones vencidas cada 15 min
    expiration:         1000 * 60 * 60 * 8,   // 8 horas
    createDatabaseTable: true,                 // crea la tabla sessions automáticamente
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'happyflower_secret_dev',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure:   process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge:   1000 * 60 * 60 * 8,
    }
}));


//sesion de invitado para los usuarios
app.use(cargarUsuario);


// ARCHIVOS ESTÁTICOS (CSS, JS del frontend, imágenes)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rutas del backend y del frontend 
app.use('/api', apiRouter);
app.use('/', vistasRouter);


// MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
    console.error('Error inesperado:', err.stack);
    res.status(500).send('Error interno del servidor');
});


// ARRANQUE DEL SERVIDOR
app.listen(PORT, () => {
    console.log(`Happy Flower corriendo en http://localhost:${PORT}`);
});



