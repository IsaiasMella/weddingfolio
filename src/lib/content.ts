/**
 * Consultas y utilidades de contenido compartidas por todas las páginas.
 *
 * Centralizar el orden y los filtros acá evita que cada página decida por su
 * cuenta (por ejemplo, que la home y /blog muestren los posts en distinto
 * orden). Equivale a una capa de "data fetching" en Next.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'portfolio'>;
export type Post = CollectionEntry<'blog'>;

/** Elementos por página en los listados paginados (/portfolio, /blog). */
export const PAGE_SIZE = 9;

/** Bodas, de la más reciente a la más antigua. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('portfolio');
  return projects.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Bodas marcadas como `featured`, en el mismo orden (home → "Selected work"). */
export async function getFeaturedProjects(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured);
}

/** Artículos publicados (sin borradores), del más nuevo al más viejo. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Colecciones de datos (YAML) ordenadas por su campo `order`. */
export async function getOrdered<C extends 'packages' | 'testimonials' | 'faq' | 'process'>(collection: C) {
  const entries = await getCollection(collection);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

/**
 * "March 12, 2026". Se formatea en UTC porque las fechas del frontmatter
 * (2026-03-12) se interpretan como medianoche UTC: con la zona horaria local
 * del build, en América saldría "March 11".
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/**
 * Clase de retardo para escalonar la aparición de elementos en una grilla:
 * 0 → reveal-delay-1, 1 → reveal-delay-2 … 4 → reveal-delay-1 (ciclo de 4).
 * Se devuelven clases completas para que Tailwind/el CSS las detecte.
 */
const DELAYS = ['reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4'] as const;
export function revealDelay(index: number): (typeof DELAYS)[number] {
  return DELAYS[index % DELAYS.length]!;
}
