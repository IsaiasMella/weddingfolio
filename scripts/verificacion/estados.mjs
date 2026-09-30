/**
 * Verifica estados interactivos que las capturas de página completa no cubren:
 *   1. Menú móvil abierto (390 px): captura de la ventana, A vs B.
 *   2. Header después de hacer scroll (1440 px): fondo translúcido + blur.
 *   3. Foco con teclado: el primer Tab muestra "Skip to content".
 *   4. Sin JavaScript (solo B): el contenido .reveal tiene que verse.
 *   5. Tema claro de demostración (solo B): se guarda una captura para mirar.
 *
 * Uso: node scripts/verificacion/estados.mjs --a referencia/sitio --b dist --salida .capturas/estados
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { servir } from './servidor.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []),
);
const salida = path.resolve(args.salida ?? '.capturas/estados');
fs.mkdirSync(salida, { recursive: true });
const EXT = path.resolve('referencia/externos');

const sa = await servir(path.resolve(args.a ?? 'referencia/sitio'), 4951);
const sb = await servir(path.resolve(args.b ?? 'dist'), 4952);
const A = 'http://localhost:4951';
const B = 'http://localhost:4952';
const browser = await chromium.launch();

async function contexto(opciones = {}) {
  const ctx = await browser.newContext({ deviceScaleFactor: 1, ...opciones });
  await ctx.route(/fonts\.googleapis\.com\/css2/, (r) => r.fulfill({ path: path.join(EXT, 'fonts/google-fonts.css'), contentType: 'text/css' }));
  await ctx.route(/fonts\.gstatic\.com\//, (r) => r.fulfill({ path: path.join(EXT, 'fonts', new URL(r.request().url()).pathname.slice(1).replace(/\//g, '_')), contentType: 'font/woff2' }));
  return ctx;
}

function diff(a, b) {
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  const n = pixelmatch(pa.data, pb.data, null, pa.width, pa.height, { threshold: 0.1 });
  return ((n / (pa.width * pa.height)) * 100).toFixed(4);
}

async function estado(nombre, opciones, accion) {
  const capturas = [];
  for (const base of [A, B]) {
    const ctx = await contexto(opciones);
    const page = await ctx.newPage();
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await accion(page);
    await page.waitForTimeout(800);
    capturas.push(await page.screenshot({ animations: 'disabled' }));
    await ctx.close();
  }
  fs.writeFileSync(path.join(salida, `${nombre}-A.png`), capturas[0]);
  fs.writeFileSync(path.join(salida, `${nombre}-B.png`), capturas[1]);
  console.log(`${nombre.padEnd(20)} diff ${diff(capturas[0], capturas[1])}%`);
}

await estado('menu-movil', { viewport: { width: 390, height: 844 } }, (p) => p.click('[data-menu-toggle]'));
await estado('header-scroll', { viewport: { width: 1440, height: 900 } }, async (p) => {
  await p.evaluate(() => window.scrollTo(0, 1200));
});
await estado('foco-skip-link', { viewport: { width: 1440, height: 900 } }, (p) => p.keyboard.press('Tab'));

// Menú: Escape cierra y devuelve el foco al botón (solo B).
{
  const ctx = await contexto({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(B + '/');
  await page.click('[data-menu-toggle]');
  const abierto = await page.getAttribute('[data-menu-toggle]', 'aria-expanded');
  await page.keyboard.press('Escape');
  const cerrado = await page.getAttribute('[data-menu-toggle]', 'aria-expanded');
  const foco = await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle'));
  console.log(`menú: abre=${abierto} · Escape cierra=${cerrado === 'false'} · foco vuelve al botón=${foco}`);
  await ctx.close();
}

// Sin JavaScript: ¿se ve el contenido .reveal?
for (const [nombre, base] of [['original', A], ['reconstruccion', B]]) {
  const ctx = await contexto({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'load' });
  const ocultos = await page.evaluate(
    () => [...document.querySelectorAll('.reveal')].filter((el) => getComputedStyle(el).opacity === '0').length,
  );
  const total = await page.evaluate(() => document.querySelectorAll('.reveal').length);
  console.log(`sin JS (${nombre}): ${ocultos} de ${total} elementos .reveal invisibles`);
  await ctx.close();
}

// Tema claro de demostración.
{
  const ctx = await contexto({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('theme', 'light'));
  const page = await ctx.newPage();
  await page.goto(B + '/', { waitUntil: 'load' });
  const tema = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible')));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(salida, 'tema-claro.png'), fullPage: true, animations: 'disabled' });
  console.log(`tema claro: data-theme=${tema} (captura en ${path.join(salida, 'tema-claro.png')})`);
  await ctx.close();
}

await browser.close();
sa.close();
sb.close();
