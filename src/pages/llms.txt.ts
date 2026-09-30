/**
 * /llms.txt — índice del sitio para asistentes de IA (propuesta llmstxt.org):
 * descripción, páginas principales, bodas y artículos con su resumen.
 * Se genera desde las colecciones y src/data/site.ts, así nunca queda
 * desactualizado respecto del contenido.
 */
import type { APIRoute } from 'astro';
import { NAV, SITE } from '@/data/site';
import { getPosts, getProjects } from '@/lib/content';

export const GET: APIRoute = async () => {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const url = SITE.url;

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    `Site: ${url}`,
    `Contact: ${SITE.email}`,
    '',
    '## Pages',
    '',
    `- [Home](${url}/): Wedding photography portfolio homepage`,
    ...NAV.map((item) => `- [${item.label}](${url}${item.href}): ${item.description}`),
    '',
    '## Portfolio',
    '',
    ...projects.map((p) => `- [${p.data.couple}](${url}/portfolio/${p.id}): ${p.data.excerpt}`),
    '',
    '## Journal',
    '',
    ...posts.map((p) => `- [${p.data.title}](${url}/blog/${p.id}): ${p.data.description}`),
    '',
    '## Optional',
    '',
    `- [Full content](${url}/llms-full.txt): Extended markdown dump for AI systems`,
    `- [RSS feed](${url}/rss.xml): Blog RSS`,
    `- [Sitemap](${url}/sitemap-index.xml): XML sitemap`,
  ];

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
