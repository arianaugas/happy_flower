
'use strict';

//  AGREGAR AL CARRITO 
function agregarAlCarrito(producto) {
    const carrito = getCarrito();//obtiene al carrito
    //busca el id del producto
    const idx = carrito.findIndex(i => i.id_producto === producto.id_producto);
    if (idx >= 0) {//Si el producto ya existe suma cantidad
        carrito[idx].cantidad += 1;
    } else {//si no existe, lo agrega
        carrito.push({ ...producto, cantidad: 1 });
    }

    //actualiza el carrito
    setCarrito(carrito);
    actualizarBadgeCarrito();
}

//RENDERIZAR PRODUCTOS DESDE API 
async function cargarProductos() {
    try {
        //llama al backend
        const res = await fetch('/api/productos');
        const data = await res.json();//espera al json
        //si hay un error en los datos, lo muestra
        if (!data.ok) throw new Error(data.mensaje);

        // Agrupar por categoría
        const grupos = {};
        data.productos.forEach(p => {//recorre la data y la agrupa
            const cat = (p.categoria || 'otros').toLowerCase();
            if (!grupos[cat]) grupos[cat] = [];
            grupos[cat].push(p);
        });

        // Renderizar cada sección según categoría (ubica las categorias el html)
        const mapaSecciones = {
            'rosas': 'products-grid-rosas',
            'girasoles': 'products-grid-girasoles',
            'cajas': 'products-grid-boxes',
            'cuadros': 'products-grid-cuadros',
            'tulipanes': 'products-grid-tulipanes',
            'arreglos': 'products-grid-arreglos',
            'cupula': 'products-grid-cupula',
        };

        //
        Object.entries(grupos).forEach(([cat, prods]) => {
            const gridId = mapaSecciones[cat] || 'products-grid-otros';
            const grid = document.getElementById(gridId);
            if (!grid) return;
            grid.innerHTML = '';
            prods.forEach(p => {
                grid.appendChild(crearCardProducto(p));//convertimos a cada producto en una card visual
            });
        });

        // Actualizar filtros con datos reales
        actualizarContadoresFiltros(grupos);
        actualizarBadgeCarrito();
        iniciarFiltros();

    } catch (err) {
        console.error('Error cargando productos:', err);
        document.querySelectorAll('[id^="products-grid"]').forEach(g => {
            g.innerHTML = '<p class="text-muted small">Error al cargar productos.</p>';
        });
    }
}


//crea la card donde irá el producto
function crearCardProducto(p) {
    const col = document.createElement('div');
    col.className = 'col';

    //ubica el precio anterior si esq  hay
    const precioAnteriorHtml = p.precio_anterior
        ? `<span class="product-price-old">S/ ${parseFloat(p.precio_anterior).toFixed(2)}</span>`
        : '';

    //muestra el stock
    const stockBadge = p.stock <= 0
        ? `<span class="product-badge agotado">Agotado</span>`
        : (p.stock <= 5 ? `<span class="product-badge poco">Últimos ${p.stock}</span>` : '');

    //obtiene la imagen y la muestra
    const imagenSrc = p.imagen //soporta urls externas y locales
        ? (p.imagen.startsWith('http') ? p.imagen : `${p.imagen}`)
        : '';//no muesstra nada

    //crea las cards de los productos con sus datos correspondientes
    col.innerHTML = `
        <article class="product-card"
            data-categoria="${(p.categoria || '').toLowerCase()}"
            data-nombre="${p.nombre}"
            data-precio="${p.precio_actual}"
            data-id="${p.id_producto}">
            <div class="product-card-img">
                <img src="${imagenSrc}" alt="${p.nombre}" loading="lazy"
                    onerror="this.style.display='none'">
                ${stockBadge}
            </div>
            <div class="product-card-body">
                <h3 class="product-name">${p.nombre}</h3>
                ${p.descripcion ? `<p class="product-desc">${p.descripcion}</p>` : ''}
                <div>
                    <span class="product-price">S/ ${parseFloat(p.precio_actual).toFixed(2)}</span>
                    ${precioAnteriorHtml}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" data-id="${p.id_producto}" ${p.stock <= 0 ? 'disabled' : ''}>
                        <i class="bi bi-bag-plus me-1"></i>${p.stock <= 0 ? 'Sin stock' : 'Al carrito'}
                    </button>
                </div>
            </div>
        </article>`;

    //Evento agregar al carrito
    col.querySelector('.btn-add-cart')?.addEventListener('click', function () {
        if (p.stock <= 0) return;//no agrega sino hay stock
        //agrega el objeto con los datos
        agregarAlCarrito({
            id_producto: p.id_producto,
            nombre: p.nombre,
            precio: parseFloat(p.precio_actual),
            imagen: imagenSrc,
            detalle: p.descripcion || p.categoria || ''
        });
        this.textContent = '✓ Agregado';
        this.disabled = true;

        //muestra un mensaje de agregado al caarrito
        setTimeout(() => {
            this.innerHTML = '<i class="bi bi-bag-plus me-1"></i>Al carrito';
            this.disabled = false;
        }, 1200);
        // Mostrar toast
        mostrarToast(`"${p.nombre}" añadido al carrito`);
    });

    return col;
}

//ACTUALIZAR CONTADORES DE FILTROS 
function actualizarContadoresFiltros(grupos) {
    const total = Object.values(grupos).reduce((a, g) => a + g.length, 0);//cuenta productos totales
    const elTotal = document.querySelector('#cat-todas ~ .filter-count, label[for="cat-todas"] + .filter-count');
    //actualizar total visible
    const spanTodas = document.querySelector('.filter-count');
    if (spanTodas) spanTodas.textContent = total;
}

// FILTROS (controla los filtros por categorias y precio maximo)
function iniciarFiltros() {
    //obtenemos los items
    const btnAplicar = document.getElementById('aplicar-filtros');
    const btnLimpiar = document.getElementById('limpiar-filtros');
    const checkTodas = document.getElementById('cat-todas');
    const checkCategorias = document.querySelectorAll('.filtro-categoria');
    const precioMax = document.getElementById('precio-max');
    const precioVal = document.getElementById('precio-val');

    // Actualizar valor del slider en tiempo real
    precioMax?.addEventListener('input', () => {
        if (precioVal) precioVal.textContent = `S/ ${precioMax.value}`;
    });

    function filtrar() {
        const categoriasSeleccionadas = [];
        checkCategorias.forEach(c => { if (c.checked) categoriasSeleccionadas.push(c.value); });
        const maxPrecio = parseFloat(precioMax?.value || 9999);

        document.querySelectorAll('.product-card').forEach(card => {
            const cat = card.dataset.categoria || '';
            const precio = parseFloat(card.dataset.precio || 0);
            let mostrar = true;

            if (!checkTodas?.checked && categoriasSeleccionadas.length > 0) {
                if (!categoriasSeleccionadas.includes(cat)) mostrar = false;
            }
            if (precio > maxPrecio) mostrar = false;

            card.closest('.col').style.display = mostrar ? '' : 'none';
        });
    }

    btnAplicar?.addEventListener('click', filtrar);

    btnLimpiar?.addEventListener('click', () => {
        if (checkTodas) checkTodas.checked = true;
        checkCategorias.forEach(c => c.checked = false);
        if (precioMax) { precioMax.value = 500; }
        if (precioVal) precioVal.textContent = 'S/ 500';
        document.querySelectorAll('.product-card').forEach(c => {
            c.closest('.col').style.display = '';
        });
    });

    checkTodas?.addEventListener('change', () => {
        if (checkTodas.checked) checkCategorias.forEach(c => c.checked = false);
    });
    checkCategorias.forEach(c => {
        c.addEventListener('change', () => { if (checkTodas) checkTodas.checked = false; });
    });
}

// inicializar el dom
document.addEventListener('DOMContentLoaded', () => {
    initShared(); //inicializamos el otro modulo
    cargarProductos();
});




