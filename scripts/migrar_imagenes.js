'use strict';

require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const { query } = require('../server/db/conexion_sql');
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

async function migrar() {
    console.log('Obteniendo productos con imagen local...');

    const productos = await query(
        `SELECT id_producto, imagen FROM productos
        WHERE imagen IS NOT NULL AND imagen LIKE '/public/images/%'`
    );

    console.log(`${productos.length} productos a migrar.\n`);

    for (const prod of productos) {
        const nombreArchivo = path.basename(prod.imagen);
        const rutaLocal = path.join(IMAGES_DIR, nombreArchivo);

        if (!fs.existsSync(rutaLocal)) {
            console.warn(`  [SKIP] Archivo no encontrado: ${rutaLocal}`);
            continue;
        }

        try {
            const publicId  = `happyflower/${path.parse(nombreArchivo).name}`;

            const resultado = await cloudinary.uploader.upload(rutaLocal, {
                public_id: publicId,
                overwrite: true,
                resource_type: 'image',
            });

            await query(
                'UPDATE productos SET imagen = ? WHERE id_producto = ?',
                [resultado.secure_url, prod.id_producto]
            );

            console.log(`[OK] ${nombreArchivo} → ${resultado.secure_url}`);
        } catch (err) {
            console.error(`[ERROR] ${nombreArchivo}:`, err.message);
        }
    }

    console.log('\nMigración completada.');
    process.exit(0);
}

migrar().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});