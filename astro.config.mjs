// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/data/site.ts';

/**
 * Rango Unicode del subset "latin" de Google Fonts (copiado de su CSS). Todo el
 * texto del sitio cae dentro de este rango, así que no se incluye latin-ext:
 * si el contenido usara letras como ł o ő, habría que sumar ese archivo.
 */
/** @type {[string, ...string[]]} */
const LATIN = [
  'U+0000-00FF',
  'U+0131',
  'U+0152-0153',
  'U+02BB-02BC',
  'U+02C6',
  'U+02DA',
  'U+02DC',
  'U+0304',
  'U+0308',
  'U+0329',
  'U+2000-206F',
  'U+20AC',
  'U+2122',
  'U+2191',
  'U+2193',
  'U+2212',
  'U+2215',
  'U+FEFF',
  'U+FFFD',
];

/**
 * Configuración de Astro (el equivalente a next.config.js).
 *
 * - `site`: URL canónica. Astro la usa para `Astro.site`, el sitemap y las
 *   URLs absolutas de SEO (canonical, og:url).
 * - Tailwind 4 entra como plugin de Vite (no hay tailwind.config.js: la
 *   configuración vive en CSS, dentro de @theme; ver src/styles/tokens.css).
 */
export default defineConfig({
  site: SITE.url,

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  /*
   * Las fotos son URLs remotas de Unsplash, igual que en el sitio original.
   * astro:assets las descarga en el build y genera los .webp en /_astro
   * (no hay optimización en runtime como en next/image). Hay que autorizar
   * el dominio para que Astro acepte procesarlas.
   */
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },

  /*
   * API de fuentes de Astro con el proveedor LOCAL: los .woff2 viven en
   * src/assets/fonts (son exactamente los archivos que Google Fonts le servía
   * al sitio original, subset latin). Astro los copia a /_astro,
   * escribe los @font-face, precarga los que pide <Font preload> y genera una
   * fuente de respaldo con métricas ajustadas para que el cambio de fuente no
   * mueva el layout (ver docs/ERRORES-COMUNES.md).
   *
   * Por qué local y no `fontProviders.google()`: el proveedor de Google
   * descarga otra revisión de Outfit con métricas apenas distintas (el texto
   * quedaba ~2 % más ancho que en el original). Con archivos propios el
   * resultado es idéntico, el build no depende de la red y no se contacta a
   * Google en cada visita. Ambas son fuentes variables: un archivo cubre todos
   * los pesos.
   */
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Outfit',
      cssVariable: '--font-outfit',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/outfit-latin.woff2'], weight: '300 700', style: 'normal', unicodeRange: LATIN },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-cormorant',
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/cormorant-garamond-latin.woff2'], weight: '400 700', style: 'normal', unicodeRange: LATIN },
          { src: ['./src/assets/fonts/cormorant-garamond-italic-latin.woff2'], weight: '400 500', style: 'italic', unicodeRange: LATIN },
        ],
      },
    },
  ],
});
