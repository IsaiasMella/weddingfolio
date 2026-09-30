# Plan de reconstrucción — Weddingfolio (Elena & Co.)

Demo de referencia: <https://weddingfolio.pages.dev/> (copia local en `referencia/sitio`).

## 1. Tecnología de origen (rastros del compilado)

| Rastro | Dónde | Conclusión |
| --- | --- | --- |
| `<meta name="generator" content="Astro v7.1.3">` | `<head>` de todas las páginas | Astro 7.1 |
| `/*! tailwindcss v4.3.3 */`, `@layer theme, base, components, utilities`, `@property --tw-*` | `_astro/BaseLayout.*.css` | Tailwind CSS **v4.3.3** (plugin de Vite) |
| Un solo CSS llamado `BaseLayout.*.css` | `_astro/` | Los estilos se importan desde el layout `BaseLayout.astro` |
| `/_astro/photo-1519…_Z2rCVNW.webp` + `srcset` con 640/960/1280/1600/2000w | `<img>` | `astro:assets` con **imágenes remotas de Unsplash** (el nombre del archivo es el de la URL remota) |
| `<script type="module">` en línea, variables de una letra, `astro:page-load` | Final de `<header>` y de `<body>` | `<script>` de componentes Astro (Vite los minifica e inyecta en línea por ser chicos) |
| `sitemap-index.xml` + `sitemap-0.xml` | raíz | `@astrojs/sitemap` |
| `rss.xml` | raíz | `@astrojs/rss` |
| `llms.txt`, `llms-full.txt` | raíz | Endpoints propios (`src/pages/llms.txt.ts`) |
| Ids en los `<h2>` del blog (`id="protect-golden-hour"`) | artículos | Markdown procesado por Astro (slugs de encabezados) → Content Collections |

**Stack del proyecto nuevo:** Astro 7.3 (última estable) + TypeScript estricto + Tailwind 4.3.3 (misma versión exacta para que el CSS generado sea el mismo) con `@theme`.

## 2. CSS: generado vs. escrito por el autor

De las ~2150 líneas (formateado) del CSS compilado:

**Generado por Tailwind (no se copia, se regenera solo):**
- `@layer properties` (valores iniciales de `--tw-*`) y todos los `@property --tw-*`.
- `@layer base` hasta `[hidden]` (el *preflight*: reset).
- `@layer utilities` con cada utilidad usada en el HTML (`.mx-auto`, `.sm\:py-28`, …).
- Las variables de Tailwind por defecto dentro de `@layer theme` (`--spacing`, `--text-*`, `--leading-*`, `--container-*`, …). Tailwind solo emite las que se usan.

**Escrito por el autor (esto es lo que se reconstruye):**
1. En `@theme`: `--font-sans`, `--font-display`, 10 colores (`ink`, `ink-soft`, `ink-muted`, `champagne`, `champagne-light`, `champagne-deep`, `ivory`, `ivory-muted`, `stone`, `stone-light`) y `--ease-premium`.
2. En `@layer base`: `html { scroll-behavior: smooth }`, estilos de `body`, `::selection` y `:focus-visible`.
3. En `@layer utilities` (al final del bloque): `.reveal` + `.is-visible` + `.reveal-delay-1..4`, `.hero-enter` + delays + `@keyframes hero-fade`, `.prose-wedding` (escrito con `@apply`).
4. Fuera de capas: `@media (prefers-reduced-motion: reduce)` que anula `.reveal` y `.hero-enter`.

## 3. Inventario

### 3.1 Tokens existentes

| Tipo | Valores |
| --- | --- |
| Colores | ink `#0f0e0c`, ink-soft `#1a1814`, ink-muted `#2a2620`, champagne `#c4a574`, champagne-light `#d4b896`, champagne-deep `#a88b58`, ivory `#f5f0e8`, ivory-muted `#e8e0d4`, stone `#8a857c`, stone-light `#b5b0a6` |
| Tipografías | Outfit 300–700 (sans, cuerpo) · Cormorant Garamond 400–700 + itálica 400/500 (display) — desde Google Fonts |
| Espaciado | escala por defecto de Tailwind (`--spacing: .25rem`) |
| Radios | solo `--radius-sm` (imágenes de `.prose-wedding`) y `rounded-full` (viñetas) |
| Sombras | una sola, escrita a mano: `0 8px 30px -8px rgba(196,165,116,.45)` (hover del botón primario) y `shadow-lg` en el header al hacer scroll |
| Duraciones | 300 ms (colores, botones), 500 ms (header), 550 ms (reveal), 700 ms (zoom de fotos), 900 ms (entrada del hero) |
| Curvas | `--ease-premium: cubic-bezier(.4,0,.2,1)` |
| Breakpoints | los de Tailwind: `sm` 40rem, `md` 48rem, `lg` 64rem |

### 3.2 Valores repetidos a mano que deberían ser tokens

| Valor a mano | Veces | Token nuevo | Utilidad nueva |
| --- | --- | --- | --- |
| `ease-[var(--ease-premium)]` | 185 | ya existía `--ease-premium` (el autor no usó la utilidad que Tailwind genera) | `ease-premium` |
| `hover:shadow-[0_8px_30px_-8px_rgba(196,165,116,0.45)]` | 64 | `--shadow-glow` | `hover:shadow-glow` |
| `active:scale-[0.98]` | 94 | — (Tailwind 4 ya tiene la escala numérica: 98 = 98 %) | `active:scale-98` |
| `group-hover:scale-[1.03]` / `[1.04]` | 19 | — (ídem) | `group-hover:scale-103` / `-104` |
| `tracking-[0.16em]` `0.18em` `0.2em` `0.22em` `0.28em` | 147 | `--tracking-meta`, `--tracking-label`, `--tracking-caps`, `--tracking-eyebrow`, `--tracking-brand` | `tracking-meta`, … |
| `text-[0.65rem]` | 18 | `--text-2xs` | `text-2xs` |
| `focus:z-[100]` | 18 | — (Tailwind 4 acepta cualquier entero) | `focus:z-100` |
| `aspect-[4/5]`, `[16/10]`, `[21/9]`, `[2/1]`, `[16/11]`, `[4/3]` | 32 | `--aspect-portrait`, `--aspect-card`, `--aspect-cinema`, `--aspect-banner`, `--aspect-feature`, `--aspect-landscape` | `aspect-portrait`, … |
| `min-h-[100svh]`, `lg:min-h-[36rem]`, `max-h-[28rem]` | 8 | — (existen en la escala: `svh`, 144 × 0.25rem, 112 × 0.25rem) | `min-h-svh`, `lg:min-h-144`, `max-h-112` |
| `min-h-[80svh]`, `min-h-[70svh]` | 13 | `--height-page-hero` (70svh), `--height-page-center` (80svh) | `min-h-(--height-page-hero)` |
| Duraciones 550/900 ms y delays 100–450 ms en CSS del autor | — | `--duration-reveal`, `--duration-hero`, `--delay-step` | usados en `motion.css` |

### 3.3 Componentes (por patrón de clases y lugar en el HTML)

| Grupo | Componente | Aparece en |
| --- | --- | --- |
| Layout | `BaseLayout` (head, SEO, JSON-LD, fuentes, script de tema), `SkipLink`, `Header` (+ menú móvil), `Footer`, `RevealScript` | todas |
| UI base | `Button` (variantes `primary` / `ghost`, tamaño `sm`), `Container` (`max-w-7xl` / `max-w-3xl`), `SectionHeading` (eyebrow + título + bajada; `align`, `tone`), `PageIntro` (cabecera de páginas internas), `Eyebrow` | todas |
| Home | `Hero`, `FeaturedWork` + `WorkTile`, `Packages` + `PackageCard`, `Process`, `Testimonials`, `AboutPreview`, `JournalPreview`, `Faq` + `FaqItem`, `CtaBanner` | `/` (y `CtaBanner` en casi todas) |
| Portfolio | `ProjectCard`, `ProjectHero`, `Gallery` (columnas tipo *masonry*) | `/portfolio/`, `/portfolio/[slug]/` |
| Blog | `PostCard`, `PostHeader`, `Prose` (`.prose-wedding`), `TagList` | `/blog/`, `/blog/[slug]/` |
| Contacto | `ContactForm`, `Field` | `/contact/` |
| About | `Stats` | `/about/` |

### 3.4 Interactividad

| Pieza | Qué hace | Implementación original |
| --- | --- | --- |
| Header | Al pasar 40 px de scroll agrega fondo `bg-ink/90` + `backdrop-blur` + sombra | script en línea |
| Menú móvil | Overlay a pantalla completa, botón hamburguesa animado (→ X), `Escape` cierra, bloquea el scroll del body | mismo script |
| Reveal | `IntersectionObserver` agrega `.is-visible`; respeta `prefers-reduced-motion` | script en línea al final del body |
| Hero | Animación CSS de entrada (`hero-fade`) | solo CSS |
| FAQ | `<details>`/`<summary>` nativos, el "+" rota 45° con `group-open:` | solo CSS |
| Formulario | Muestra un mensaje de éxito al enviar (`mailto:`) | script en línea |
| Tema claro/oscuro | **No existe.** El sitio es oscuro fijo | — |
| Carruseles / visor de fotos | **No existen.** Las galerías son columnas estáticas | — |

## 4. Arquitectura propuesta (con su equivalente en React/Next)

```
src/
  styles/
    global.css        ← punto de entrada (como app/globals.css en Next)
    tokens.css        ← primitivos → semánticos → @theme de Tailwind
    fonts.css         ← familias tipográficas
    base.css          ← estilos globales mínimos (@layer base)
    components/*.css  ← un archivo por componente con CSS propio (reveal, hero, prose)
  layouts/
    BaseLayout.astro  ← app/layout.tsx (html, head, header, footer)
  components/
    seo/Seo.astro, seo/ThemeScript.astro  ← generateMetadata() / next-themes
    layout/Header.astro, Footer.astro …   ← componentes de servidor (RSC) sin JS
    ui/Button.astro, Container.astro …    ← componentes de presentación
    sections/*.astro                      ← bloques de página
  content/            ← datos en Markdown/YAML (como un CMS en archivos)
  content.config.ts   ← esquemas zod (como tipos + validación de un CMS)
  pages/              ← app/ (enrutado por archivos)
    index.astro, about.astro, …
    portfolio/[...page].astro, portfolio/[slug].astro   ← generateStaticParams()
    blog/[...page].astro, blog/[slug].astro
    rss.xml.ts, llms.txt.ts, llms-full.txt.ts, robots.txt.ts ← route handlers (app/…/route.ts)
  scripts/            ← JS de cliente (lo que en React sería un "use client" chiquito)
  data/site.ts        ← configuración del sitio (nombre, contacto, navegación)
```

| Pieza Astro | Equivalente React/Next |
| --- | --- |
| `.astro` sin `<script>` | Server Component: renderiza HTML, no manda JS |
| `<script>` dentro de un `.astro` | Un Client Component mínimo; Astro lo empaqueta y lo manda **una sola vez** aunque el componente se use 10 veces |
| `Astro.props` | `props` |
| `<slot />` | `children` |
| `getStaticPaths()` | `generateStaticParams()` |
| `getCollection('blog')` | `fetch` a un CMS / leer MDX con `contentlayer` |
| `<Image />` de `astro:assets` | `next/image` (pero se optimiza en el build, no en runtime) |
| `paginate()` | paginación manual con `generateStaticParams` |

**Contenido:** colecciones `portfolio` y `blog` (Markdown con frontmatter) y colecciones de datos `packages`, `testimonials`, `faq`, `process` (YAML). Las imágenes quedan como URL remotas de Unsplash + `alt` (igual que el original, así el pipeline de `astro:assets` genera los mismos archivos).

**Paginación real:** `/blog/` y `/portfolio/` usan `paginate()` con 9 elementos por página. Con el contenido actual (5 posts y 6 bodas) sale una sola página, idéntica al original; si se agregan más, aparecen `/blog/2/` etc. y el paginador.

## 5. Reparto de trabajo

| Quién | Qué | Archivos propios |
| --- | --- | --- |
| Yo (Fase 2) | Tokens, fuentes, base, CSS de componentes, verificación de CSS | `src/styles/**`, `scripts/verificacion/**` |
| Yo (Fase 3, base) | Config, layout, SEO, tema, header, footer, UI base, colecciones y esquemas | `astro.config.mjs`, `src/layouts/**`, `src/components/{seo,layout,ui}/**`, `src/content.config.ts`, `src/data/**`, `src/scripts/**` |
| Subagente A — contenido repetible | Portfolio y blog: contenido, listados con paginación, detalle, cards, galería, RSS, llms | `src/content/{portfolio,blog}/**`, `src/components/{portfolio,blog}/**`, `src/pages/{portfolio,blog}/**`, `src/pages/{rss.xml,llms.txt,llms-full.txt}.ts` |
| Subagente B — páginas fijas | Home, about, services, contact, 404 y sus secciones | `src/content/{packages,testimonials,faq,process}/**`, `src/components/{sections,contact}/**`, `src/pages/{index,about,services,contact,404}.astro` |
| Yo (Fase 4) | Integración, build, `astro check`, verificación final, documentación | `docs/**`, raíz |

Ningún subagente toca `src/styles`, `src/layouts`, `src/components/{ui,layout,seo}` ni la config; si necesitan un cambio ahí, me lo informan en el resumen.
