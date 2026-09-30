/**
 * Comportamiento del header:
 *  - Al bajar más de 40 px, la barra gana fondo translúcido, desenfoque y sombra.
 *  - Botón hamburguesa: abre/cierra el menú móvil a pantalla completa, anima
 *    las tres rayas a una "X", bloquea el scroll del body y actualiza ARIA.
 *  - `Escape` o clic en un link cierran el menú.
 *
 * El marcado está en src/components/layout/Header.astro; acá solo se
 * agregan/quitan clases de Tailwind. Tailwind las genera porque también
 * escanea los .ts de src: por eso las clases van escritas COMPLETAS en este
 * archivo (nunca armadas con concatenación, como `'bg-' + color`).
 */
const SCROLLED = ['bg-ink/90', 'backdrop-blur-md', 'shadow-lg', 'shadow-ink/20'];
const SCROLL_THRESHOLD = 40;

function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const bar = document.querySelector<HTMLElement>('[data-header-bar]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  const [top, middle, bottom] = document.querySelectorAll<HTMLElement>('[data-menu-bar]');
  const links = document.querySelectorAll<HTMLElement>('[data-menu-link]');

  // `dataset.bound` evita registrar los listeners dos veces.
  if (!header || !bar || !toggle || !menu || toggle.dataset.bound === 'true') return;
  toggle.dataset.bound = 'true';

  const isOpen = () => document.body.classList.contains('menu-open');

  const syncBar = () => {
    if (isOpen()) {
      // Con el menú abierto la barra es sólida (sin blur) para fundirse con el overlay.
      bar.classList.add('bg-ink');
      bar.classList.remove(...SCROLLED);
      return;
    }
    if (window.scrollY > SCROLL_THRESHOLD) bar.classList.add(...SCROLLED);
    else bar.classList.remove(...SCROLLED, 'bg-ink');
  };

  const setOpen = (open: boolean) => {
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    menu.setAttribute('aria-hidden', String(!open));
    if (top && middle && bottom) {
      // Hamburguesa → X: las rayas se mueven 6 px (la mitad del alto del ícono) y rotan.
      top.style.transform = open ? 'translateY(6px) rotate(45deg)' : '';
      middle.style.opacity = open ? '0' : '';
      bottom.style.transform = open ? 'translateY(-6px) rotate(-45deg)' : '';
    }
    syncBar();
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  links.forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus(); // devolver el foco al botón que abrió el menú
    }
  });
  window.addEventListener('scroll', syncBar, { passive: true });
  syncBar();
}

initHeader();
document.addEventListener('astro:page-load', initHeader);
