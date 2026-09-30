# Weddingfolio — reconstrucción del código fuente

Reconstrucción legible, tokenizada y por componentes de la demo
<https://weddingfolio.pages.dev/> (sitio de fotografía de bodas "Elena & Co."),
**solo para estudio**. Visualmente idéntica al original (ver `docs/VERIFICACION.md`).

**Stack:** Astro 7 · TypeScript estricto · Tailwind CSS 4 (`@theme`) · Content Collections con zod.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # sitio estático en dist/
npm run check    # tipos y plantillas
```

## Documentación (en `docs/`)

| Archivo | Para qué |
| --- | --- |
| [ARQUITECTURA.md](docs/ARQUITECTURA.md) | Mapa de carpetas, equivalencias con React/Next, cómo fluye el contenido y orden de lectura. **Empezá acá.** |
| [TOKENS.md](docs/TOKENS.md) | Cada token de diseño: qué es, dónde se usa y cómo cambiarlo |
| [COMO-USAR-DE-BASE.md](docs/COMO-USAR-DE-BASE.md) | Qué cambiar para un diseño propio y qué dejar igual |
| [ERRORES-COMUNES.md](docs/ERRORES-COMUNES.md) | Flash del tema y de fuentes, saltos de diseño, JS de más… y dónde se evitan |
| [COMPILADO-VS-FUENTE.md](docs/COMPILADO-VS-FUENTE.md) | Tres ejemplos del sitio minificado frente al código reconstruido |
| [PLAN.md](docs/PLAN.md) | Análisis del original e inventario |
| [DECISIONES.md](docs/DECISIONES.md) | Cada decisión tomada y por qué |
| [VERIFICACION.md](docs/VERIFICACION.md) | Comparación de píxeles contra el original |
| [INFORME.md](docs/INFORME.md) | Resumen final: qué es idéntico, qué no y por qué |

`referencia/` es una copia del sitio original para comparar; no se publica.
