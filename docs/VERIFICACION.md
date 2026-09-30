# Verificación visual

Todas las comparaciones usan la misma herramienta ([`scripts/verificacion/capturas.mjs`](../scripts/verificacion/capturas.mjs)):

- **Capturas de página completa** con Playwright (Chromium 1194), `deviceScaleFactor: 1`, en **1440 px** (escritorio, alto de ventana 900) y **390 px** (celular, alto 844), con `colorScheme` **dark** y **light**.
- Antes de capturar se recorre la página con scroll (dispara `.reveal` y `loading="lazy"`), se espera la decodificación de cada imagen, se vuelve arriba y se congelan las animaciones (`animations: 'disabled'`). Si algún `.reveal` no se dispara, se fuerza y **se informa** (columna "Reveal forzados").
- Google Fonts y Unsplash se sirven desde `referencia/externos/` (el resultado no depende de la red).
- **Comparación de píxeles** con `pixelmatch` (umbral 0,1). "Diff" = % de píxeles distintos sobre el área común. También se compara el alto total de la página.
- Datos crudos: `docs/.datos/*.json`. Para ver dónde difiere una captura: `node scripts/verificacion/zonas.mjs <archivo-diff.png>`.

> **Sobre "claro" y "oscuro":** el sitio original no tiene modo claro (ver `DECISIONES.md` §4). Se captura con las dos preferencias del sistema para comprobar que la reconstrucción tampoco cambia con ellas. El tema claro de demostración solo se activa a mano y no tiene contra qué compararse.

## Paso 0: la copia local es idéntica a la original

El Chromium del entorno no acepta el certificado del proxy de salida, así que no se pudo capturar el sitio en vivo. Se verificó por contenido: cada uno de los **245 archivos** de `referencia/sitio` se volvió a descargar con `curl` y se comparó su SHA-1. **245/245 idénticos.**

## Ruido: el original contra sí mismo

Dos capturas independientes del original, en las 18 rutas × 2 anchos × 2 esquemas.

**72 comparaciones** · 72 con 0 % · peor: 0 % (`/`, 1440 px, dark) · 0 con altura distinta.

El ruido "normal" es **0 %**: el sitio no tiene carruseles ni animaciones infinitas, y la herramienta espera a que todo termine. En la primera versión de la herramienta aparecieron diferencias de hasta 10 %: fotos lazy que no habían terminado de decodificar y un `.reveal` que no llegó a dispararse. Se corrigió la herramienta (no el sitio) antes de seguir.

**Consecuencia:** cualquier diferencia mayor que 0 % en las comparaciones de abajo es una diferencia real y se investigó.

## Fase 2: CSS nuevo dentro del HTML original

Se compiló `src/styles/` con la CLI de Tailwind 4.3.3, usando como fuente de clases el HTML **original** ([`scripts/verificacion/fase2.css`](../scripts/verificacion/fase2.css)). Ese CSS se puso en lugar de `/_astro/BaseLayout.*.css` en una copia del sitio. Así se aísla el sistema de diseño (tokens, fuentes, base, CSS de componentes y orden de la cascada) del resto de la reconstrucción.

| Ruta | Ancho | Esquema | Alto A | Alto B | Diff | Ruido | Reveal forzados |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 1440 | dark | 8651 | 8651 | 0 % | 0 % | — |
| `/portfolio/` | 1440 | dark | 4086 | 4086 | 0 % | 0 % | — |
| `/portfolio/aisha-noah-brooklyn/` | 1440 | dark | 3476 | 3476 | 0 % | 0 % | — |
| `/portfolio/claire-theo-napa/` | 1440 | dark | 3691 | 3691 | 0 % | 0 % | — |
| `/portfolio/hana-miles-big-sur/` | 1440 | dark | 2865 | 2865 | 0 % | 0 % | — |
| `/portfolio/maya-jordan-sonoma/` | 1440 | dark | 3763 | 3763 | 0 % | 0 % | — |
| `/portfolio/priya-daniel-santa-barbara/` | 1440 | dark | 3659 | 3659 | 0 % | 0 % | — |
| `/portfolio/sofia-luca-amalfi/` | 1440 | dark | 3691 | 3691 | 0 % | 0 % | — |
| `/about/` | 1440 | dark | 2674 | 2674 | 0 % | 0 % | — |
| `/services/` | 1440 | dark | 4366 | 4366 | 0 % | 0 % | — |
| `/contact/` | 1440 | dark | 1364 | 1364 | 0 % | 0 % | — |
| `/blog/` | 1440 | dark | 2312 | 2312 | 0 % | 0 % | — |
| `/blog/destination-wedding-coverage/` | 1440 | dark | 2808 | 2808 | 0 % | 0 % | — |
| `/blog/prints-still-matter/` | 1440 | dark | 2756 | 2756 | 0 % | 0 % | — |
| `/blog/wedding-timeline-that-breathes/` | 1440 | dark | 2808 | 2808 | 0 % | 0 % | — |
| `/blog/what-to-wear-engagement/` | 1440 | dark | 2782 | 2782 | 0 % | 0 % | — |
| `/blog/why-second-photographers-matter/` | 1440 | dark | 2756 | 2756 | 0 % | 0 % | — |
| `/404` | 1440 | dark | 1186 | 1186 | 0 % | 0 % | — |
| `/` | 390 | dark | 12230 | 12230 | 0 % | 0 % | — |
| `/portfolio/` | 390 | dark | 5207 | 5207 | 0 % | 0 % | — |
| `/portfolio/aisha-noah-brooklyn/` | 390 | dark | 4064 | 4064 | 0 % | 0 % | — |
| `/portfolio/claire-theo-napa/` | 390 | dark | 4064 | 4064 | 0 % | 0 % | — |
| `/portfolio/hana-miles-big-sur/` | 390 | dark | 3523 | 3523 | 0 % | 0 % | — |
| `/portfolio/maya-jordan-sonoma/` | 390 | dark | 4701 | 4701 | 0 % | 0 % | — |
| `/portfolio/priya-daniel-santa-barbara/` | 390 | dark | 4061 | 4061 | 0 % | 0 % | — |
| `/portfolio/sofia-luca-amalfi/` | 390 | dark | 4064 | 4064 | 0 % | 0 % | — |
| `/about/` | 390 | dark | 3228 | 3228 | 0 % | 0 % | — |
| `/services/` | 390 | dark | 6230 | 6230 | 0 % | 0 % | — |
| `/contact/` | 390 | dark | 2495 | 2495 | 0 % | 0 % | — |
| `/blog/` | 390 | dark | 3828 | 3828 | 0 % | 0 % | — |
| `/blog/destination-wedding-coverage/` | 390 | dark | 2901 | 2901 | 0 % | 0 % | — |
| `/blog/prints-still-matter/` | 390 | dark | 2823 | 2823 | 0 % | 0 % | — |
| `/blog/wedding-timeline-that-breathes/` | 390 | dark | 2937 | 2937 | 0 % | 0 % | — |
| `/blog/what-to-wear-engagement/` | 390 | dark | 2921 | 2921 | 0 % | 0 % | — |
| `/blog/why-second-photographers-matter/` | 390 | dark | 2823 | 2823 | 0 % | 0 % | — |
| `/404` | 390 | dark | 1505 | 1505 | 0 % | 0 % | — |
| `/` | 1440 | light | 8651 | 8651 | 0 % | 0 % | — |
| `/portfolio/` | 1440 | light | 4086 | 4086 | 0 % | 0 % | — |
| `/portfolio/aisha-noah-brooklyn/` | 1440 | light | 3476 | 3476 | 0 % | 0 % | — |
| `/portfolio/claire-theo-napa/` | 1440 | light | 3691 | 3691 | 0 % | 0 % | — |
| `/portfolio/hana-miles-big-sur/` | 1440 | light | 2865 | 2865 | 0 % | 0 % | — |
| `/portfolio/maya-jordan-sonoma/` | 1440 | light | 3763 | 3763 | 0 % | 0 % | — |
| `/portfolio/priya-daniel-santa-barbara/` | 1440 | light | 3659 | 3659 | 0 % | 0 % | — |
| `/portfolio/sofia-luca-amalfi/` | 1440 | light | 3691 | 3691 | 0 % | 0 % | — |
| `/about/` | 1440 | light | 2674 | 2674 | 0 % | 0 % | — |
| `/services/` | 1440 | light | 4366 | 4366 | 0 % | 0 % | — |
| `/contact/` | 1440 | light | 1364 | 1364 | 0 % | 0 % | — |
| `/blog/` | 1440 | light | 2312 | 2312 | 0 % | 0 % | — |
| `/blog/destination-wedding-coverage/` | 1440 | light | 2808 | 2808 | 0 % | 0 % | — |
| `/blog/prints-still-matter/` | 1440 | light | 2756 | 2756 | 0 % | 0 % | — |
| `/blog/wedding-timeline-that-breathes/` | 1440 | light | 2808 | 2808 | 0 % | 0 % | — |
| `/blog/what-to-wear-engagement/` | 1440 | light | 2782 | 2782 | 0 % | 0 % | — |
| `/blog/why-second-photographers-matter/` | 1440 | light | 2756 | 2756 | 0 % | 0 % | — |
| `/404` | 1440 | light | 1186 | 1186 | 0 % | 0 % | — |
| `/` | 390 | light | 12230 | 12230 | 0 % | 0 % | — |
| `/portfolio/` | 390 | light | 5207 | 5207 | 0 % | 0 % | — |
| `/portfolio/aisha-noah-brooklyn/` | 390 | light | 4064 | 4064 | 0 % | 0 % | — |
| `/portfolio/claire-theo-napa/` | 390 | light | 4064 | 4064 | 0 % | 0 % | — |
| `/portfolio/hana-miles-big-sur/` | 390 | light | 3523 | 3523 | 0 % | 0 % | — |
| `/portfolio/maya-jordan-sonoma/` | 390 | light | 4701 | 4701 | 0 % | 0 % | — |
| `/portfolio/priya-daniel-santa-barbara/` | 390 | light | 4061 | 4061 | 0 % | 0 % | — |
| `/portfolio/sofia-luca-amalfi/` | 390 | light | 4064 | 4064 | 0 % | 0 % | — |
| `/about/` | 390 | light | 3228 | 3228 | 0 % | 0 % | — |
| `/services/` | 390 | light | 6230 | 6230 | 0 % | 0 % | — |
| `/contact/` | 390 | light | 2495 | 2495 | 0 % | 0 % | — |
| `/blog/` | 390 | light | 3828 | 3828 | 0 % | 0 % | — |
| `/blog/destination-wedding-coverage/` | 390 | light | 2901 | 2901 | 0 % | 0 % | — |
| `/blog/prints-still-matter/` | 390 | light | 2823 | 2823 | 0 % | 0 % | — |
| `/blog/wedding-timeline-that-breathes/` | 390 | light | 2937 | 2937 | 0 % | 0 % | — |
| `/blog/what-to-wear-engagement/` | 390 | light | 2921 | 2921 | 0 % | 0 % | — |
| `/blog/why-second-photographers-matter/` | 390 | light | 2823 | 2823 | 0 % | 0 % | — |
| `/404` | 390 | light | 1505 | 1505 | 0 % | 0 % | — |

**72 comparaciones** · 72 con 0 % · peor: 0 % (`/`, 1440 px, dark) · 0 con altura distinta.

**Resultado: idéntico.** Además del resultado visual, se compararon los dos CSS como texto (formateados con prettier). Las únicas diferencias son:

- los colores ahora son `var(--…)` en lugar de hex (y por eso cambia el color de respaldo para navegadores sin `color-mix`, ver `DECISIONES.md` §11);
- los valores del CSS del autor ahora salen de tokens (`calc(var(--delay-step) * 2)` en lugar de `.2s`);
- `.reveal` pasó a `:where(.js) .reveal`;
- el original incluía 4 utilidades que no se usan en ningún HTML (`.static`, `.px-2`, `.py-2`, `.text-ink/70`, generadas por código fuente que no llegó a publicarse);
- diferencias de formato del minificador (`width>=40rem` vs `min-width: 40rem`, prefijos `-webkit-`).

En la primera pasada, el diff de texto también detectó un problema de cascada que las capturas no habrían mostrado: `.js .reveal` pisaba el `transition-delay` de `.reveal-delay-N`. Se corrigió con `:where()` antes de verificar.
