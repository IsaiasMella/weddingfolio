/**
 * /llms-full.txt — volcado completo en Markdown para asistentes de IA: cada
 * boda y cada artículo con sus metadatos y el cuerpo Markdown original
 * (`entry.body`, sin renderizar). Reproduce el formato del sitio original.
 */
import type { APIRoute } from 'astro';
import { SITE } from '@/data/site';
import { getPosts, getProjects } from '@/lib/content';

/** Fecha ISO corta (2026-03-12), en UTC como el resto del sitio. */
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

export const GET: APIRoute = async () => {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const url = SITE.url;

  const sections = [
    `# ${SITE.name} — Full content`,
    `> ${SITE.description}`,
    `Generated for AI systems. Canonical site: ${url}`,
    '## Portfolio galleries',
    ...projects.map((p) =>
      [
        `### ${p.data.couple}`,
        [`URL: ${url}/portfolio/${p.id}`, `Location: ${p.data.location}`, `Date: ${isoDay(p.data.date)}`].join('\n'),
        p.data.excerpt,
        (p.body ?? '').trim(),
      ].join('\n\n'),
    ),
    '## Journal articles',
    ...posts.map((p) =>
      [
        `### ${p.data.title}`,
        [`URL: ${url}/blog/${p.id}`, `Published: ${isoDay(p.data.pubDate)}`].join('\n'),
        p.data.description,
        (p.body ?? '').trim(),
      ].join('\n\n'),
    ),
  ];

  return new Response(sections.join('\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
