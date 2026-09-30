/**
 * /robots.txt generado en el build (un "route handler", como app/robots.ts en Next).
 * Se arma desde `site` de astro.config.mjs para que la URL del sitemap nunca
 * quede desactualizada si cambia el dominio.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
