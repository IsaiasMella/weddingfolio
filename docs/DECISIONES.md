# Decisiones tomadas sin supervisión

Cada decisión con su justificación. Ordenadas por fase.

## Paso 0 — Copia de referencia

1. **Crawler propio en Python en vez de `wget --mirror`.** Hacía falta seguir `srcset`, `url()` del CSS, `sitemap`, `rss.xml` y `llms.txt`, y guardar las rutas con barra final como `ruta/index.html` (igual que las sirve Cloudflare Pages). Resultado: 18 páginas, 1 CSS, 219 imágenes, favicon, sitemap, RSS y los dos `llms*.txt` en `referencia/sitio/`.
2. **Los recursos externos (Google Fonts y las fotos originales de Unsplash) se guardan aparte**, en `referencia/externos/`, y **el HTML no se modifica**. Durante las capturas, Playwright intercepta esas URLs y las sirve desde disco. Así la copia es byte a byte la original y las capturas no dependen de la red.
3. **La verificación "se ve igual que la original" se hizo por hash, no con capturas del sitio en vivo.** El Chromium de este entorno no confía en el certificado del proxy de salida, y desactivar la verificación TLS no es aceptable. En su lugar, se volvió a descargar cada uno de los 245 archivos con `curl` y se comparó su SHA-1 con la copia: 245/245 idénticos. Con los mismos bytes y los mismos recursos externos, el render es el mismo.

## Fase 1 — Análisis

4. **El sitio no tiene modo claro/oscuro.** Es oscuro fijo, sin selector de tema y sin `prefers-color-scheme` en el CSS. Se respeta: el tema oscuro es el default y se ve igual con cualquier preferencia del sistema. Para cumplir con la arquitectura pedida (tokens semánticos redefinidos por tema, script anti-flash en el `<head>`), existe un **tema claro de demostración** que solo se activa si se guarda `localStorage.theme = 'light'`. No se agregó un botón de tema porque cambiaría el diseño original.
5. **No hay carruseles ni visor de fotos.** Las galerías son columnas estáticas (`columns-2`). No se inventó un lightbox: el objetivo es replicar.
6. **Paginación real con 9 elementos por página** en `/blog/` y `/portfolio/`. Con el contenido actual (5 posts, 6 bodas) genera una sola página, idéntica al original; al sumar contenido aparecen `/blog/2/`, etc.

## Fase 2 — Sistema de diseño

7. **Tailwind 4.3.3 exacto** (la misma versión que el original, fijada sin `^`) para que el CSS generado coincida regla por regla.
8. **Se mantienen los nombres de color del original** (`ink`, `ivory`, `champagne`, `stone`) como utilidades, porque la consigna pide las mismas clases. Pero ahora apuntan a **tokens semánticos** (`--color-ivory: var(--foreground)`), así un tema solo redefine los semánticos. Contra: en el tema claro `text-ivory` es oscuro. Está explicado en `TOKENS.md`.
9. **Los valores escritos a mano se reemplazaron por tokens o por la escala nativa de Tailwind 4** (tabla en `PLAN.md` §3.2): `tracking-[0.22em]` → `tracking-eyebrow`, `ease-[var(--ease-premium)]` → `ease-premium`, `active:scale-[0.98]` → `active:scale-98`, sombra dorada → `shadow-glow`, etc. Cambian los nombres de clase, pero el valor computado es el mismo (verificado con capturas).
10. **`.reveal` solo oculta contenido si hay JavaScript** (`:where(.js) .reveal`). En el original, si el JS fallaba, casi todo el sitio quedaba invisible (`opacity: 0`). Se usa `:where()` para no subir la especificidad: si subiera, el `transition` de `.reveal` pisaría el `transition-delay` de `.reveal-delay-N`.
11. **Colores con opacidad sobre variables.** Como `--color-ink` ahora es `var(--background)`, Tailwind ya no puede precalcular el color de respaldo (`#0f0e0ce6`) para navegadores sin `color-mix()` (anteriores a 2023): en esos navegadores se ve el color sólido. En los navegadores actuales el resultado es idéntico. Se acepta a cambio de poder tener temas.
12. **Tokens de movimiento** (`--duration-reveal`, `--delay-step`, `--duration-hero`…) como tokens de componente, en `tokens.css` §4. Antes eran números sueltos en el CSS del autor.
13. **`@tailwindcss/cli` como dependencia de desarrollo**, solo para la verificación de la Fase 2: compila `src/styles` usando como fuente el HTML original y ese CSS se pone en lugar del original en una copia del sitio. El sitio en sí compila Tailwind con el plugin de Vite.

## Fase 3 — Componentes y páginas

14. **Fotos remotas de Unsplash procesadas por `astro:assets`**, como en el original: el contenido guarda la URL y Astro genera los `.webp` en el build. El marcado resultante (`srcset`, `sizes`, `width`/`height`) es idéntico. Diferencia conocida: Astro 7.3 no agranda la variante de 2000w por encima del original de 1600 px (Astro 7.1 sí lo hacía). No se nota a 1440 px ni a 390 px con DPR 1, donde el navegador elige las variantes de 1600w y 640w.
15. **Fuentes con la API de fuentes de Astro y proveedor local** (`src/assets/fonts`, que son los mismos `.woff2` que servía Google al original). Primero se probó `fontProviders.google()`, pero baja otra revisión de Outfit y el texto quedaba ~2 % más ancho (visible en las capturas). Con archivos locales: los mismos glifos, precarga de las 2 fuentes del primer pantallazo, fuente de respaldo con métricas ajustadas (menos salto al cargar), sin llamadas a Google y build sin red.
16. **Solo el subset latin.** Se comprobó que todo el texto del sitio cae en ese rango Unicode. Agregar latin-ext duplicaba las precargas sin beneficio.
17. **Astro 7.3.5 en vez de 7.1.3** (la consigna pide la última estable). `<meta name="generator">` dice 7.3.5.
18. **Se corrigió el doble punto de las meta descriptions** del original ("…Elena & Co.. Editorial…"). Solo afecta a SEO, no se ve.
19. **`Escape` devuelve el foco al botón del menú** al cerrar el menú móvil (mejora de accesibilidad; el original dejaba el foco perdido).
20. **Espacios en blanco en Astro:** el compilador borra el espacio cuando hay un salto de línea entre un texto o expresión y una etiqueta (`© 2026Elena`). Donde el espacio importa, texto y etiqueta van en la misma línea. Se detectó con la comparación de píxeles de la 404.
21. **La 404 la hice yo** (no el subagente de páginas fijas), porque era la página más simple para verificar la base compartida (layout, header, footer, botones, fuentes): dio 0 % de diferencia.
22. **Los YAML de datos** (`packages`, `testimonials`, `faq`, `process`) los escribí yo antes de lanzar los subagentes, para que el build de la base funcionara con el esquema completo.
