'use strict';


// FORMULARIO CONTACTO
function iniciarFormContacto() {
    const form = document.getElementById('formContacto') || document.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        // Aquí puedes agregar lógica de envío si tienes un endpoint
        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
            btn.textContent = '✓ Mensaje enviado';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = 'Enviar mensaje';
                btn.disabled = false;
                form.reset();
            }, 3000);
        }
    });
}

// INIT 
document.addEventListener('DOMContentLoaded', () => {
    initShared();
    iniciarFormContacto();
});