/**
 * Convierte uno o más resultados.json (de capturas.mjs) en una tabla Markdown
 * para docs/VERIFICACION.md.
 *
 * Uso: node scripts/verificacion/informe.mjs <resultados.json> [<resultados-ruido.json>]
 * Si se pasa el segundo archivo, agrega la columna de ruido (original vs. original).
 */
import fs from 'node:fs';

const [archivo, archivoRuido] = process.argv.slice(2);
const filas = JSON.parse(fs.readFileSync(archivo, 'utf8'));
const ruido = archivoRuido ? JSON.parse(fs.readFileSync(archivoRuido, 'utf8')) : [];
const clave = (r) => `${r.esquema}|${r.ancho}|${r.ruta}`;
const ruidoPor = new Map(ruido.map((r) => [clave(r), r]));

const cab = ['Ruta', 'Ancho', 'Esquema', 'Alto A', 'Alto B', 'Diff', ...(archivoRuido ? ['Ruido'] : []), 'Reveal forzados'];
console.log(`| ${cab.join(' | ')} |`);
console.log(`| ${cab.map(() => '---').join(' | ')} |`);
for (const r of filas) {
  const alto = r.altoA === r.altoB ? `${r.altoB}` : `**${r.altoB}**`;
  const extra = archivoRuido ? [`${ruidoPor.get(clave(r))?.porcentaje ?? '—'} %`] : [];
  const forzados = (r.forzadosA ?? 0) + (r.forzadosB ?? 0);
  console.log(`| \`${r.ruta}\` | ${r.ancho} | ${r.esquema} | ${r.altoA} | ${alto} | ${r.porcentaje} % | ${extra.join(' | ')}${archivoRuido ? ' | ' : ''}${forzados || '—'} |`);
}
const peor = filas.reduce((m, r) => (r.porcentaje > m.porcentaje ? r : m), filas[0]);
const alturas = filas.filter((r) => r.altoA !== r.altoB).length;
const ceros = filas.filter((r) => r.porcentaje === 0).length;
console.log(`\n**${filas.length} comparaciones** · ${ceros} con 0 % · peor: ${peor.porcentaje} % (\`${peor.ruta}\`, ${peor.ancho} px, ${peor.esquema}) · ${alturas} con altura distinta.`);
