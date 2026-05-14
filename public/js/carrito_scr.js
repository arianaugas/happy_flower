'use strict';

//RENDERIZAR CARRITO
function renderizarCarrito() {
    const contenedor = document.querySelector('.cart-card');
    if (!contenedor) return;

    const carrito = getCarrito();

    contenedor.innerHTML = `
        <h2 style="font-family:var(--ff-display,inherit);font-size:1.3rem;margin-bottom:0">
            Productos en el carrito
            <span class="badge rounded-pill text-bg-success ms-1">${carrito.length}</span>
        </h2><hr>`;

    if (carrito.length === 0) {
        contenedor.innerHTML += `
            <div class="text-center py-5">
                <i class="bi bi-cart-x" style="font-size:3rem;color:#ccc"></i>
                <p class="mt-3 text-muted">Tu carrito está vacío</p>
                <a href="/catalogo" class="btn btn-outline-success btn-sm mt-2">Ir al catálogo</a>
            </div>`;
        actualizarTotales(0);
        return;
    }

    let subtotal = 0;
    carrito.forEach((item, index) => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;
        contenedor.innerHTML += `
            <div class="cart-item d-flex align-items-center gap-3 py-3 border-bottom">
                <div class="cart-item-img" style="width:80px;height:80px;flex-shrink:0;border-radius:10px;overflow:hidden;background:#f5f5f5">
                    <img src="${item.imagen}" alt="${item.nombre}" style="width:100%;height:100%;object-fit:cover"
                         onerror="this.src='/public/images/placeholder.jpeg'">
                </div>
                <div class="flex-grow-1">
                    <h3 class="fs-6 mb-1 fw-600">${item.nombre}</h3>
                    <p class="text-muted small mb-2">${item.detalle || ''}</p>
                    <div class="d-flex align-items-center gap-3 flex-wrap">
                        <div class="d-flex align-items-center gap-2 border rounded-pill px-2 py-1">
                            <button class="btn btn-sm p-0 border-0 bg-transparent" onclick="cambiarCantidad(${item.id_producto}, -1)" aria-label="Disminuir">
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="fw-600 px-2">${item.cantidad}</span>
                            <button class="btn btn-sm p-0 border-0 bg-transparent" onclick="cambiarCantidad(${item.id_producto}, 1)" aria-label="Aumentar">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                        <span class="fw-600" style="color:var(--GRIS_CLARO,#2d6a4f)">S/ ${itemTotal.toFixed(2)}</span>
                        <small class="text-muted">S/ ${item.precio.toFixed(2)} c/u</small>
                    </div>
                </div>
                <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="eliminarDelCarrito(${item.id_producto})" aria-label="Eliminar">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>`;
    });

    actualizarTotales(subtotal);
}

function actualizarTotales(subtotal) {
    const envio = 0;
    const total = subtotal + envio;
    const el = id => document.getElementById(id);
    if (el('subtotal')) el('subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    if (el('total')) el('total').textContent = `S/ ${total.toFixed(2)}`;
}


//  MODAL ELIMINAR 
let _modalProductoPendiente = null;

function abrirModalEliminar(id_producto) {
    _modalProductoPendiente = id_producto;
    const overlay = document.getElementById('modalEliminarOverlay');
    if (overlay) overlay.classList.add('activo');
    document.getElementById('modalEliminarClose')?.focus();
    document.body.style.overflow = 'hidden';
}

function cerrarModalEliminar() {
    const overlay = document.getElementById('modalEliminarOverlay');
    if (overlay) overlay.classList.remove('activo');
    _modalProductoPendiente = null;
    document.body.style.overflow = '';
}

function confirmarEliminarProducto() {
    if (_modalProductoPendiente === null) return;
    const carrito = getCarrito();
    const idx = carrito.findIndex(i => i.id_producto === _modalProductoPendiente);
    if (idx !== -1) {
        carrito.splice(idx, 1);
        setCarrito(carrito);
        renderizarCarrito();
        actualizarBadgesCarrito();
    }
    cerrarModalEliminar();
}


window.cambiarCantidad = function (id_producto, delta) {
    const carrito = getCarrito();
    const idx = carrito.findIndex(i => i.id_producto === id_producto);
    if (idx === -1) return;
    const nuevaCantidad = carrito[idx].cantidad + delta;
    if (nuevaCantidad <= 0) {
        abrirModalEliminar(id_producto);
        return;
    }
    carrito[idx].cantidad = nuevaCantidad;
    setCarrito(carrito);
    renderizarCarrito();
    actualizarBadgesCarrito();
};

window.eliminarDelCarrito = function (id_producto) {
    abrirModalEliminar(id_producto);
};

function actualizarBadgesCarrito() {
    const carrito = getCarrito();
    const total = carrito.reduce((a, i) => a + i.cantidad, 0);
    document.querySelectorAll('.cart-badge').forEach(b => b.textContent = total);
    const badgeSidebar = document.querySelector('.sidebar .badge.text-bg-danger');
    if (badgeSidebar) badgeSidebar.textContent = total;
}

function marcarError(inputId, mensaje) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.classList.add('is-invalid');
    let fb = el.nextElementSibling;
    if (!fb || !fb.classList.contains('invalid-feedback')) {
        fb = document.createElement('div');
        fb.className = 'invalid-feedback';
        el.after(fb);
    }
    fb.textContent = mensaje;
}

function limpiarError(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.classList.remove('is-invalid');
    el.classList.add('is-valid');
}

function limpiarValidaciones() {
    document.querySelectorAll('#modalPago .is-invalid, #modalPago .is-valid')
        .forEach(el => el.classList.remove('is-invalid', 'is-valid'));
}

//Validación de todos los campos del formulario de pago.
function validarFormularioPago() {
    let valido = true;

    const direccion = document.getElementById('pagoDir').value.trim();
    const distrito  = document.getElementById('pagoDistrito').value;
    const metodo    = document.getElementById('pagoMetodo').value;
    const voucher   = document.getElementById('pagoVoucher')?.value.trim() || '';
    const carrito   = getCarrito();

    //Dirección 
    if (!direccion) {
        marcarError('pagoDir', 'La dirección de entrega es obligatoria.');
        valido = false;
    } else {
        limpiarError('pagoDir');
    }

    //Distrito
    if (!distrito) {
        marcarError('pagoDistrito', 'Debes seleccionar un distrito de entrega.');
        valido = false;
    } else {
        limpiarError('pagoDistrito');
    }

    //Método de pago
    if (!metodo) {
        marcarError('pagoMetodo', 'Selecciona un método de pago.');
        valido = false;
    } else {
        limpiarError('pagoMetodo');
    }

    //Código de aprobación
    if (['yape', 'plin', 'bcp'].includes(metodo)) {
        const soloDigitos = /^\d{6}$/.test(voucher);
        if (!voucher) {
            marcarError('pagoVoucher', 'El código de aprobación es obligatorio.');
            valido = false;
        } else if (!soloDigitos) {
            marcarError('pagoVoucher', 'El código debe contener exactamente 6 dígitos numéricos.');
            valido = false;
        } else {
            limpiarError('pagoVoucher');
        }
    }

    //Carrito
    if (carrito.length === 0) {
        mostrarPagoError('Tu carrito está vacío.');
        valido = false;
    }

    //Datos de invitado
    const secInv = document.getElementById('seccionInvitado');
    if (secInv && !secInv.classList.contains('d-none')) {
        const nombre   = document.getElementById('invNombre').value.trim();
        const telefono = document.getElementById('invTelefono').value.trim();
        const correo   = document.getElementById('invCorreo').value.trim();

        //Validación Nombre
        if (!nombre) {
            marcarError('invNombre', 'El nombre es obligatorio.');
            valido = false;
        } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
            marcarError('invNombre', 'El nombre solo puede contener letras, no números.');
            valido = false;
        } else {
            limpiarError('invNombre');
        }

        //Validación Teléfono
        if (!telefono) {
            marcarError('invTelefono', 'El teléfono es obligatorio.');
            valido = false;
        } else if (!/^9\d{8}$/.test(telefono)) {
            marcarError('invTelefono', 'El teléfono debe empezar con 9.');
            valido = false;
        } else {
            limpiarError('invTelefono');
        }

        //Validación Correo
        if (!correo) {
            marcarError('invCorreo', 'El correo es obligatorio.');
            valido = false;
        } else if (!/^[^\s@]+@[^\s@]+\.(com|pe|org|net|edu|gob|es|mx|co|io|info|biz|us|uk|cl|ar|bo|ec|ve|py|uy)$/i.test(correo)) {
            marcarError('invCorreo', 'Ingresa un correo válido con dominio .com o .pe (ej: nombre@gmail.com, nombre@empresa.pe).');
            valido = false;
        } else {
            limpiarError('invCorreo');
        }
    }

    return valido;
}

//MODAL DE PAGO
function abrirModalPago() {
    const carrito = getCarrito();
    if (carrito.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    let modal = document.getElementById('modalPago');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalPago';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header" style="background:var(--GRIS_CLARO,#2d6a4f);color:#fff">
                        <h2 class="modal-title fs-5"><i class="bi bi-lock-fill me-2"></i>Finalizar pedido</h2>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="pagoAlert" class="alert alert-danger d-none" role="alert"></div>

                        <!-- Resumen -->
                        <div class="mb-4 p-3 rounded-3" style="background:#f8f9fa">
                            <h3 class="fs-6 mb-3 fw-600">Resumen del pedido</h3>
                            <div id="resumenItems"></div>
                            <div class="d-flex justify-content-between fw-600 pt-2 border-top">
                                <span>Total</span>
                                <span id="resumenTotal" style="color:var(--verde,#2d6a4f)"></span>
                            </div>
                        </div>

                        <!-- Datos de entrega -->
                        <div class="mb-3">
                            <label class="form-label fw-600">Dirección de entrega <span class="text-danger">*</span></label>
                            <input type="text" id="pagoDir" class="form-control" placeholder="Jr. Ejemplo 123, Trujillo" />
                        </div>

                        <!-- Datos invitado -->
                        <div id="seccionInvitado" class="d-none">
                            <div class="alert alert-info py-2 small">
                                <i class="bi bi-info-circle me-1"></i>
                                Completa tus datos para continuar sin cuenta, o
                                <a href="/login" class="alert-link">inicia sesión</a>.
                            </div>
                            <div class="row g-2 mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Nombre <span class="text-danger">*</span></label>
                                    <input type="text" id="invNombre" class="form-control" placeholder="Tu nombre" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Teléfono <span class="text-danger">*</span></label>
                                    <input type="tel" id="invTelefono" class="form-control" placeholder="9XXXXXXXX" maxlength="9" />
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Correo <span class="text-danger">*</span></label>
                                    <input type="email" id="invCorreo" class="form-control" placeholder="correo@ejemplo.com" />
                                    <div class="form-text text-muted">Debe contener @.com</div>
                                </div>
                            </div>
                        </div>

                        <!-- Distrito -->
                        <div class="mb-3">
                            <label class="form-label fw-600">Distrito de entrega (Solo envíos a Trujillo) <span class="text-danger">*</span></label>
                            <select id="pagoDistrito" class="form-select">
                                <option value="">Seleccionar distrito...</option>
                                <option value="Trujillo">Trujillo Centro</option>
                                <option value="Victor Larco">Víctor Larco</option>
                                <option value="Huanchaco">Huanchaco</option>
                                <option value="El Porvenir">El Porvenir</option>
                                <option value="Florencia de Mora">Florencia de Mora</option>
                                <option value="La Esperanza">La Esperanza</option>
                                <option value="Moche">Moche</option>
                                <option value="Salaverry">Salaverry</option>
                            </select>
                        </div>

                        <!-- Método de pago -->
                        <div class="mb-3">
                            <label class="form-label fw-600">Método de pago <span class="text-danger">*</span></label>
                            <select id="pagoMetodo" class="form-select">
                                <option value="">Seleccionar...</option>
                                <option value="yape">Yape</option>
                                <option value="plin">Plin</option>
                                <option value="bcp">BCP</option>
                            </select>
                        </div>

                        <!-- Info de pago -->
                        <div id="infoPago" class="d-none mb-3 p-3 rounded-3" style="background:#1a2e1a;border:1px solid #2d6a4f">
                            <p class="mb-1 small fw-600" style="color:#81c784">
                                <i class="bi bi-info-circle me-1"></i>Datos para realizar el pago:
                            </p>
                            <div id="infoPagoDetalle" class="small" style="color:#aaa"></div>
                        </div>

                        <!-- Código de aprobación -->
                        <div class="mb-3" id="seccionVoucher" style="display:none">
                            <label class="form-label fw-600">
                                Código de aprobación <span class="text-danger">*</span>
                                <small class="text-muted fw-400">(6 dígitos numéricos del voucher)</small>
                            </label>
                            <input type="text" id="pagoVoucher" class="form-control"
                                placeholder="Ej: 123456" maxlength="6" inputmode="numeric" />
                            <div class="form-text">
                                <i class="bi bi-shield-check me-1 text-success"></i>
                                Solo números. Tu pago será verificado por nuestro equipo.
                            </div>
                        </div>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary rounded-pill" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-success rounded-pill px-4" id="btnConfirmarPedido">
                            <i class="bi bi-check-circle me-1"></i>Confirmar pedido
                        </button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);

        //  solo permitir dígitos en el voucher 
        document.getElementById('pagoVoucher').addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 6);
        });

        //solo permitir dígitos en el teléfono 
        // se agrega con delegación porque invTelefono aparece dinámicamente
        modal.addEventListener('input', function (e) {
            if (e.target.id === 'invTelefono') {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
            }
            // Solo letras en nombre
            if (e.target.id === 'invNombre') {
                e.target.value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
            }
        });

        // mostrar/ocultar voucher según método de pago
        document.getElementById('pagoMetodo').addEventListener('change', function () {
            const secVoucher  = document.getElementById('seccionVoucher');
            const infoPago    = document.getElementById('infoPago');
            const infoDetalle = document.getElementById('infoPagoDetalle');

            const infoMap = {
                yape: `<p class="mb-1">📱 <strong>Yape</strong> al número: <strong style="color:#fff">+51 927 861 327</strong></p>
                       <p class="mb-0">A nombre de: <strong style="color:#fff">Happy Flower</strong></p>`,
                plin: `<p class="mb-1">📱 <strong>Plin</strong> al número: <strong style="color:#fff">+51 927 861 327</strong></p>
                       <p class="mb-0">A nombre de: <strong style="color:#fff">Happy Flower</strong></p>`,
                bcp:  `<p class="mb-1">🏦 <strong>BCP</strong> — CTA Ahorros: <strong style="color:#fff">570-33831528-0-14</strong></p>
                       <p class="mb-0">A nombre de: <strong style="color:#fff">Happy Flower S.A.C.</strong></p>`,
            };

            if (infoMap[this.value]) {
                infoDetalle.innerHTML = infoMap[this.value];
                infoPago.classList.remove('d-none');
                secVoucher.style.display = '';
            } else {
                infoPago.classList.add('d-none');
                secVoucher.style.display = 'none';
                document.getElementById('pagoVoucher').value = '';
                document.getElementById('pagoVoucher').classList.remove('is-invalid', 'is-valid');
            }
        });

        // confirmar pedido 
        document.getElementById('btnConfirmarPedido').addEventListener('click', confirmarPedido);
    }

    // Llenar resumen
    const carr = getCarrito();
    const resumenItems = document.getElementById('resumenItems');
    const resumenTotal = document.getElementById('resumenTotal');
    let totalAmt = 0;
    resumenItems.innerHTML = '';
    carr.forEach(i => {
        const sub = i.precio * i.cantidad;
        totalAmt += sub;
        resumenItems.innerHTML += `
            <div class="d-flex justify-content-between small py-1">
                <span>${i.nombre} × ${i.cantidad}</span>
                <span>S/ ${sub.toFixed(2)}</span>
            </div>`;
    });
    resumenTotal.textContent = `S/ ${totalAmt.toFixed(2)}`;

    // Limpiar estado previo del formulario
    limpiarValidaciones();
    document.getElementById('pagoAlert').classList.add('d-none');

    verificarSesionModal();

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

async function verificarSesionModal() {
    try {
        const res  = await fetch('/api/auth/sesion');
        const data = await res.json();
        const secInv = document.getElementById('seccionInvitado');
        if (!data.ok || !data.usuario?.id_usuario) {
            secInv?.classList.remove('d-none');
        } else {
            secInv?.classList.add('d-none');
        }
    } catch (e) {
        document.getElementById('seccionInvitado')?.classList.remove('d-none');
    }
}

async function confirmarPedido() {
    // Ocultar alerta global previa
    document.getElementById('pagoAlert').classList.add('d-none');
    limpiarValidaciones();

    // Ejecutar todas las validaciones antes de continuar
    const esValido = validarFormularioPago();
    if (!esValido) {
        mostrarPagoError('Por favor, completa correctamente todos los campos obligatorios.');
        // Scroll al primer error
        const primerError = document.querySelector('#modalPago .is-invalid');
        if (primerError) primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const direccion = document.getElementById('pagoDir').value.trim();
    const distrito = document.getElementById('pagoDistrito').value;
    const metodo = document.getElementById('pagoMetodo').value;
    const voucher = document.getElementById('pagoVoucher')?.value.trim() || null;
    const carrito = getCarrito();

    // Datos de invitado (si aplica)
    const secInv = document.getElementById('seccionInvitado');
    let invitado = null;
    if (secInv && !secInv.classList.contains('d-none')) {
        invitado = {
            nombre: document.getElementById('invNombre').value.trim(),
            telefono: document.getElementById('invTelefono').value.trim(),
            correo: document.getElementById('invCorreo').value.trim() || null
        };
    }

    const items = carrito.map(i => ({
        id_producto: i.id_producto,
        cantidad: i.cantidad,
        precio_unit: i.precio
    }));

    const btn = document.getElementById('btnConfirmarPedido');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

    try {
        const res = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                direccion_entrega: `${direccion}, ${distrito}`,
                metodo_pago: metodo,
                numero_voucher: voucher,
                items,
                invitado
            })
        });
        const data = await res.json();

        if (data.ok) {
            const uid = sessionStorage.getItem('_hf_uid');
            localStorage.removeItem(uid ? `carrito_flores:${uid}` : 'carrito_flores:guest');
            actualizarBadgesCarrito();

            bootstrap.Modal.getInstance(document.getElementById('modalPago'))?.hide();
            mostrarExito(data.numero_pedido, data.id_pedido);
            renderizarCarrito();
        } else {
            mostrarPagoError(data.mensaje || 'Error al registrar el pedido. Revisa nuevamente tus datos');
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Confirmar pedido';
        }
    } catch (e) {
        mostrarPagoError('Error de conexión. Intenta nuevamente.');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Confirmar pedido';
    }
}

function mostrarPagoError(msg) {
    const el = document.getElementById('pagoAlert');
    if (el) { el.textContent = msg; el.classList.remove('d-none'); }
}

function mostrarExito(numeroPedido, idPedido) {
    const pedidosLocales = JSON.parse(localStorage.getItem('pedidos_invitado')) || [];
    pedidosLocales.unshift({
        numero_pedido: numeroPedido,
        id_pedido: idPedido,
        fecha: new Date().toISOString()
    });
    localStorage.setItem('pedidos_invitado', JSON.stringify(pedidosLocales));

    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = `
        <div class="container py-5 text-center">
            <div class="display-1 mb-3">🌸</div>
            <h2 class="fw-600 mb-2" style="color:var(--verde,#2d6a4f)">¡Pedido confirmado!</h2>
            <p class="text-muted mb-1">Tu número de pedido es:</p>
            <p class="fs-4 fw-600 mb-2">${numeroPedido}</p>
            <p class="text-muted mb-4">Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>
            <div class="d-flex gap-3 justify-content-center flex-wrap mb-3">
                <button id="btnDescargarBoleta" class="btn btn-success rounded-pill px-4">
                    <i class="bi bi-file-earmark-pdf me-2"></i>Descargar boleta
                </button>
                <a href="/pedidos" class="btn btn-outline-success rounded-pill px-4">Ver mis pedidos</a>
                <a href="/catalogo" class="btn btn-outline-secondary rounded-pill px-4">Seguir comprando</a>
            </div>
            <p class="text-muted small">Puedes descargar tu boleta ahora o encontrarla más tarde en "Mis pedidos".</p>
        </div>`;

    document.getElementById('btnDescargarBoleta')?.addEventListener('click', async () => {
        const btn = document.getElementById('btnDescargarBoleta');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';

        try {
            const res = await fetch(`/api/pedidos/${idPedido}`, { credentials: 'include' });
            const data = await res.json();
            if (!data.ok) throw new Error(data.mensaje);
            generarBoletaPDF(data.pedido, data.items, numeroPedido);
        } catch (e) {
            alert('Error al generar la boleta. Intenta desde "Mis pedidos".');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-file-earmark-pdf me-2"></i>Descargar boleta';
        }
    });
}

function generarBoletaPDF(pedido, items, numeroPedido) {
    const { jsPDF } = window.jspdf;
    
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
    });

    const NEGRO = [30, 30, 30];
    const GRIS = [100, 100, 100];
    const GRIS_CLARO = [210, 210, 210];
    const GRIS_FONDO = [245, 245, 245];
    const BLANCO = [255, 255, 255];
    const AZUL_ACCENTO = [80, 120, 190]; 

    const ancho = 210;
    const alto = 297;
    const margenX = 15;
    const anchoUtil = ancho - margenX * 2;
    
    let y = 0;

    function dibujarHeader(doc) {
        doc.setFillColor(...GRIS_FONDO);
        doc.rect(0, 0, ancho, 38, 'F');
        
        doc.setTextColor(...NEGRO);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('Happy Flower', margenX, 15);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...GRIS);
        doc.text('Arreglos florales — Trujillo, Perú', margenX, 21);
        doc.text('WhatsApp: +51 927 861 327', margenX, 26);
        doc.text('RUC: 10XXXXXXXXX', margenX, 31); // Añadir RUC real

        // Titulo Boleta
        doc.setTextColor(...NEGRO);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('BOLETA DE VENTA', ancho - margenX, 15, { align: 'right' });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`N° ${String(numeroPedido).padStart(6, '0')}`, ancho - margenX, 22, { align: 'right' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const fechaEmision = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        doc.text(`Emitida: ${fechaEmision}`, ancho - margenX, 27, { align: 'right' });
    }

    function dibujarPie(doc) {
        const pieY = alto - 15;
        doc.setDrawColor(...GRIS_CLARO);
        doc.setLineWidth(0.3);
        doc.line(margenX, pieY - 5, ancho - margenX, pieY - 5);
        doc.setTextColor(...GRIS);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Gracias por tu compra en Happy Flower — Este documento es un comprobante de tu pedido.', ancho / 2, pieY, { align: 'center' });
        doc.text('Consultas: WhatsApp +51 927 861 327 | Trujillo, Perú', ancho / 2, pieY + 4, { align: 'center' });
    }

    dibujarHeader(doc);
    y = 45;

    const mitad = (anchoUtil - 5) / 2;
    
    // Fondo de cajas
    doc.setFillColor(...GRIS_FONDO);
    doc.setDrawColor(...GRIS_CLARO);
    doc.setLineWidth(0.1);
    doc.roundedRect(margenX, y, anchoUtil, 36, 1, 1, 'FD');

    // Datos Cliente
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DATOS DEL CLIENTE', margenX + 4, y + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GRIS);
    const nombreCliente = (pedido.nombre_usuario || pedido.nombre_invitado || 'Cliente').substring(0, 40);
    const correoCliente = (pedido.correo_usuario || pedido.correo_invitado || '—').substring(0, 40);
    const telCliente = pedido.telefono_usuario || pedido.telefono_invitado || '—';

    doc.text(`Nombre:`, margenX + 4, y + 15);
    doc.text(`Correo:`, margenX + 4, y + 21);
    doc.text(`Teléfono:`, margenX + 4, y + 27);
    
    doc.setTextColor(...NEGRO);
    doc.text(nombreCliente, margenX + 22, y + 15);
    doc.text(correoCliente, margenX + 22, y + 21);
    doc.text(String(telCliente), margenX + 22, y + 27);

    // Datos Pedido
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DATOS DEL PEDIDO', margenX + mitad + 10, y + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GRIS);
    const fechaPedido = pedido.creado_en ? new Date(pedido.creado_en).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
    const direccion = (pedido.direccion_entrega || '—').substring(0, 45);

    doc.text(`Fecha:`, margenX + mitad + 10, y + 15);
    doc.text(`Pago:`, margenX + mitad + 10, y + 21);
    doc.text(`Dirección:`, margenX + mitad + 10, y + 27);
    
    doc.setTextColor(...NEGRO);
    doc.text(fechaPedido, margenX + mitad + 28, y + 15);
    doc.text((pedido.metodo_pago || '—').toUpperCase(), margenX + mitad + 28, y + 21);
    doc.text(direccion, margenX + mitad + 28, y + 27);

    y += 45;

    //TABLA HEADER 
    doc.setFillColor(...NEGRO);
    doc.rect(margenX, y, anchoUtil, 8, 'F');
    doc.setTextColor(...BLANCO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('DESCRIPCIÓN', margenX + 4, y + 5.5);
    doc.text('CANT.', margenX + 115, y + 5.5, { align: 'center' });
    doc.text('P. UNIT.', margenX + 140, y + 5.5, { align: 'center' });
    doc.text('SUBTOTAL', margenX + anchoUtil - 4, y + 5.5, { align: 'right' });
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NEGRO);
    let filaH = 9;

    items.forEach((item, idx) => {
        // Verificar espacio para nueva página
        if (y > 250) {
            dibujarPie(doc);
            doc.addPage();
            dibujarHeader(doc);
            y = 45;
            // Redibujar tabla header en nueva página
            doc.setFillColor(...NEGRO);
            doc.rect(margenX, y, anchoUtil, 8, 'F');
            doc.setTextColor(...BLANCO);
            doc.setFont('helvetica', 'bold');
            doc.text('DESCRIPCIÓN', margenX + 4, y + 5.5);
            doc.text('CANT.', margenX + 115, y + 5.5, { align: 'center' });
            doc.text('P. UNIT.', margenX + 140, y + 5.5, { align: 'center' });
            doc.text('SUBTOTAL', margenX + anchoUtil - 4, y + 5.5, { align: 'right' });
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...NEGRO);
        }

        // Fondo alternado
        if (idx % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margenX, y, anchoUtil, filaH, 'F');
        }
        
        doc.setDrawColor(...GRIS_CLARO);
        doc.setLineWidth(0.1);
        doc.line(margenX, y + filaH, margenX + anchoUtil, y + filaH);
        
        let nombreProd = (item.nombre || '').substring(0, 60);
        
        doc.setFontSize(8.5);
        doc.text(nombreProd, margenX + 4, y + 6);
        doc.text(String(item.cantidad), margenX + 115, y + 6, { align: 'center' });
        doc.text(`S/ ${Number(item.precio_unit || 0).toFixed(2)}`, margenX + 140, y + 6, { align: 'center' });
        doc.text(`S/ ${Number(item.subtotal || (item.precio_unit * item.cantidad)).toFixed(2)}`, margenX + anchoUtil - 4, y + 6, { align: 'right' });
        
        y += filaH;
    });

    y += 10;
    
    // Verificar espacio para totales
    if (y > 230) {
        dibujarPie(doc);
        doc.addPage();
        y = 30;
    }

    doc.setFillColor(...GRIS_FONDO);
    doc.rect(ancho - margenX - 65, y, 65, 12, 'F');
    
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL A PAGAR:', ancho - margenX - 55, y + 7.5);
    doc.text(`S/ ${Number(pedido.total || 0).toFixed(2)}`, ancho - margenX - 4, y + 7.5, { align: 'right' });


    if (pedido.numero_voucher) {
        y += 18;
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(margenX, y, anchoUtil, 10, 1, 1, 'FD');
        doc.setTextColor(...GRIS);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text('Código de aprobación (voucher):', margenX + 4, y + 6.5);
        doc.setTextColor(...NEGRO);
        doc.setFont('helvetica', 'bold');
        doc.text(String(pedido.numero_voucher), margenX + 55, y + 6.5);
    }

    dibujarPie(doc);

    doc.save(`Boleta_${String(numeroPedido).padStart(6, '0')}.pdf`);
}


// inicializar el dom
document.addEventListener('DOMContentLoaded', () => {
    initShared();
    renderizarCarrito();

    document.querySelector('.btn-checkout')?.addEventListener('click', abrirModalPago);
    document.getElementById('btnPago')?.addEventListener('click', abrirModalPago);

    // Listeners del modal eliminar
    document.getElementById('modalEliminarClose')?.addEventListener('click', cerrarModalEliminar);
    document.getElementById('modalEliminarConfirmar')?.addEventListener('click', confirmarEliminarProducto);
    document.getElementById('modalEliminarGuardar')?.addEventListener('click', cerrarModalEliminar);

    // Cerrar al hacer click fuera del modal
    document.getElementById('modalEliminarOverlay')?.addEventListener('click', function(e) {
        if (e.target === this) cerrarModalEliminar();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') cerrarModalEliminar();
    });
});
