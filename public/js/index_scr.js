'use strict';

function agregarAlCarrito(producto) {
    const carrito = getCarrito();
    const idx = carrito.findIndex(i => i.id_producto === producto.id_producto);
    if (idx >= 0) carrito[idx].cantidad += 1;
    else carrito.push({ ...producto, cantidad: 1 });
    setCarrito(carrito);
    actualizarBadgeCarrito();
}

// PREVIEW DE CATEGORÍAS
async function cargarCategorias() {
    const contenedor = document.querySelector('.row.g-3.row-cols-2.row-cols-sm-3.row-cols-lg-5');
    if (!contenedor) return;

    try {
        const res  = await fetch('/api/categorias/preview');
        const data = await res.json();

        if (!data.ok || !data.previews?.length) return;

        contenedor.innerHTML = '';

        data.previews.forEach(item => {
            const slug      = item.categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
            const imagenSrc = item.imagen
                ? (item.imagen.startsWith('http') ? item.imagen : item.imagen)
                : '';

            const col = document.createElement('div');
            col.className = 'col';
            col.innerHTML = `
                <a href="/catalogo#${slug}" class="cat-card d-block">
                    <img src="${imagenSrc}" alt="${item.nombre}" loading="lazy">
                    <div class="cat-card-overlay"></div>
                    <div class="cat-card-body">
                        <div class="cat-card-title">${item.categoria}</div>
                        <span class="cat-card-btn">Ver más</span>
                    </div>
                </a>`;

            contenedor.appendChild(col);
        });

    } catch (e) {
        console.error('Error cargando categorías:', e);
    }
}

// PRODUCTOS DESTACADOS
async function cargarDestacados() {
    const carouselInner = document.querySelector('#carouselDestacados .carousel-inner');
    if (!carouselInner) return;

    try {
        const res  = await fetch('/api/productos');
        const data = await res.json();

        if (!data.ok || !data.productos?.length) return;

        const todos = data.productos
            .filter(p => p.stock > 0)
            .sort(() => Math.random() - 0.5);

        const porSlide = 4;
        const slides   = [];
        for (let i = 0; i < todos.length; i += porSlide) {
            slides.push(todos.slice(i, i + porSlide));
        }

        carouselInner.innerHTML = '';

        slides.forEach((grupo, slideIdx) => {
            const item = document.createElement('div');
            item.className = `carousel-item${slideIdx === 0 ? ' active' : ''}`;

            const row = document.createElement('div');
            row.className = 'row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4';

            grupo.forEach((p, colIdx) => {
                const imagenSrc = p.imagen
                    ? (p.imagen.startsWith('http') ? p.imagen : `${p.imagen}`)
                    : '';
                const precioAntHtml = p.precio_anterior
                    ? `<span class="product-price-old">S/ ${parseFloat(p.precio_anterior).toFixed(2)}</span>`
                    : '';

                const col = document.createElement('div');
                col.className = `col${colIdx === 3 ? ' d-none d-xl-block' : ''}`;
                col.innerHTML = `
                    <article class="product-card" data-id="${p.id_producto}">
                        <div class="product-card-img">
                            <img src="${imagenSrc}" alt="${p.nombre}" loading="lazy"
                                 onerror="this.style.display='none'">
                        </div>
                        <div class="product-card-body">
                            <h3 class="product-name">${p.nombre}</h3>
                            ${p.descripcion ? `<p class="product-desc">${p.descripcion}</p>` : ''}
                            <div>
                                <span class="product-price">S/ ${parseFloat(p.precio_actual).toFixed(2)}</span>
                                ${precioAntHtml}
                            </div>
                            <div class="product-actions">
                                <button class="btn-add-cart">
                                    <i class="bi bi-bag-plus me-1"></i>Al carrito
                                </button>
                            </div>
                        </div>
                    </article>`;

                col.querySelector('.btn-add-cart').addEventListener('click', function () {
                    agregarAlCarrito({
                        id_producto: p.id_producto,
                        nombre:      p.nombre,
                        precio:      parseFloat(p.precio_actual),
                        imagen:      imagenSrc,
                        detalle:     p.descripcion || p.categoria || ''
                    });
                    this.textContent = '✓ Agregado';
                    this.disabled = true;
                    setTimeout(() => {
                        this.innerHTML = '<i class="bi bi-bag-plus me-1"></i>Al carrito';
                        this.disabled  = false;
                    }, 1200);
                    mostrarToast(`"${p.nombre}" añadido al carrito`);
                });

                row.appendChild(col);
            });

            item.appendChild(row);
            carouselInner.appendChild(item);
        });

    } catch (e) {
        console.error('Error cargando destacados:', e);
    }
}

// inicializar el dom
document.addEventListener('DOMContentLoaded', () => {
    initShared();
    cargarCategorias();
    cargarDestacados();
});