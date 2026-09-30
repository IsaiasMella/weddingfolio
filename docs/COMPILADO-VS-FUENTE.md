# Compilado vs. fuente: tres ejemplos

Cómo se leyó el sitio publicado (minificado) y cómo quedó el código fuente reconstruido. En cada ejemplo: qué se ve en el compilado, qué se escribió y qué pistas lo delataron.

---

## 1. Un botón: de 20 clases repetidas a un componente

### Antes: HTML compilado (se repite así 94 veces en el sitio)

```html
<a href="/contact" class="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm
  font-medium tracking-wide transition-all duration-300 ease-[var(--ease-premium)]
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne
  disabled:opacity-50 bg-champagne text-ink hover:bg-champagne-light
  hover:shadow-[0_8px_30px_-8px_rgba(196,165,116,0.45)] active:scale-[0.98] w-full sm:w-auto"
>Check Availability</a>
```

### Después: uso en una página

```astro
<Button href={PRIMARY_CTA.href} class="w-full sm:w-auto">{PRIMARY_CTA.label}</Button>
<Button href={`mailto:${SITE.email}`} variant="ghost">Email {SITE.email}</Button>
```

### Después: el componente ([`src/components/ui/Button.astro`](../src/components/ui/Button.astro))

```astro
const classes = [
  'inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium tracking-wide',
  'transition-all duration-300 ease-premium',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne disabled:opacity-50',
  variant === 'primary'
    ? 'bg-champagne text-ink hover:bg-champagne-light hover:shadow-glow'
    : 'border border-ivory/25 text-ivory hover:border-champagne hover:text-champagne-light',
  'active:scale-98',
  size === 'sm' && '!px-5 !py-2.5 !text-xs',
  className,
];
```

**Pistas en el compilado:** el mismo prefijo de clases en cada botón, solo con dos "colas" distintas (`bg-champagne…` o `border border-ivory/25…`). Eso es un componente con una prop `variant`. El botón del header termina en `!py-2.5 !px-5 !text-xs`: es la prop `size="sm"`. Los valores entre corchetes (`ease-[var(--ease-premium)]`, `shadow-[…]`, `scale-[0.98]`) pasaron a ser tokens (`ease-premium`, `shadow-glow`) o a la escala nativa (`scale-98`).

**En React** sería un `<Button variant size>` con `clsx`/`cva`. En Astro no manda JavaScript al navegador: se renderiza a HTML en el build.

---

## 2. El script de aparición: de minificado a módulo legible

### Antes: `<script type="module">` en línea, al final del `<body>` de cada página

```js
function e(){let e=document.querySelectorAll(`.reveal`);if(!e.length)return;if(window.matchMedia(
`(prefers-reduced-motion: reduce)`).matches){e.forEach(e=>e.classList.add(`is-visible`));return}
let t=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(
`is-visible`),t.unobserve(e.target))})},{threshold:.12,rootMargin:`0px 0px -8% 0px`});
e.forEach(e=>t.observe(e))}e(),document.addEventListener(`astro:page-load`,e);
```

### Después: [`src/scripts/reveal.ts`](../src/scripts/reveal.ts)

```ts
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
    // 12 % del elemento visible, y un margen inferior de -8 % …
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  elements.forEach((el) => observer.observe(el));
}

initReveal();
document.addEventListener('astro:page-load', initReveal);
```

y en el layout, una sola vez:

```astro
<script>
  import '@/scripts/reveal';
</script>
```

**Pistas en el compilado:** variables de una letra y *template literals* en lugar de comillas: es la minificación de Vite/esbuild. Que esté **en línea** (y no en un `.js` aparte) indica un `<script>` de un componente Astro: cuando el módulo es chico, Astro lo incrusta en el HTML. `astro:page-load` es el evento de `<ClientRouter />` (view transitions): el autor dejó el código preparado para usarlo.

**Mejora respecto del original:** ahora `.reveal` solo oculta contenido si existe la clase `.js` en `<html>` (la agrega el script bloqueante del `<head>`). En el original, si este script fallaba, casi todo el sitio quedaba con `opacity: 0`.

---

## 3. CSS: del compilado de Tailwind a tokens + un archivo por componente

### Antes: fragmentos de `/_astro/BaseLayout.6gvLI8d5.css` (formateado)

```css
@layer theme {
  :root, :host {
    --font-display: "Cormorant Garamond", Georgia, "Times New Roman", serif;
    --color-ink: #0f0e0c;
    --color-champagne: #c4a574;
    /* … 8 colores más … */
    --ease-premium: cubic-bezier(0.4, 0, 0.2, 1);
  }
}
@layer utilities {
  /* … ~1300 líneas de utilidades generadas … */
  .bg-ink\/90 { background-color: #0f0e0ce6 }
  @supports (color: color-mix(in lab, red, red)) {
    .bg-ink\/90 { background-color: color-mix(in oklab, var(--color-ink) 90%, transparent) }
  }
  /* … y al final, lo que escribió el autor: */
  .reveal {
    opacity: 0;
    transition: opacity .55s var(--ease-premium), transform .55s var(--ease-premium);
    transform: translateY(1.25rem);
  }
  .reveal.is-visible { opacity: 1; transform: translateY(0) }
  .reveal-delay-1 { transition-delay: .1s }
  /* … */
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto }
  .reveal, .reveal.is-visible { opacity: 1; transition: none; transform: none }
  .hero-enter, … { opacity: 1; animation: none; transform: none }
}
```

### Después: [`src/styles/tokens.css`](../src/styles/tokens.css)

```css
@layer theme {
  :root { --palette-ink-950: #0f0e0c; --palette-champagne-400: #c4a574; /* … */ }
  :root, :root[data-theme='dark'] {
    --background: var(--palette-ink-950);
    --accent: var(--palette-champagne-400);
    /* … */
  }
}
@theme {
  --color-ink: var(--background);
  --color-champagne: var(--accent);
  --ease-premium: cubic-bezier(0.4, 0, 0.2, 1);
}
@layer theme {
  :root { --duration-reveal: 0.55s; --distance-reveal: 1.25rem; --delay-step: 0.1s; }
}
```

### Después: [`src/styles/components/reveal.css`](../src/styles/components/reveal.css)

```css
@layer utilities {
  :where(.js) .reveal {
    opacity: 0;
    transition:
      opacity var(--duration-reveal) var(--ease-premium),
      transform var(--duration-reveal) var(--ease-premium);
    transform: translateY(var(--distance-reveal));
  }
  :where(.js) .reveal.is-visible { opacity: 1; transform: translateY(0); }
  .reveal-delay-1 { transition-delay: calc(var(--delay-step) * 1); }
  /* … */
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal.is-visible { opacity: 1; transition: none; transform: none; }
}
```

**Cómo se separó lo generado de lo escrito a mano:**

- `@layer properties`, los `@property --tw-*`, el reset de `@layer base` y todas las utilidades (`.bg-ink\/90`, `.sm\:py-28`…) los **genera Tailwind** a partir de las clases del HTML: no se copian, se regeneran solos.
- Las variables de `@layer theme` que no son de Tailwind por defecto (`--color-ink`, `--font-display`, `--ease-premium`) salen del `@theme` del autor.
- Las reglas con nombres que Tailwind no conoce (`.reveal`, `.hero-enter`, `.prose-wedding`) están al **final** de `@layer utilities`, después de todas las generadas: el autor las escribió en `@layer utilities { … }`.
- El `@media (prefers-reduced-motion)` está **fuera de toda capa**: el autor lo escribió suelto (el CSS sin capa le gana a cualquier capa, por eso anula `.reveal` sin necesitar más especificidad).

**Qué cambió al reconstruir:** cada valor pasó a un token; el `@media` quedó junto a su componente (en `reveal.css` y `hero.css`), no en un bloque general; y como `--color-ink` ahora es `var(--background)`, Tailwind ya no puede precalcular el `#0f0e0ce6` de respaldo (ver `DECISIONES.md` §11).
