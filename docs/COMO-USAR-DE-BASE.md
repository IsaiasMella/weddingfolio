# Cómo usar este proyecto de base para un diseño propio

La idea: separar lo que es **identidad visual** (lo que cambiás para tu diseño) de lo que es **infraestructura** (lo que se queda igual y ya resuelve SEO, rendimiento, accesibilidad y contenido).

## Lo que cambiás

### 1. Tokens: colores, tipografía, ritmo ([`src/styles/tokens.css`](../src/styles/tokens.css))

Es el primer archivo que se toca y el que más impacto tiene.

1. **Primitivos:** reemplazá la paleta `--palette-*` por la tuya. Podés cambiar los nombres (`--palette-sand-100`, `--palette-olive-700`…).
2. **Semánticos:** reasigná `--background`, `--foreground`, `--accent`… a tus primitivos. Si tu diseño es claro por defecto, invertí los bloques: el claro en `:root` y el oscuro en `[data-theme='dark']`.
3. **Puente a Tailwind:** acá está la única decisión "grande". Tenés dos caminos:
   - **Mantener los nombres** (`ink`, `ivory`, `champagne`, `stone`): no tocás ningún componente, pero los nombres dejan de describir tu paleta.
   - **Renombrar a roles** (recomendado para un diseño nuevo): `--color-background`, `--color-foreground`, `--color-accent`… y reemplazar en los componentes `bg-ink` → `bg-background`, `text-ivory` → `text-foreground`, etc. Es un buscar y reemplazar; después el código se lee solo.
4. **Tokens nuevos** (`--tracking-*`, `--aspect-*`, `--shadow-glow`, `--text-2xs`): ajustá valores o borrá los que no uses.
5. **Movimiento** (sección 4): duraciones y recorridos de `.reveal` y del hero.

### 2. Tipografías ([`astro.config.mjs`](../astro.config.mjs) → `fonts`, [`src/styles/fonts.css`](../src/styles/fonts.css), [`src/layouts/BaseLayout.astro`](../src/layouts/BaseLayout.astro))

1. Poné tus `.woff2` en `src/assets/fonts/` (idealmente variables y ya recortadas al subset latin).
2. En `astro.config.mjs`, cambiá `name`, `cssVariable`, `weight` y `fallbacks` de cada familia.
   Si preferís no hospedarlas: `provider: fontProviders.google()` o `fontProviders.fontsource()` con el nombre de la familia (Astro las descarga en el build).
3. En `fonts.css`, apuntá `--font-sans` y `--font-display` a las nuevas variables.
4. En `BaseLayout.astro`, ajustá los `<Font … preload>`: precargá solo las 1–2 fuentes que se ven en el primer pantallazo.

### 3. Componentes visuales

Son los que definen "cómo se ve" cada pieza. Conservá la API (las props) y cambiá el marcado y las clases:

| Archivo | Qué define |
| --- | --- |
| `src/components/ui/Button.astro` | Estilo de botones (variantes y tamaños) |
| `src/components/ui/SectionHeading.astro` | Encabezado de sección (eyebrow + título + bajada) |
| `src/components/ui/PageIntro.astro` | Cabecera de páginas internas |
| `src/components/layout/Header.astro` / `Footer.astro` | Navegación, logo, pie |
| `src/components/sections/*` | Bloques de la home, about, services |
| `src/components/portfolio/*`, `src/components/blog/*` | Tarjetas, galería, cabeceras de detalle |
| `src/components/shared/CtaBanner.astro` | Llamado a la acción final |
| `src/styles/components/*.css` | Lo que no se puede expresar con utilidades: `.reveal`, `.hero-enter`, `.prose-wedding` (tipografía del Markdown) |
| `public/favicon.svg` | Ícono |

### 4. Contenido y datos del negocio

- [`src/data/site.ts`](../src/data/site.ts): nombre, descripción, contacto, redes, navegación, URL del sitio. Cambia a la vez el header, el footer, el SEO, el JSON-LD y `llms.txt`.
- `src/content/portfolio/*.md`, `src/content/blog/*.md`: un archivo por boda y por artículo.
- `src/content/*.yaml`: paquetes, testimonios, FAQ, pasos del proceso.

## Lo que queda igual

| Pieza | Por qué no hace falta tocarla |
| --- | --- |
| `src/layouts/BaseLayout.astro` (estructura) | `<html>`, `<head>`, orden de scripts, skip link, `<main id="main">` |
| `src/components/seo/Seo.astro` | Canonical, Open Graph, Twitter, JSON-LD, RSS y `llms.txt` enlazados. Todo sale de `site.ts` |
| `src/components/seo/ThemeScript.astro` | Anti-flash de tema y la clase `.js` |
| `src/components/ui/Photo.astro` | Optimización de imágenes, `width`/`height`, `srcset`, prioridad LCP |
| `src/content.config.ts` | Esquemas y validación. Solo lo tocás si tu contenido tiene campos nuevos |
| `src/lib/content.ts` | Orden, filtros (borradores), fechas, paginación |
| `src/pages/**/[...page].astro`, `[slug].astro` | Rutas, paginación y generación estática |
| `src/pages/rss.xml.ts`, `llms*.txt.ts`, `robots.txt.ts`, sitemap (integración) | SEO técnico |
| `src/scripts/*.ts` | Header, menú y aparición al hacer scroll (cambiá solo si cambia el comportamiento) |
| `src/styles/global.css`, `base.css` | Orden de la cascada y estilos globales mínimos |
| `scripts/verificacion/*` | Te sirven para comparar tu diseño contra una referencia o contra una versión anterior |

## Usar fotos propias (locales) en lugar de Unsplash

El proyecto usa URLs remotas para replicar el original. Con fotos propias conviene tenerlas en el repo:

1. Guardalas en `src/assets/photos/…`.
2. En `src/content.config.ts`, cambiá el esquema `photo` para usar el helper `image()` de Astro:

   ```ts
   schema: ({ image }) => z.object({
     cover: z.object({ src: image(), alt: z.string() }),
     // …
   }),
   ```

3. En el frontmatter, la ruta es relativa al `.md`: `src: ../../assets/photos/boda-1.jpg`.
4. `Photo.astro` acepta ese objeto sin cambios (tipá `src` como `ImageMetadata | string`). Con imágenes locales Astro conoce el tamaño real, así que `width`/`height` pasan a ser opcionales.
5. Podés sacar `image.remotePatterns` de `astro.config.mjs`.

## Orden sugerido para un diseño nuevo

1. `site.ts` (tu negocio) → 2. `tokens.css` (paleta y roles) → 3. fuentes → 4. `Button`, `SectionHeading`, `Header`, `Footer` → 5. secciones y tarjetas → 6. contenido → 7. `npm run build && npm run check`.
