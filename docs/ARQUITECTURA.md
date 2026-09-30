# Arquitectura

Guía para alguien que viene de React/Next.js. Primero el mapa, después cómo viaja el contenido hasta la página y, al final, en qué orden leer el código.

## Comandos

```sh
npm install
npm run dev       # servidor de desarrollo en http://localhost:4321
npm run build     # genera el sitio estático en dist/
npm run preview   # sirve dist/ para probar el build
npm run check     # astro check: tipos de TypeScript + errores de plantillas .astro
```

Verificación visual contra el original (opcional, ver `VERIFICACION.md`):

```sh
npm run build
node scripts/verificacion/capturas.mjs --a referencia/sitio --b dist --salida .capturas/final
```

## Mapa de carpetas

```
astro.config.mjs        Config de Astro (≈ next.config.js): URL del sitio, Tailwind, sitemap, imágenes remotas, fuentes
tsconfig.json           TypeScript estricto (astro/tsconfigs/strictest) + alias @/ → src/
public/                 Archivos que se copian tal cual (favicon.svg)
referencia/             Copia del sitio original para comparar. NO se publica
scripts/verificacion/   Servidor estático, capturas con Playwright, comparación de píxeles
docs/                   Esta documentación

src/
├─ content.config.ts    Colecciones de contenido + esquemas zod (el "modelo de datos")
├─ content/             El contenido en sí
│  ├─ portfolio/*.md      una boda por archivo (frontmatter + texto en Markdown)
│  ├─ blog/*.md           un artículo por archivo
│  └─ *.yaml              paquetes, testimonios, FAQ, pasos del proceso
├─ data/site.ts         Identidad del negocio, contacto, navegación (≈ siteConfig)
├─ lib/content.ts       Consultas: orden, filtros, fechas, paginación
├─ layouts/
│  └─ BaseLayout.astro  El <html> de todas las páginas (≈ app/layout.tsx)
├─ pages/               Enrutado por archivos (≈ app/)
│  ├─ index.astro         /
│  ├─ about.astro         /about/
│  ├─ services.astro      /services/
│  ├─ contact.astro       /contact/
│  ├─ 404.astro           /404.html
│  ├─ portfolio/
│  │  ├─ [...page].astro  /portfolio/, /portfolio/2/… (paginado)
│  │  └─ [slug].astro     /portfolio/maya-jordan-sonoma/…
│  ├─ blog/
│  │  ├─ [...page].astro  /blog/, /blog/2/…
│  │  └─ [slug].astro     /blog/wedding-timeline-that-breathes/…
│  ├─ rss.xml.ts          /rss.xml   (≈ route handler)
│  ├─ llms.txt.ts         /llms.txt  (resumen del sitio para IA)
│  ├─ llms-full.txt.ts    /llms-full.txt
│  └─ robots.txt.ts       /robots.txt
├─ components/
│  ├─ seo/              Seo.astro (metadatos + JSON-LD), ThemeScript.astro (anti-flash)
│  ├─ layout/           Header.astro, Footer.astro, SkipLink.astro
│  ├─ ui/               Piezas genéricas: Button, Container, Photo, SectionHeading, PageIntro
│  ├─ shared/           CtaBanner.astro (bloque que usan varias páginas)
│  ├─ sections/         Bloques de la home, about y services
│  ├─ contact/          Formulario de contacto (+ su script)
│  ├─ portfolio/        Tarjetas, portada y galería de bodas
│  └─ blog/             Tarjetas, cabecera, etiquetas y paginación del journal
├─ scripts/             JavaScript de cliente: header.ts, reveal.ts
├─ assets/fonts/        .woff2 de Outfit y Cormorant Garamond
└─ styles/
   ├─ global.css        Punto de entrada: importa todo en el orden correcto de la cascada
   ├─ tokens.css        Primitivos → semánticos → @theme de Tailwind → tokens de componente
   ├─ fonts.css         Familias tipográficas
   ├─ base.css          Estilos globales mínimos (@layer base)
   └─ components/       CSS que no se puede expresar con utilidades: reveal, hero, prose
```

## Equivalencias con React/Next

| Astro | React / Next | Nota |
| --- | --- | --- |
| Archivo `.astro` | Server Component | El bloque `---` (frontmatter) corre en el **build**; el resto es JSX-like que se vuelve HTML. No manda JS al navegador. |
| `Astro.props` | `props` | Tipadas con `type Props = {…}` en el frontmatter. |
| `<slot />` | `children` | También hay slots con nombre (`<slot name="x" />`). |
| `class:list={[…]}` | `clsx(…)` | Une clases condicionales. |
| `<script>` en un `.astro` | Un Client Component chico | Astro lo empaqueta como módulo, lo incluye **una vez** por página y lo incrusta si es chico. |
| `<script is:inline>` | `<Script strategy="beforeInteractive">` | Se publica tal cual, bloqueante. Solo para el anti-flash del tema. |
| `getStaticPaths()` | `generateStaticParams()` | Qué rutas dinámicas generar en el build. |
| `paginate()` | Paginación manual | Arma `page.data`, `page.url.next`, etc. |
| `getCollection('blog')` | Leer MDX / llamar a un CMS | Tipado por el esquema zod. |
| `render(entry)` → `<Content />` | `<MDXRemote />` | Convierte el Markdown en HTML. |
| `<Image />` (astro:assets) | `next/image` | Pero optimiza en el **build**: el sitio publicado son archivos estáticos. |
| `src/pages/x.ts` con `GET` | `app/x/route.ts` | Endpoints que generan archivos (RSS, robots, llms). |

## Cómo fluye el contenido hasta la página

Ejemplo: la boda de Maya y Jordan.

```
src/content/portfolio/maya-jordan-sonoma.md
  │  frontmatter (couple, location, date, cover, gallery…) + cuerpo en Markdown
  ▼
src/content.config.ts
  │  loader glob() lo encuentra; el esquema zod lo VALIDA (si falta `date`,
  │  el build falla con un mensaje claro) y convierte "2025-09-14" en Date
  ▼
src/lib/content.ts → getProjects()
  │  trae la colección y la ordena por fecha (una sola regla para todo el sitio)
  ▼
src/pages/portfolio/[slug].astro
  │  getStaticPaths(): una ruta por boda → /portfolio/maya-jordan-sonoma/
  │  render(entry): Markdown → <Content />
  ▼
componentes (portada, texto con .prose-wedding, galería, CtaBanner)
  │  cada foto pasa por Photo.astro → <Image /> de astro:assets
  ▼
BaseLayout.astro
  │  <head> con SEO (título, og:image = foto de portada, JSON-LD), header, footer
  ▼
dist/portfolio/maya-jordan-sonoma/index.html  +  /_astro/*.webp  +  /_astro/*.css
```

La misma boda aparece también en `/portfolio/` (tarjeta), en la home (si `featured: true`), en `llms.txt`, en `llms-full.txt` y en el sitemap, **sin repetir datos**: todos leen la misma colección.

Los estilos siguen su propio camino: `BaseLayout.astro` importa `src/styles/global.css` → Tailwind escanea `src/**` buscando clases → genera **un solo CSS** con las utilidades usadas + los tokens + el CSS de componentes → Astro lo enlaza en cada página.

## Orden sugerido de lectura

1. **`docs/PLAN.md`**: qué era el sitio original y qué se decidió.
2. **`src/styles/tokens.css`** y **`docs/TOKENS.md`**: el sistema de diseño; todo lo demás lo usa.
3. **`src/styles/global.css`** → `base.css` → `components/*.css`: cómo se arma la cascada.
4. **`src/data/site.ts`** y **`src/content.config.ts`**: los datos y su forma.
5. **`src/layouts/BaseLayout.astro`** → `components/seo/*` → `components/layout/*`: el esqueleto de toda página.
6. **`src/components/ui/*`**: las piezas reutilizables (empezá por `Button` y `Photo`).
7. **`src/pages/index.astro`** y `components/sections/*`: una página completa armada con esas piezas.
8. **`src/lib/content.ts`** → `src/pages/portfolio/*` y `src/pages/blog/*`: contenido dinámico, rutas y paginación.
9. **`src/scripts/*`** y `components/contact/*`: el poco JavaScript que hay.
10. **`docs/ERRORES-COMUNES.md`**: los detalles finos y por qué el código está escrito así.
