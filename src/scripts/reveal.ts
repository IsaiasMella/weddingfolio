/**
 * Aparición al hacer scroll: agrega `.is-visible` a cada `.reveal` cuando
 * entra en pantalla. El CSS de la transición está en
 * src/styles/components/reveal.css.
 *
 * - Un solo IntersectionObserver para todos los elementos (barato).
 * - Cada elemento se observa una sola vez: al aparecer se deja de observar.
 * - Con `prefers-reduced-motion` se muestra todo sin animar.
 */
function initReveal(): void {
  const elements = document.querySelectorAll<HTMLElement>('.reveal');
  if (!elements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    // 12 % del elemento visible, y un margen inferior de -8 % para que la
    // animación empiece cuando el elemento ya subió un poco, no en el borde.
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  elements.forEach((el) => observer.observe(el));
}

initReveal();
// Compatibilidad con <ClientRouter /> (view transitions): si algún día se
// activa, cada navegación dispara `astro:page-load` y hay que volver a observar.
document.addEventListener('astro:page-load', initReveal);
