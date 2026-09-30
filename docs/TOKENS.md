# Tokens de diseño

Todo vive en [`src/styles/tokens.css`](../src/styles/tokens.css) (y las familias tipográficas en [`src/styles/fonts.css`](../src/styles/fonts.css)). Hay **cuatro niveles**:

```
1. Primitivos   --palette-ink-950: #0f0e0c          ← el único lugar con hex
2. Semánticos   --background: var(--palette-ink-950) ← el rol; un tema cambia solo esto
3. Tailwind     --color-ink: var(--background)       ← genera bg-ink, text-ink, border-ink/10…
4. Componente   --duration-reveal: .55s              ← ritmo de las animaciones con CSS propio
```

> **Si venís de React/Next:** Tailwind 4 no tiene `tailwind.config.js`. La configuración del tema está en CSS, dentro de `@theme { … }`. Cada variable `--color-*`, `--text-*`, `--tracking-*`, `--shadow-*` o `--aspect-*` que declares ahí se convierte en una utilidad (`--tracking-eyebrow` → clase `tracking-eyebrow`). Tailwind solo escribe en el CSS final las variables que se usan.

## 1. Primitivos (paleta)

| Token | Valor | Qué es |
| --- | --- | --- |
| `--palette-ink-950` | `#0f0e0c` | Negro cálido, el fondo del sitio |
| `--palette-ink-900` | `#1a1814` | Negro un punto más claro (bandas, footer) |
| `--palette-ink-800` | `#2a2620` | Marrón oscuro (placeholder de fotos) |
| `--palette-champagne-300` | `#d4b896` | Dorado claro |
| `--palette-champagne-400` | `#c4a574` | Dorado principal (acento) |
| `--palette-champagne-600` | `#a88b58` | Dorado profundo (acento sobre fondo claro) |
| `--palette-ivory-50` | `#f5f0e8` | Marfil (texto principal) |
| `--palette-ivory-100` | `#e8e0d4` | Marfil apagado |
| `--palette-stone-300` | `#b5b0a6` | Gris piedra claro |
| `--palette-stone-500` | `#8a857c` | Gris piedra |

**Regla:** ningún componente usa un primitivo directamente. Siempre pasa por un semántico.

## 2. Semánticos (roles)

El tema oscuro es el único del original, por eso es el default (`:root`). El tema claro es una demostración que se activa con `<html data-theme="light">` (ver `ThemeScript.astro`).

| Token | Oscuro (original) | Claro (demo) | Rol |
| --- | --- | --- | --- |
| `--background` | ink-950 | ivory-50 | Fondo de página |
| `--surface` | ink-900 | ivory-100 | Bandas y tarjetas (paquetes, footer) |
| `--surface-muted` | ink-800 | stone-300 | Fondo mientras carga una foto |
| `--foreground` | ivory-50 | ink-950 | Texto principal, títulos |
| `--foreground-soft` | ivory-100 | ink-800 | Cuerpo de artículos, texto del CTA |
| `--text-secondary` | stone-300 | ink-800 | Bajadas, párrafos secundarios |
| `--text-tertiary` | stone-500 | stone-500 | Fechas, metadatos, etiquetas |
| `--accent` | champagne-400 | champagne-600 | Eyebrows, viñetas, botón primario, anillo de foco |
| `--accent-emphasis` | champagne-300 | champagne-600 | Links, precios, hover |
| `--accent-inverse` | champagne-600 | champagne-300 | Acento sobre la sección invertida (testimonios) |

`color-scheme` también cambia por tema: así los controles nativos (scrollbar, autocompletado de inputs) usan la variante correcta.

## 3. Puente a Tailwind (`@theme`)

### Colores

Se mantuvieron los nombres del original para no cambiar el marcado. **Leelos como roles:**

| Utilidad | Apunta a | Dónde se usa |
| --- | --- | --- |
| `ink` | `--background` | `bg-ink` (body, overlay del menú, tarjeta destacada), `from-ink`/`via-ink/50` (degradés sobre fotos), `text-ink` (texto sobre botón y sección clara) |
| `ink-soft` | `--surface` | Banda de paquetes, footer |
| `ink-muted` | `--surface-muted` | Contenedor de cada foto (`bg-ink-muted`) |
| `ivory` | `--foreground` | Casi todo el texto; bordes sutiles como `border-ivory/10`; fondo de testimonios (`bg-ivory`) |
| `ivory-muted` | `--foreground-soft` | Texto del CTA, cuerpo de `.prose-wedding` |
| `stone-light` | `--text-secondary` | Bajadas de secciones y tarjetas |
| `stone` | `--text-tertiary` | Fechas, labels, copyright |
| `champagne` | `--accent` | Eyebrows, botón primario, viñetas, subrayado del menú activo |
| `champagne-light` | `--accent-emphasis` | Links, precios, hover de botones |
| `champagne-deep` | `--accent-inverse` | Eyebrow de testimonios |

**Opacidades:** `border-ivory/10` = marfil al 10 %. Tailwind lo compila a `color-mix(in oklab, var(--color-ivory) 10%, transparent)`, así que también sigue al tema. Los bordes del sitio usan tres niveles: `/10` (divisores), `/20` (inputs) y `/25` (botón ghost).

### Tokens nuevos (antes eran valores escritos a mano)

| Token | Valor | Utilidad | Reemplaza | Dónde se usa |
| --- | --- | --- | --- | --- |
| `--ease-premium` | `cubic-bezier(.4,0,.2,1)` | `ease-premium` | `ease-[var(--ease-premium)]` (185×) | Botones, fotos, header, `.reveal`, hero |
| `--shadow-glow` | `0 8px 30px -8px` acento al 45 % | `hover:shadow-glow` | `hover:shadow-[0_8px_30px_-8px_rgba(196,165,116,0.45)]` (64×) | Botón primario (`Button.astro`) |
| `--text-2xs` | `0.65rem` | `text-2xs` | `text-[0.65rem]` | Subtítulo del logo |
| `--tracking-meta` | `0.16em` | `tracking-meta` | `tracking-[0.16em]` | Fechas, etiquetas de artículo, datos de contacto |
| `--tracking-label` | `0.18em` | `tracking-label` | `tracking-[0.18em]` | Labels del formulario, ubicación en tarjetas, estadísticas |
| `--tracking-caps` | `0.2em` | `tracking-caps` | `tracking-[0.2em]` | Títulos de columna del footer, "Most booked", ubicación en portadas |
| `--tracking-eyebrow` | `0.22em` | `tracking-eyebrow` | `tracking-[0.22em]` | Eyebrow de cada sección |
| `--tracking-brand` | `0.28em` | `tracking-brand` | `tracking-[0.28em]` | "Wedding Photography" del logo |
| `--aspect-portrait` | `4 / 5` | `aspect-portrait` | `aspect-[4/5]` | Tarjetas de boda, retrato de Elena |
| `--aspect-card` | `16 / 10` | `aspect-card` | `aspect-[16/10]` | Tarjetas del journal |
| `--aspect-cinema` | `21 / 9` | `aspect-cinema` | `aspect-[21/9]` | Portada de artículo (celular) |
| `--aspect-banner` | `2 / 1` | `aspect-banner` | `aspect-[2/1]` | Portada de artículo (≥ 640 px) |
| `--aspect-feature` | `16 / 11` | `aspect-feature` | `aspect-[16/11]` | Retrato de About en tablet |
| `--aspect-landscape` | `4 / 3` | `aspect-landscape` | `aspect-[4/3]` | Tarjeta grande de la home (< 1024 px) |

Otros valores a mano se resolvieron con la **escala nativa** de Tailwind 4, sin tokens nuevos: `active:scale-[0.98]` → `active:scale-98`, `scale-[1.03]` → `scale-103`, `focus:z-[100]` → `focus:z-100`, `min-h-[100svh]` → `min-h-svh`, `min-h-[36rem]` → `min-h-144`, `max-h-[28rem]` → `max-h-112`.

### Alturas de layout

| Token | Valor | Uso |
| --- | --- | --- |
| `--height-page-hero` | `70svh` | Portada de cada boda: `min-h-(--height-page-hero)` |
| `--height-page-center` | `80svh` | Página 404 |

No están en `@theme` porque no forman una escala: son decisiones de un componente puntual, pero se nombran para no repetir el número.

### Tipografía (`fonts.css`)

| Token | Valor | Utilidad |
| --- | --- | --- |
| `--font-sans` | `var(--font-outfit, 'Outfit', …)` | `font-sans` (default del `body`) |
| `--font-display` | `var(--font-cormorant, 'Cormorant Garamond', …)` | `font-display` (títulos, logo, citas) |

`--font-outfit` y `--font-cormorant` los genera la API de fuentes de Astro (`astro.config.mjs` → `fonts`) con el nombre real de la familia y su fuente de respaldo ajustada.

### Escalas heredadas de Tailwind (no se modificaron)

El diseño original usa las escalas por defecto de Tailwind 4:

- **Espaciado:** `--spacing: 0.25rem` → `p-4` = 1rem, `py-20` = 5rem, `pt-32` = 8rem.
- **Texto:** `text-xs` .75rem · `sm` .875rem · `base` 1rem · `lg` 1.125rem · `xl` 1.25rem · `2xl` 1.5rem · `3xl` 1.875rem · `4xl` 2.25rem · `5xl` 3rem · `6xl` 3.75rem · `7xl` 4.5rem (cada uno con su interlineado).
- **Interlineado:** `leading-tight` 1.25 · `snug` 1.375 · `relaxed` 1.625.
- **Anchos:** `max-w-sm` 24rem · `md` 28rem · `lg` 32rem · `xl` 36rem · `2xl` 42rem · `3xl` 48rem · `7xl` 80rem.
- **Breakpoints:** `sm` 40rem (640 px) · `md` 48rem (768 px) · `lg` 64rem (1024 px).
- **Duraciones** usadas como utilidades: `duration-300` (colores, botones), `duration-500` (header), `duration-700` (zoom de fotos).
- **Radios:** `rounded-sm` (imágenes dentro de artículos) y `rounded-full` (viñetas). El diseño es de esquinas rectas.

Para cambiar una escala, se redefine en `@theme` (por ejemplo `--breakpoint-lg: 70rem;`).

## 4. Tokens de componente (movimiento)

| Token | Valor | Usado en |
| --- | --- | --- |
| `--duration-reveal` | `0.55s` | `.reveal` (`components/reveal.css`) |
| `--distance-reveal` | `1.25rem` | recorrido vertical de `.reveal` |
| `--delay-step` | `0.1s` | `.reveal-delay-1…4` (0,1 / 0,2 / 0,3 / 0,4 s) |
| `--duration-hero` | `0.9s` | `.hero-enter` (`components/hero.css`) |
| `--distance-hero` | `1.5rem` | recorrido del hero |
| `--delay-step-hero` | `0.15s` | `.hero-enter-delay-1…3` |

## Cómo cambiar…

- **El color de acento:** cambiá `--palette-champagne-*` (o apuntá `--accent` a otro primitivo). Botones, links, eyebrows, foco y el resplandor del botón cambian juntos. El resplandor usa `color-mix(… var(--accent) 45% …)`, así que lo sigue solo.
- **Una paleta entera nueva:** reemplazá los primitivos y reasigná los semánticos. No hace falta tocar componentes.
- **Agregar un tema:** copiá el bloque `:root[data-theme='light']` y redefiní solo los semánticos.
- **La tipografía:** poné los `.woff2` en `src/assets/fonts`, cambiá `fonts` en `astro.config.mjs` y los respaldos de `fonts.css`.
- **El ritmo de las animaciones:** los tokens de la sección 4 y `--ease-premium`.
- **El espaciado de las mayúsculas:** los `--tracking-*`.
