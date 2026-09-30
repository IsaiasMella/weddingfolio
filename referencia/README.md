# Referencia (NO se publica)

Copia local de la demo original <https://weddingfolio.pages.dev/> para comparar
contra la reconstrucción. No forma parte del sitio: Astro no la lee (está fuera
de `src/` y `public/`).

- `sitio/` — todas las páginas, el CSS, las imágenes, el favicon, sitemap, RSS
  y `llms*.txt`, exactamente como los sirve el original (verificado por SHA-1,
  245/245 archivos idénticos). El HTML no se modificó.
- `externos/` — lo que el original carga de otros dominios: el CSS y los
  `.woff2` de Google Fonts, y las fotos originales de Unsplash. Las capturas de
  verificación los sirven desde acá (ver `scripts/verificacion/capturas.mjs`).
- `externos.json` — lista de URLs externas encontradas por el crawler.

Para verla en el navegador:

```sh
node scripts/verificacion/servidor.mjs referencia/sitio 4400
# → http://localhost:4400 (las fuentes y fotos externas se piden a internet)
```
