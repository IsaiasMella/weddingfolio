/**
 * Lista las franjas horizontales donde un *-diff.png tiene píxeles distintos
 * (útil para saber QUÉ parte de la página difiere).
 * Uso: node scripts/verificacion/zonas.mjs <archivo-diff.png>
 */
import fs from 'node:fs';
import { PNG } from 'pngjs';

const png = PNG.sync.read(fs.readFileSync(process.argv[2]));
const filas = [];
for (let y = 0; y < png.height; y++) {
  let n = 0;
  let x0 = Infinity;
  let x1 = -1;
  for (let x = 0; x < png.width; x++) {
    const i = (y * png.width + x) * 4;
    if (png.data[i] === 255 && png.data[i + 1] === 0 && png.data[i + 2] === 0) {
      n++;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
    }
  }
  filas.push({ n, x0, x1 });
}
let inicio = -1;
for (let y = 0; y <= filas.length; y++) {
  const activa = y < filas.length && filas[y].n > 0;
  if (activa && inicio < 0) inicio = y;
  if (!activa && inicio >= 0) {
    const tramo = filas.slice(inicio, y);
    const x0 = Math.min(...tramo.map((f) => f.x0));
    const x1 = Math.max(...tramo.map((f) => f.x1));
    const total = tramo.reduce((s, f) => s + f.n, 0);
    console.log(`y ${inicio}–${y - 1}  x ${x0}–${x1}  (${total} px)`);
    inicio = -1;
  }
}
