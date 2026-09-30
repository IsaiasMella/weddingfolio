/**
 * Textos de presentación de Elena que se repiten en la home ("Meet Elena") y
 * en /about. Viven en un solo lugar para que no se desincronicen.
 */
export const ABOUT = {
  title: 'Photographs that feel like memory, not performance.',
  intro:
    'I am Elena Moreau — a wedding photographer drawn to soft light, honest emotion, and the quiet in-between moments most people miss.',
  approach:
    'For over a decade I have documented celebrations across California and beyond. My approach is unobtrusive: I guide when it helps, then step back so the day can breathe.',
  /**
   * Retrato de Elena. El original usaba dos descargas distintas de la misma
   * foto de Unsplash: w=1200 en la home (y como imagen social de /about) y
   * w=1400 en el retrato grande de /about (probado contra las capturas: con
   * 1200 o 1600 los píxeles difieren). Se conservan ambas para que el
   * resultado sea idéntico; en un sitio propio alcanzaría con una sola.
   */
  portrait: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1200&q=80',
  portraitLarge: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1400&q=80',
} as const;
