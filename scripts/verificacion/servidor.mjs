/**
 * Servidor estático mínimo para comparar sitios compilados.
 *
 * Imita a Cloudflare Pages en lo que importa para las capturas:
 *   - /ruta  → 308 a /ruta/ si existe /ruta/index.html
 *   - /ruta/ → sirve /ruta/index.html
 *   - si no existe → 404.html con estado 404
 *
 * Uso: node scripts/verificacion/servidor.mjs <carpeta> <puerto>
 * También se puede importar: `servir(carpeta, puerto)` devuelve el server.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};

export function servir(raiz, puerto) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    let p = decodeURIComponent(url.pathname);
    let archivo = path.join(raiz, p);
    if (!archivo.startsWith(path.resolve(raiz))) {
      res.writeHead(403).end();
      return;
    }
    if (!p.endsWith('/') && !path.extname(p) && fs.existsSync(path.join(archivo, 'index.html'))) {
      res.writeHead(308, { Location: p + '/' + url.search }).end();
      return;
    }
    if (p.endsWith('/')) archivo = path.join(archivo, 'index.html');
    let estado = 200;
    if (!fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
      archivo = path.join(raiz, '404.html');
      estado = 404;
    }
    res.writeHead(estado, { 'Content-Type': TIPOS[path.extname(archivo)] ?? 'application/octet-stream' });
    fs.createReadStream(archivo).pipe(res);
  });
  return new Promise((ok) => server.listen(puerto, () => ok(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [raiz = 'dist', puerto = '4400'] = process.argv.slice(2);
  await servir(path.resolve(raiz), Number(puerto));
  console.log(`Sirviendo ${raiz} en http://localhost:${puerto}`);
}
