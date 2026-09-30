# Informe final

Reconstrucción del código fuente de <https://weddingfolio.pages.dev/> en Astro 7.3 + TypeScript estricto + Tailwind 4.3.3, tokenizado y por componentes.

## Resumen

| | |
| --- | --- |
| Páginas | 18 (las mismas del original) + RSS, sitemap, `robots.txt`, `llms.txt`, `llms-full.txt` |
| Comparación visual | 72 capturas (18 rutas × 1440/390 px × dark/light): **58 idénticas**, 14 con ≤ 0,0005 % (píxeles sueltos dentro de 2 fotos), **0 con altura distinta** |
| Archivos de SEO | Idénticos byte a byte |
| `npm run build` / `astro check` | 0 errores, 0 advertencias |
| JavaScript | 3 scripts chicos (~1,8 KB en línea por página) + el script del tema, igual que el original |

Detalle en [`VERIFICACION.md`](VERIFICACION.md). Todas las decisiones, con su justificación, en [`DECISIONES.md`](DECISIONES.md).

## Qué quedó idéntico

- **Todo lo visible en Chromium a 1440 px y a 390 px**, en todas las páginas, incluidos el menú móvil abierto, el header con scroll y el foco del teclado.
- **El marcado** de `<main>` de cada página: mismas etiquetas, atributos, textos y espacios. Cambian solo los nombres de las clases que eran valores a mano (`tracking-[0.22em]` → `tracking-eyebrow`), que dan el mismo valor.
- **El CSS computado:** el CSS nuevo, puesto en lugar del original dentro del HTML original, da 72/72 capturas idénticas.
- **Sitemap, RSS, `robots.txt`, `llms.txt` y `llms-full.txt`**, byte a byte.
- **Metadatos** (título, description, canonical, Open Graph, Twitter, JSON-LD).
- **Las fuentes:** son los mismos `.woff2` que servía Google.

## Qué quedó parecido, y por qué

| Qué | Diferencia | Por qué |
| --- | --- | --- |
| Fotos `photo-1606216794074` (3 galerías) y el retrato de /about | ~20 y 2 píxeles distintos | El `.webp` generado hoy no es byte a byte el del original (fuente de Unsplash o versión de `sharp`). No se pudo reproducir con ninguna calidad. |
| Variante de 2000w de las fotos | 1600 px reales en lugar de 2000 | Astro 7.3 no agranda imágenes (7.1 sí). Solo se usaría en pantallas 2x grandes. |
| Nombres de archivo en `/_astro/` | Otros hashes | Dependen de la versión de Astro. |
| Carga de fuentes | `@font-face` propio + `preload` en lugar de `<link>` a Google | Mejora a propósito: sin conexión a terceros, con precarga y con respaldo de métricas ajustadas. Mismo resultado final. |
| Sin JavaScript | El contenido se ve (en el original, 35 de 35 secciones quedaban invisibles) | Mejora a propósito (`ERRORES-COMUNES.md` §5). |
| `Escape` en el menú | Devuelve el foco al botón | Mejora de accesibilidad. |
| Meta descriptions de /about y /contact | "Elena & Co." en lugar de "Elena & Co.." | Corrección de un error del original. |
| `<meta name="generator">` | Astro v7.3.5 | Se pidió la última versión estable. |
| Colores con opacidad en navegadores sin `color-mix()` (anteriores a 2023) | Color sólido en lugar de translúcido | Costo de que los colores sean variables (y haya temas). |

## Valores que no se pudieron tokenizar

| Valor | Dónde | Por qué queda escrito a mano |
| --- | --- | --- |
| Breakpoints en px dentro de `sizes` (`(max-width: 1024px) 100vw, 50vw`) | Componentes con `<Photo>` | `sizes` lo lee el navegador desde el HTML, antes del CSS, y no admite `var()`. Buscar `max-width:` si cambian los breakpoints. |
| `#0f0e0c` en `style="background-color: var(--color-ink, #0f0e0c)"` | `Header.astro` (overlay del menú) | Es el respaldo de un estilo en línea, para que el menú sea opaco aunque el CSS no haya cargado. Está comentado. |
| Anchos y altos de imágenes (`width={1200} height={1500}`) | Componentes | Son la proporción intrínseca que el navegador usa para reservar espacio, no un valor de diseño. |
| `widths` del `srcset` (640…2000) | `Photo.astro` | Parámetro de optimización, no de diseño. |
| `40` px de scroll para el header, `6` px del ícono hamburguesa | `src/scripts/header.ts` | Viven en JavaScript, como constantes con nombre (`SCROLL_THRESHOLD`) y comentadas. |
| `threshold: 0.12`, `rootMargin: -8%` | `src/scripts/reveal.ts` | Parámetros del `IntersectionObserver`, comentados. |
| `[&::-webkit-details-marker]:hidden` | `FaqItem.astro` | Selector de compatibilidad para Safari, no un valor. |
| Rango Unicode del subset latin | `astro.config.mjs` | Dato técnico de la fuente. |

## Qué no se pudo verificar

- El sitio **en vivo** con el navegador (el Chromium del entorno no acepta el certificado del proxy). Se verificó la copia local por hash: 245/245 archivos idénticos.
- **Firefox y Safari** (solo hay Chromium).
- **Pantallas 2x** y los estados **hover/active** (no se capturan).
- El **tema claro** no tiene contra qué compararse (el original no lo tiene). Funciona como demostración, pero los degradés sobre fotos (`from-ink`) también se aclaran. En un tema claro real conviene un token fijo para esas capas, por ejemplo `--scrim`, que no cambie con el tema.

## Decisiones importantes tomadas sin consultar

Las 31 están en [`DECISIONES.md`](DECISIONES.md). Las que más cambian el resultado:

1. **No hay modo claro en el original.** El oscuro es el default (se ve igual con cualquier preferencia del sistema) y el claro queda como demostración, sin botón. Agregar un botón habría cambiado el diseño.
2. **Se mantienen los nombres de color del original** (`ink`, `ivory`…) como utilidades, apuntando a tokens semánticos. Así el marcado es el mismo; en `COMO-USAR-DE-BASE.md` se explica cómo pasar a nombres por rol.
3. **Fotos remotas de Unsplash** (como el original) en lugar de locales, para obtener los mismos archivos. Cómo pasar a fotos propias: `COMO-USAR-DE-BASE.md`.
4. **Fuentes locales con la API de fuentes de Astro:** el proveedor de Google daba otra revisión de Outfit, ~2 % más ancha.
5. **`.reveal` solo oculta con JavaScript activo** (`:where(.js)`).
6. **La copia de referencia (`referencia/`, 21 MB) se commiteó** para que la comparación se pueda repetir. No se publica: Astro no la lee.
7. **Los subagentes hicieron commit a través mío:** el hook del repositorio exigía no dejar cambios sin confirmar, así que hay un commit "WIP" del subagente A antes de su versión final.

## Cómo seguir

- Leer [`ARQUITECTURA.md`](ARQUITECTURA.md) (mapa y orden de lectura) y [`TOKENS.md`](TOKENS.md).
- Para un diseño propio: [`COMO-USAR-DE-BASE.md`](COMO-USAR-DE-BASE.md).
- Los errores típicos y dónde se evitan: [`ERRORES-COMUNES.md`](ERRORES-COMUNES.md).
- Cómo se leyó el compilado: [`COMPILADO-VS-FUENTE.md`](COMPILADO-VS-FUENTE.md).
