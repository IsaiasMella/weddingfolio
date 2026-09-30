# Errores comunes y dónde se evitan en este proyecto

Cada error con: qué es, cómo se ve, cómo lo evita este código y el lugar exacto (archivo + lo que hay que buscar).

---

## 1. Flash del tema (FOUC de tema)

**Qué es:** la página se pinta con un tema y, un instante después, JavaScript aplica el guardado y todo cambia de color.

**Por qué pasa:** el tema se aplica en un `useEffect` o en un script diferido (`type="module"`, `defer`), que corre **después** del primer pintado.

**Cómo se evita acá:**

- El tema por defecto (oscuro, el del original) está en `:root` en CSS puro: sin JS ya está bien.
- El tema guardado se aplica con un script **en línea y bloqueante** dentro del `<head>`, antes de que exista el `<body>`.

**Dónde:**
- [`src/components/seo/ThemeScript.astro`](../src/components/seo/ThemeScript.astro) → `<script is:inline>` (`is:inline` evita que Astro lo convierta en módulo diferido).
- [`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro) → `<ThemeScript />` va dentro de `<head>`, antes de `<Seo />` y de las fuentes.
- [`src/styles/tokens.css`](../src/styles/tokens.css) → `:root, :root[data-theme='dark']` y `:root[data-theme='light']`, más `color-scheme`, que también ajusta scrollbars y controles nativos.

---

## 2. Flash de fuentes (FOIT/FOUT) y salto al cambiar de fuente

**Qué es:** el texto aparece invisible (FOIT) o con una fuente del sistema que después cambia a la definitiva (FOUT). Como las dos fuentes tienen distinto ancho y alto, el texto se reacomoda y la página "salta".

**Cómo se evita acá:**

- `font-display: swap` → nunca hay texto invisible.
- **Precarga** solo de las dos fuentes del primer pantallazo (Outfit 400 para el cuerpo y Cormorant 500 para los títulos): empiezan a bajar junto con el HTML, no después del CSS.
- **Fuente de respaldo ajustada:** Astro genera una `@font-face` "fallback" sobre Arial/Georgia con `size-adjust`, `ascent-override` y `descent-override` calculados para imitar las métricas de la fuente real. El cambio de fuente casi no mueve el texto.
- Las fuentes se sirven desde el propio dominio (sin la conexión extra a Google).

**Dónde:**
- [`astro.config.mjs`](../astro.config.mjs) → bloque `fonts: [...]` (proveedor local, pesos variables `'300 700'`).
- [`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro) → `<Font cssVariable="--font-outfit" preload={[{ weight: 400, style: 'normal' }]} />`.
- [`src/styles/fonts.css`](../src/styles/fonts.css) → `--font-sans: var(--font-outfit, …)` conecta la variable de Astro (que ya incluye el respaldo ajustado) con Tailwind.

**El original** usaba `<link>` a Google Fonts con `display=swap`: sin precarga ni respaldo ajustado.

---

## 3. Saltos de diseño por imágenes (CLS)

**Qué es:** el texto se dibuja y, cuando termina de bajar una foto, todo se empuja hacia abajo.

**Cómo se evita acá:**

- Toda imagen pasa por `Photo.astro`, que exige `width` y `height` (TypeScript no compila sin ellos). El navegador reserva el espacio con esa proporción antes de descargar nada.
- Los contenedores de las fotos tienen una proporción fija (`aspect-portrait`, `aspect-card`…) y un color de fondo (`bg-ink-muted`) mientras cargan.
- La imagen principal (LCP) usa `priority`: `loading="eager"`, `fetchpriority="high"` y `decoding="sync"`. El resto usa `loading="lazy"` para no competir por el ancho de banda.

**Dónde:**
- [`src/components/ui/Photo.astro`](../src/components/ui/Photo.astro) → `type Props` (`width: number; height: number` obligatorios) y la línea `const loading = priority || eager ? 'eager' : 'lazy'`.
- [`src/styles/tokens.css`](../src/styles/tokens.css) → `--aspect-*`.

---

## 4. JavaScript de más

**Qué es:** mandar un framework entero (o hidratar componentes) para un sitio que es casi todo contenido estático.

**Cómo se evita acá:**

- Todos los componentes `.astro` se renderizan a HTML en el build y **no mandan JS**. Solo hay tres scripts chicos en todo el sitio: header/menú, aparición al hacer scroll y el mensaje del formulario de contacto.
- Cada script es un `<script>` de Astro que importa un módulo: Astro lo empaqueta **una vez** aunque el componente aparezca muchas veces, y si es chico lo incrusta en el HTML (sin un pedido extra).
- Lo que se puede hacer sin JS, se hace sin JS: el FAQ usa `<details>/<summary>` nativo; la entrada del hero es una animación CSS.

**Dónde:**
- [`src/components/layout/Header.astro`](../src/components/layout/Header.astro) → `<script> import '@/scripts/header'; </script>` al final.
- [`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro) → `<script> import '@/scripts/reveal'; </script>`.
- `src/components/contact/` → el script del formulario, solo en `/contact`.

**En React/Next** el equivalente sería mantener todo como Server Components y marcar `"use client"` solo en esas tres piezas.

---

## 5. Animaciones que esconden contenido si falla el JS

**Qué es:** el CSS oculta los elementos (`opacity: 0`) esperando que un script los muestre. Si el script falla (error de otro script, bloqueador, JS desactivado, bot que no ejecuta JS), el contenido **nunca aparece**. En el sitio original pasaba esto con casi todas las secciones.

**Cómo se evita acá:**

- El estado oculto solo se aplica si `<html>` tiene la clase `js`, que la agrega el script bloqueante del `<head>`. Sin JS: todo visible.
- `prefers-reduced-motion: reduce` muestra todo sin animar, tanto desde CSS como desde el script.

**Dónde:**
- [`src/styles/components/reveal.css`](../src/styles/components/reveal.css) → `:where(.js) .reveal { opacity: 0; … }`.
- [`src/components/seo/ThemeScript.astro`](../src/components/seo/ThemeScript.astro) → `root.classList.add('js')`.
- [`src/scripts/reveal.ts`](../src/scripts/reveal.ts) → rama `prefers-reduced-motion`.

**Detalle fino:** se usa `:where(.js)` y no `.js` a secas porque `:where()` no suma especificidad. Con `.js .reveal` (más específico), la propiedad `transition` de `.reveal` pisaría el `transition-delay` de `.reveal-delay-N` y se perdería la aparición escalonada.

---

## 6. Estilos que se pisan

**Qué es:** una regla gana a otra por orden o especificidad y el resultado cambia al mover CSS de lugar (muy común al "desarmar" un CSS compilado en archivos).

**Cómo se evita acá:**

- **Capas de cascada** (`@layer`): el orden de prioridad no depende del orden de los archivos sino de la capa: `theme` < `base` < `components` < `utilities` < CSS sin capa. Los estilos globales van en `@layer base` (cualquier utilidad los pisa); los de componentes van en `@layer utilities`, igual que en el original; los `@media (prefers-reduced-motion)` van sin capa para ganar siempre.
- El **orden de los imports** en `global.css` reproduce el orden del CSS original, y está comentado.
- Se verificó compilando el CSS nuevo, poniéndolo en lugar del original en una copia del sitio y comparando capturas (0 % de diferencia; ver `VERIFICACION.md`).
- El botón compacto del header usa `!` (`!px-5`) en lugar de depender de que su clase quede después en el CSS.
- Las clases que agrega JavaScript (`bg-ink/90`, `backdrop-blur-md`…) están escritas **completas** en `header.ts`, para que Tailwind las encuentre al escanear el código y las genere.

**Dónde:**
- [`src/styles/global.css`](../src/styles/global.css) → comentario inicial y orden de `@import`.
- [`src/styles/base.css`](../src/styles/base.css) → `@layer base { … }`.
- [`src/components/ui/Button.astro`](../src/components/ui/Button.astro) → `size === 'sm' && '!px-5 !py-2.5 !text-xs'`.
- [`src/scripts/header.ts`](../src/scripts/header.ts) → `const SCROLLED = ['bg-ink/90', …]`.

---

## 7. Extra: espacios que desaparecen en Astro

**Qué es:** el compilador de Astro borra los espacios en blanco que incluyen un salto de línea entre un texto (o una expresión `{}`) y una etiqueta. `Theme by⏎<a>` se vuelve `Theme by<a>` y en pantalla sale "byNoel".

**Cómo se evita acá:** donde el espacio importa, texto y etiqueta van en la misma línea. Se detectó con la comparación de píxeles de la 404.

**Dónde:** [`src/components/layout/Footer.astro`](../src/components/layout/Footer.astro) → comentario `Todo en una línea…`.

---

## 8. Extra: el menú móvil atrapado por `backdrop-filter`

**Qué es:** si un elemento tiene `backdrop-filter` (o `transform`, o `filter`), se convierte en el "bloque contenedor" de sus descendientes `position: fixed`. Un overlay `fixed inset-0` dentro de él deja de cubrir la pantalla y queda del tamaño del header.

**Cómo se evita acá:** el desenfoque y el fondo van en la **barra** (`data-header-bar`), y el overlay del menú es su hermano, no su hijo.

**Dónde:** [`src/components/layout/Header.astro`](../src/components/layout/Header.astro) → comentario `El fondo/blur va en esta barra y NO en <header>…`.
