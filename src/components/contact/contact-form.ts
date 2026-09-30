/**
 * Formulario de contacto: al enviarlo muestra el mensaje de éxito.
 *
 * El formulario envía por `mailto:` (abre el cliente de correo), así que no
 * hay respuesta del servidor que esperar: basta con mostrar el aviso
 * (role="status", el lector de pantalla lo anuncia) al disparar `submit`.
 * Astro empaqueta este módulo una sola vez aunque el componente se repita.
 */
function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const success = document.querySelector<HTMLElement>('[data-form-success]');
  if (!form || !success) return;

  form.addEventListener('submit', () => {
    success.classList.remove('hidden');
  });
}

initContactForm();
// Compatibilidad con <ClientRouter /> (view transitions), igual que reveal.ts.
document.addEventListener('astro:page-load', initContactForm);
