/**
 * Captura y compara páginas de dos sitios (A = referencia, B = candidato).
 *
 * Uso:
 *   node scripts/verificacion/capturas.mjs --a <dirA> --b <dirB> --salida <dir>
 *        [--rutas /,/about/] [--anchos 1440,390] [--esquemas dark,light] [--puerto 4501]
 *
 * --a y --b son carpetas con un sitio compilado (se sirven en local) o URLs
 * http(s). Si --a y --b son la misma carpeta, mide el "ruido" (A contra A).
 *
 * Para que las capturas sean deterministas:
 *   - las fuentes de Google y las fotos de Unsplash se sirven desde
 *     referencia/externos (no dependemos de la red);
 *   - se recorre la página con scroll para disparar las animaciones .reveal
 *     y la carga diferida (loading="lazy") de las imágenes;
 *   - se vuelve arriba y se espera a que el header termine su transición;
 *   - Playwright congela las animaciones al capturar (animations: 'disabled').
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { servir } from './servidor.mjs';
import { RUTAS } from './rutas.mjs';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const EXTERNOS = path.join(RAIZ, 'referencia/externos');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []),
);
const rutas = args.rutas ? args.rutas.split(',') : RUTAS;
const anchos = (args.anchos ?? '1440,390').split(',').map(Number);
const esquemas = (args.esquemas ?? 'dark,light').split(',');
const salida = path.resolve(args.salida ?? path.join(RAIZ, '.capturas'));
fs.mkdirSync(salida, { recursive: true });

async function origen(valor, puerto) {
  if (/^https?:/.test(valor)) return { base: valor.replace(/\/$/, ''), cerrar: () => {} };
  const server = await servir(path.resolve(valor), puerto);
  return { base: `http://localhost:${puerto}`, cerrar: () => server.close() };
}

/** Sirve desde disco los recursos externos que el sitio pide a Google Fonts y Unsplash. */
async function rutearExternos(context) {
  await context.route(/fonts\.googleapis\.com\/css2/, (r) =>
    r.fulfill({ path: path.join(EXTERNOS, 'fonts/google-fonts.css'), contentType: 'text/css' }),
  );
  await context.route(/fonts\.gstatic\.com\//, (r) => {
    const nombre = new URL(r.request().url()).pathname.slice(1).replace(/\//g, '_');
    const archivo = path.join(EXTERNOS, 'fonts', nombre);
    return fs.existsSync(archivo) ? r.fulfill({ path: archivo, contentType: 'font/woff2' }) : r.abort();
  });
  await context.route(/images\.unsplash\.com\//, (r) => {
    const u = new URL(r.request().url());
    const archivo = path.join(EXTERNOS, 'unsplash', `${u.pathname.slice(1)}_${u.searchParams.get('w')}.jpg`);
    return fs.existsSync(archivo) ? r.fulfill({ path: archivo, contentType: 'image/jpeg' }) : r.abort();
  });
}

async function capturar(page, url, archivo) {
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // Scroll progresivo: dispara IntersectionObserver (.reveal) y loading="lazy".
  await page.evaluate(async () => {
    const paso = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += paso) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 200));
    // Si algún .reveal no llegó a dispararse (scroll muy rápido), lo centramos.
    for (let intento = 0; intento < 2; intento++) {
      for (const el of document.querySelectorAll('.reveal:not(.is-visible)')) {
        el.scrollIntoView({ block: 'center' });
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    // Último recurso: se fuerza y se informa (así un bug real del observer no queda oculto).
    const forzados = document.querySelectorAll('.reveal:not(.is-visible)');
    forzados.forEach((el) => el.classList.add('is-visible'));
    window.__revealForzados = forzados.length;
    // Imágenes: esperar la descarga Y la decodificación (si no, sale el placeholder).
    for (const img of document.images) {
      img.loading = 'eager';
      if (!img.complete) {
        await new Promise((r) => {
          img.addEventListener('load', r, { once: true });
          img.addEventListener('error', r, { once: true });
        });
      }
      await img.decode().catch(() => {});
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1300); // transición de .reveal (0.55s + 0.4s de delay) y del header (0.5s)
  await page.screenshot({ path: archivo, fullPage: true, animations: 'disabled', caret: 'hide' });
  return page.evaluate(() => window.__revealForzados ?? 0);
}

function comparar(fa, fb, fdiff) {
  const a = PNG.sync.read(fs.readFileSync(fa));
  const b = PNG.sync.read(fs.readFileSync(fb));
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const recortar = (img) => {
    if (img.width === w && img.height === h) return img;
    const out = new PNG({ width: w, height: h });
    PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
    return out;
  };
  const ra = recortar(a);
  const rb = recortar(b);
  const diff = new PNG({ width: w, height: h });
  const n = pixelmatch(ra.data, rb.data, diff.data, w, h, { threshold: 0.1 });
  const pct = (n / (w * h)) * 100;
  if (n > 0) fs.writeFileSync(fdiff, PNG.sync.write(diff));
  return { altoA: a.height, altoB: b.height, pixeles: n, porcentaje: Number(pct.toFixed(4)) };
}

const puerto = Number(args.puerto ?? 4501);
const A = await origen(args.a ?? path.join(RAIZ, 'referencia/sitio'), puerto);
const mismo = !args.b || args.b === args.a;
const B = mismo ? A : await origen(args.b, puerto + 1);
const browser = await chromium.launch();
const resultados = [];

for (const esquema of esquemas) {
  for (const ancho of anchos) {
    const context = await browser.newContext({
      viewport: { width: ancho, height: ancho > 800 ? 900 : 844 },
      deviceScaleFactor: 1,
      colorScheme: esquema,
      reducedMotion: 'no-preference',
    });
    await rutearExternos(context);
    const page = await context.newPage();
    for (const ruta of rutas) {
      const id = `${esquema}-${ancho}-${ruta.replace(/\//g, '_') || 'home'}`;
      const fa = path.join(salida, `${id}-A.png`);
      const fb = path.join(salida, `${id}-B.png`);
      const forzadosA = await capturar(page, A.base + ruta, fa);
      const forzadosB = await capturar(page, B.base + ruta, fb); // en modo ruido es una segunda captura del mismo sitio
      const r = comparar(fa, fb, path.join(salida, `${id}-diff.png`));
      resultados.push({ ruta, ancho, esquema, ...r, forzadosA, forzadosB });
      const aviso = forzadosA + forzadosB ? `  (reveal forzados A:${forzadosA} B:${forzadosB})` : '';
      console.log(`${esquema} ${ancho} ${ruta.padEnd(42)} alto ${r.altoA}/${r.altoB}  diff ${r.porcentaje}%${aviso}`);
    }
    await context.close();
  }
}
await browser.close();
A.cerrar();
if (!mismo) B.cerrar();
fs.writeFileSync(path.join(salida, 'resultados.json'), JSON.stringify(resultados, null, 2));
const peor = resultados.reduce((m, r) => Math.max(m, r.porcentaje), 0);
const alturas = resultados.filter((r) => r.altoA !== r.altoB).length;
console.log(`\n${resultados.length} capturas · peor diff ${peor}% · ${alturas} con altura distinta`);
